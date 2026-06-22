const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  generateNewTrip,
  getUserTrips,
  updateTrip,
  deleteTrip,
  regenerateDay
} = require('../controllers/tripController');

router.use(protect);

router.route('/')
  .get(getUserTrips)
  .post(generateNewTrip);

router.route('/:id')
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/regenerate-day', regenerateDay);

module.exports = router;
