const express = require('express');
const router = express.Router();
const {
  updateProfile,
  toggleAvailability,
  submitHealthCheckup,
  getPublicDonorMap,
  updateBloodBankInventory,
  getDonorImpactStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public donor map
router.get('/donor-map', getPublicDonorMap);

// Private routes
router.get('/impact-stats', protect, getDonorImpactStats);
router.put('/profile', protect, updateProfile);
router.put('/availability', protect, toggleAvailability);
router.post('/health-checkup', protect, submitHealthCheckup);
router.put('/bloodbank-inventory', protect, updateBloodBankInventory);

module.exports = router;

