const Trip = require('../models/Trip');

// Retry helper: retries up to 5 times with exponential backoff (1s, 2s, 4s, 8s, 16s)
async function fetchWithRetry(url, options, maxRetries = 5) {
  let delay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If rate-limited (429) and we have retries left, wait and try again
      if (response.status === 429 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Gemini API error: Status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) throw error;

      // Otherwise wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// Helper: recalculate total activity costs and overall budget
function recalculateActivityBudget(itinerary, currentBudget) {
  let totalActivitiesCost = 0;
  itinerary.forEach(day => {
    day.activities.forEach(act => {
      totalActivitiesCost += act.estimatedCostUSD || 0;
    });
  });
  return {
    ...currentBudget,
    activities: totalActivitiesCost,
    total: currentBudget.transport + currentBudget.accommodation + currentBudget.food + totalActivitiesCost
  };
}

// Generate new trip using Google Gemini API
exports.generateNewTrip = async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id; // Populated from auth middleware

  if (!destination || !durationDays || !budgetTier) {
    return res.status(400).json({ message: 'Destination, duration, and budget tier are required' });
  }

  const prompt = `
    Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
    Budget preference is ${budgetTier}. Interests are: ${(interests || []).join(', ')}.

    You must output ONLY a valid JSON object matching this structure:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "activities": [
            { "title": "Activity name", "description": "Brief text details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
          ]
        }
      ],
      "hotels": [
        { "name": "Recommended Hotel", "tier": "Budget", "estimatedCostNightUSD": 85, "rating": "4.5/5" },
        { "name": "Recommended Hotel", "tier": "Budget", "estimatedCostNightUSD": 85, "rating": "4.5/5" },
         ......
      ],
      "estimatedBudget": {
        "transport": 120,
        "accommodation": 300,
        "food": 150,
        "activities": 100,
        "total": 670
      },
      "packingList": [
        { "item": "Passport", "category": "Documents", "isPacked": false },
        { "item": "Weather-aware clothing item", "category": "Clothing", "isPacked": false }
      ]
    }
    
    Ensure that:
    1. The "itinerary" array has exactly ${durationDays} days.
    2. The budget estimates match realistic rates for the destination and ${budgetTier} budget tier.
    3. The packingList has at least 8 custom items, split into categories: 'Documents', 'Clothing', 'Gear', and 'Other' (such that item.category is one of those exact strings).
    4. The packingList items are specific to the typical weather/climate at the destination and the activities/interests specified.
    5. The "hotels" array must contain at least 3 hotel recommendations suitable for the selected budget tier.
    
    IMPORTANT - STRICT VALIDATION RULES (DO NOT VIOLATE):

    For EVERY activity, the "timeOfDay" field MUST be EXACTLY ONE of the following three strings:

    - "Morning"
    - "Afternoon"
    - "Evening"

    These are the ONLY allowed values.

    DO NOT use:
    - Full-Day
    - All Day
    - Morning & Afternoon
    - Afternoon & Evening
    - Morning & Evening
    - Late Morning
    - Late Afternoon
    - Early Morning
    - Night
    - Late Night
    - Noon
    - Anytime
    - Flexible
    - Entire Day
    - Any other variation

    Each activity must belong to ONLY ONE time slot. Never combine multiple time slots.

    If an activity naturally spans multiple periods, choose the single most appropriate value from:
    "Morning", "Afternoon", or "Evening".

    Your output will be rejected if any other value is used.
    
    Make sure you return only the JSON object and no surrounding markdown tags or codeblock tags, just plain valid JSON.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = JSON.parse(parsedResponseText);

    // Save user isolated trip directly into MongoDB
    const newTrip = new Trip({
      userId,
      destination,
      durationDays: parseInt(durationDays),
      budgetTier,
      interests: interests || [],
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList
    });

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);

  } catch (error) {
    console.error("Trip generation error:", error);
    return res.status(500).json({ message: "Failed to generate trip. Please try again." });
  }
};

// Retrieve trips for authenticated user
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Fetch trips error:', error);
    res.status(500).json({ message: 'Server error retrieving trips' });
  }
};

// Update an existing trip (full payload updates for itinerary or packing list checks)
exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    // Update fields allowed
    if (req.body.itinerary) trip.itinerary = req.body.itinerary;
    if (req.body.packingList) trip.packingList = req.body.packingList;
    if (req.body.estimatedBudget) trip.estimatedBudget = req.body.estimatedBudget;

    const savedTrip = await trip.save();
    res.json(savedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Server error updating trip' });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const trip = await Trip.findOneAndDelete({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
};

// Regenerate a specific day's activities in itinerary
exports.regenerateDay = async (req, res) => {
  const { id } = req.params;
  const { dayNumber, instructions } = req.body;
  const userId = req.user.id;

  if (!dayNumber || !instructions) {
    return res.status(400).json({ message: 'Day number and instructions are required' });
  }

  try {
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    const prompt = `
      You are an expert travel planner. The traveler has an itinerary for a trip to ${trip.destination}.
      They want to completely regenerate the activities for Day ${dayNumber} based on these instructions: "${instructions}".
      The overall trip interests are: ${trip.interests.join(', ')} and the budget preference is ${trip.budgetTier}.

      You must output ONLY a valid JSON object matching this structure:
      {
        "activities": [
          { "title": "Activity name", "description": "Brief text details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
        ]
      }

      Ensure:
      1. Cost estimates match the ${trip.budgetTier} budget tier.
      2. The output is strictly a valid JSON object and contains nothing else.
      3. For EVERY activity, the "timeOfDay" field MUST be EXACTLY ONE of these values:
        - "Morning"
        - "Afternoon"
        - "Evening"

      4. Do NOT use values such as:
        - Full-Day
        - Morning & Afternoon
        - Afternoon & Evening
        - Morning & Evening
        - Late Morning
        - Late Afternoon
        - Early Morning
        - Night
        - Late Night
        - Noon
        - Anytime
        - All Day
        - Any other variation

      5. Every activity must belong to ONLY ONE time slot. If an activity could fit multiple periods, choose the single most appropriate value from "Morning", "Afternoon", or "Evening".
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = JSON.parse(parsedResponseText);

    // Find the day to update
    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIndex === -1) {
      return res.status(400).json({ message: `Day ${dayNumber} not found in itinerary.` });
    }

    // Update activities
    trip.itinerary[dayIndex].activities = cleanResult.activities;

    // Recalculate budget after updating activities
    const updatedBudget = recalculateActivityBudget(trip.itinerary, trip.estimatedBudget);
    trip.estimatedBudget = updatedBudget;

    const savedTrip = await trip.save();
    return res.json(savedTrip);

  } catch (error) {
    console.error("Day regeneration error:", error);
    return res.status(500).json({ message: "Failed to regenerate that day. Please try again." });
  }
};
