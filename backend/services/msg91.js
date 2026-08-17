const axios = require('axios');

// In-memory mock OTP storage for local development/testing without live credentials
// Structure: { [mobileNumber]: { otp: string, expiresAt: number, attempts: number } }
const mockOtpStore = new Map();

/**
 * Clean up expired mock OTPs periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [mobile, data] of mockOtpStore.entries()) {
    if (data.expiresAt < now) {
      mockOtpStore.delete(mobile);
    }
  }
}, 60000);

/**
 * Check if MSG91 is configured with valid credentials
 */
const isMsg91Configured = () => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  return Boolean(
    authKey &&
    templateId &&
    authKey !== 'your_msg91_auth_key' &&
    templateId !== 'your_template_id'
  );
};

/**
 * Send 6-digit OTP to mobile number via MSG91 or Mock Fallback
 * @param {string} mobile 10-digit mobile number
 */
const sendOTP = async (mobile) => {
  const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
  const cleanMobile = mobile.replace(/^91/, '');

  if (isMsg91Configured()) {
    try {
      console.log(`[MSG91 API] Dispatching OTP to +${formattedMobile}...`);
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {},
        {
          params: {
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: formattedMobile,
            authkey: process.env.MSG91_AUTH_KEY,
            otp_expiry: 5, // 5 minutes
            otp_length: 6
          }
        }
      );
      if (response.data && (response.data.type === 'success' || response.data.message === 'OTP sent successfully')) {
        return response.data;
      }
    } catch (error) {
      console.error('[MSG91 API Error]', error.response?.data || error.message);
      console.log(`[MSG91 Service] Live dispatch failed. Falling back to Mock OTP Service for local testing...`);
    }
  }

  // --- MOCK FALLBACK MODE ---
  console.log(`[MSG91 Service] Live key not set. Using In-Memory Mock OTP Service.`);
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  mockOtpStore.set(cleanMobile, {
    otp: generatedOtp,
    expiresAt,
    attempts: 0
  });

  console.log(`=======================================================`);
  console.log(`📱 [MOCK OTP GENERATED] Mobile: +91 ${cleanMobile}`);
  console.log(`🔑 [MOCK OTP CODE]: ${generatedOtp} (or test code 123456)`);
  console.log(`⏱️ [EXPIRATION]: 5 minutes`);
  console.log(`=======================================================`);

  return {
    type: 'success',
    message: 'OTP sent successfully (Mock Mode)',
    mockOtp: generatedOtp,
    isMock: true
  };
};

/**
 * Verify 6-digit OTP for mobile number via MSG91 or Mock Fallback
 * @param {string} mobile 10-digit mobile number
 * @param {string} otp 6-digit OTP code
 */
const verifyOTP = async (mobile, otp) => {
  const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
  const cleanMobile = mobile.replace(/^91/, '');

  if (isMsg91Configured()) {
    try {
      console.log(`[MSG91 API] Verifying OTP for +${formattedMobile}...`);
      const response = await axios.get(
        'https://control.msg91.com/api/v5/otp/verify',
        {
          params: {
            mobile: formattedMobile,
            otp: otp
          },
          headers: {
            authkey: process.env.MSG91_AUTH_KEY
          }
        }
      );

      const isSuccess =
        response.data.message === 'OTP verified success' ||
        response.data.type === 'success';

      return {
        success: isSuccess,
        verified: isSuccess,
        message: response.data.message || (isSuccess ? 'OTP verified successfully' : 'OTP verification failed'),
        data: response.data
      };
    } catch (error) {
      console.error('[MSG91 Verify Error]', error.response?.data || error.message);
      return {
        success: false,
        verified: false,
        message: error.response?.data?.message || 'Invalid or expired OTP'
      };
    }
  }

  // --- MOCK FALLBACK VERIFICATION ---
  const storedData = mockOtpStore.get(cleanMobile);
  const isDevEnvironment = process.env.NODE_ENV !== 'production';

  // Allow default test OTP code 123456 only in non-production environments
  const isTestOtpValid = isDevEnvironment && otp === '123456';
  const isGeneratedOtpValid = Boolean(storedData && storedData.otp === otp.toString().trim());

  if (isTestOtpValid || isGeneratedOtpValid) {
    if (storedData && Date.now() > storedData.expiresAt) {
      mockOtpStore.delete(cleanMobile);
      return {
        success: false,
        verified: false,
        message: 'OTP has expired (5 minute limit). Please request a new OTP.'
      };
    }

    mockOtpStore.delete(cleanMobile);
    return {
      success: true,
      verified: true,
      message: 'Mobile number verified successfully (Mock Mode)'
    };
  }

  if (storedData) {
    storedData.attempts += 1;
    if (storedData.attempts >= 5) {
      mockOtpStore.delete(cleanMobile);
      return {
        success: false,
        verified: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }
  }

  return {
    success: false,
    verified: false,
    message: isDevEnvironment
      ? 'Invalid OTP entered. Please check and try again (or use test OTP: 123456 in dev).'
      : 'Invalid OTP entered. Please check and try again.'
  };
};

module.exports = {
  sendOTP,
  verifyOTP
};
