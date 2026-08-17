const express = require('express');
const router = express.Router();
const {
  createRequest,
  matchDonors,
  getActiveRequests,
  getMyRequests,
  getDonorNotifications,
  respondToNotification,
  getMyDonationActivities,
  getSMSSimulationLogs,
  getLiveStream
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// Request modification and match routes
router.get('/live-stream', getLiveStream);
router.post('/create', protect, createRequest);
router.post('/match', matchDonors);
router.get('/active', getActiveRequests);
router.get('/my-requests', protect, getMyRequests);
router.get('/my-donations', protect, getMyDonationActivities);
router.get('/donor-notifications', protect, getDonorNotifications);
router.post('/respond-notification', protect, respondToNotification);
router.get('/sms-simulation', getSMSSimulationLogs);

module.exports = router;

