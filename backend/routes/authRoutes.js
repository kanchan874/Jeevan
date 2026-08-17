const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  mockGoogleLogin,
  getUserProfile
} = require('../controllers/authController');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const { sendOTP, verifyOTP } = require('../services/msg91');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google/mock', mockGoogleLogin);

/**
 * @desc    Send OTP to user's mobile number via MSG91 (or Mock Mode)
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/^91/, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      });
    }

    const cleanMobile = mobile.replace(/^\+?91/, '').trim();

    // Prevent duplicate / fake accounts by verifying phone uniqueness upfront
    const existingUser = await User.findOne({
      $or: [
        { phone: cleanMobile },
        { phone: `+91${cleanMobile}` },
        { phone: `91${cleanMobile}` }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered to an existing donor account. Fake/duplicate accounts are not permitted.'
      });
    }

    const result = await sendOTP(cleanMobile);

    res.json({
      success: true,
      message: result.message || 'OTP sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch OTP'
    });
  }
});

/**
 * @desc    Verify OTP for user's mobile number via MSG91 (or Mock Mode)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Mobile number and OTP are required for verification.'
      });
    }

    const cleanMobile = mobile.replace(/^91/, '');
    const result = await verifyOTP(cleanMobile, otp);

    if (result.verified) {
      return res.json({
        success: true,
        verified: true,
        message: result.message || 'Mobile number verified successfully'
      });
    }

    return res.status(400).json({
      success: false,
      verified: false,
      message: result.message || 'Invalid or expired OTP'
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: error.message || 'OTP verification failed'
    });
  }
});

// Private profile route
router.get('/profile', protect, getUserProfile);

module.exports = router;
