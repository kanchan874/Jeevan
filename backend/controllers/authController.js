const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwtConfig');
const { geocodeAddress } = require('../utils/geocode');
const { calculatePreliminaryStatus, calculateAge } = require('../utils/eligibility');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '30d'
  });
};

// Helper to format user response consistently
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  isMobileVerified: Boolean(user.isMobileVerified),
  role: user.role || 'donor',
  hospitalName: user.hospitalName,
  registrationNumber: user.registrationNumber,
  emergencyContactPerson: user.emergencyContactPerson,
  department: user.department,
  bloodBankName: user.bloodBankName,
  licenseNumber: user.licenseNumber,
  operatingHours: user.operatingHours,
  availableUnits: user.availableUnits || {
    'A+': 12, 'A-': 4, 'B+': 15, 'B-': 5, 'O+': 18, 'O-': 7, 'AB+': 8, 'AB-': 3
  },
  bloodGroup: user.bloodGroup || 'O+',
  location: user.location,
  coordinates: user.coordinates,
  isAvailable: user.isAvailable,
  dob: user.dob,
  age: user.age,
  gender: user.gender,
  weight: user.weight,
  hemoglobin: user.hemoglobin,
  currentHealthCondition: user.currentHealthCondition,
  majorMedicalConditions: user.majorMedicalConditions,
  currentMedications: user.currentMedications,
  recentIllnessOrSurgery: user.recentIllnessOrSurgery,
  recentTattooOrPiercing: user.recentTattooOrPiercing,
  pregnancyStatus: user.pregnancyStatus,
  lastDonationDate: user.lastDonationDate,
  donationType: user.donationType,
  lastHealthCheckupDate: user.lastHealthCheckupDate,
  preliminaryStatus: user.preliminaryStatus,
  preliminaryReasons: user.preliminaryReasons,
  healthCheckupHistory: user.healthCheckupHistory || []
});

/**
 * @desc    Register a new user with donor eligibility screening / role details
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      hospitalName,
      registrationNumber,
      emergencyContactPerson,
      department,
      bloodBankName,
      licenseNumber,
      operatingHours,
      availableUnits,
      bloodGroup,
      location,
      googleId,
      googleEmail,
      dob,
      age,
      gender,
      weight,
      hemoglobin,
      currentHealthCondition,
      majorMedicalConditions,
      currentMedications,
      recentIllnessOrSurgery,
      recentTattooOrPiercing,
      pregnancyStatus,
      lastDonationDate,
      donationType,
      isMobileVerified
    } = req.body;

    if (!googleId) {
      return res.status(400).json({ success: false, message: 'Google Identity Verification is required to complete registration.' });
    }

    if (email.toLowerCase() !== googleEmail.toLowerCase()) {
      return res.status(400).json({ success: false, message: `Verification failed: Registered email (${email}) does not match Google account (${googleEmail}).` });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account already exists with this email address.' });
    }

    const cleanPhone = phone ? phone.replace(/^\+?91/, '').trim() : '';
    const phoneExists = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` },
        { phone: `91${cleanPhone}` }
      ]
    });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'This mobile number is already registered to another account. Fake/duplicate accounts are not permitted.' });
    }

    // Geocode location string to coordinates
    console.log(`Geocoding registered location: "${location}"`);
    const coordinates = await geocodeAddress(location);

    // Calculate donor preliminary status
    const computedAge = dob ? calculateAge(dob) : (age ? Number(age) : 25);
    const eligibilityResult = calculatePreliminaryStatus({
      dob,
      age: computedAge,
      gender: gender || 'Male',
      weight: weight || 65,
      hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      currentHealthCondition: currentHealthCondition || 'Healthy',
      majorMedicalConditions: majorMedicalConditions || ['None'],
      currentMedications: currentMedications || 'None',
      recentIllnessOrSurgery: Boolean(recentIllnessOrSurgery),
      recentTattooOrPiercing: Boolean(recentTattooOrPiercing),
      pregnancyStatus: pregnancyStatus || 'Not Applicable',
      lastDonationDate,
      donationType: donationType || 'First-Time Donor'
    });

    const initialCheckup = {
      checkupDate: new Date(),
      weight: weight || 65,
      hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      currentHealthCondition: currentHealthCondition || 'Healthy',
      majorMedicalConditions: Array.isArray(majorMedicalConditions) ? majorMedicalConditions : [majorMedicalConditions || 'None'],
      currentMedications: currentMedications || 'None',
      recentIllnessOrSurgery: Boolean(recentIllnessOrSurgery),
      recentTattooOrPiercing: Boolean(recentTattooOrPiercing),
      pregnancyStatus: pregnancyStatus || 'Not Applicable',
      lastDonationDate: lastDonationDate || null,
      donationType: donationType || 'First-Time Donor',
      computedStatus: eligibilityResult.status,
      reasons: eligibilityResult.reasons
    };

    // Create user
    const user = await User.create({
      name: name || hospitalName || bloodBankName || 'User',
      email,
      password,
      phone,
      role: role || 'donor',
      hospitalName,
      registrationNumber,
      emergencyContactPerson,
      department,
      bloodBankName,
      licenseNumber,
      operatingHours,
      availableUnits: availableUnits || {
        'A+': 12, 'A-': 4, 'B+': 15, 'B-': 5, 'O+': 18, 'O-': 7, 'AB+': 8, 'AB-': 3
      },
      bloodGroup: bloodGroup || 'O+',
      location,
      coordinates,
      googleId,
      isMobileVerified: Boolean(isMobileVerified),
      dob: dob || null,
      age: computedAge,
      gender: gender || 'Male',
      weight: weight || 65,
      hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      currentHealthCondition: currentHealthCondition || 'Healthy',
      majorMedicalConditions: Array.isArray(majorMedicalConditions) ? majorMedicalConditions : [majorMedicalConditions || 'None'],
      currentMedications: currentMedications || 'None',
      recentIllnessOrSurgery: Boolean(recentIllnessOrSurgery),
      recentTattooOrPiercing: Boolean(recentTattooOrPiercing),
      pregnancyStatus: pregnancyStatus || 'Not Applicable',
      lastDonationDate: lastDonationDate || null,
      donationType: donationType || 'First-Time Donor',
      lastHealthCheckupDate: new Date(),
      preliminaryStatus: eligibilityResult.status,
      preliminaryReasons: eligibilityResult.reasons,
      healthCheckupHistory: [initialCheckup]
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bypass / Mock Google Login for prototype demonstration
 * @route   POST /api/auth/google/mock
 * @access  Public
 */
exports.mockGoogleLogin = async (req, res) => {
  try {
    const isMockAllowed = process.env.ALLOW_MOCK_AUTH === 'true' || process.env.NODE_ENV !== 'production';
    if (!isMockAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Mock Google Login is disabled in production. Please use real Passport Google OAuth.'
      });
    }

    const { googleId, name, email } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'Google ID and Email are required for mock authentication' });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        const eligibilityResult = calculatePreliminaryStatus({
          age: 28,
          gender: 'Male',
          weight: 70,
          currentHealthCondition: 'Healthy'
        });

        user = await User.create({
          googleId,
          name: name || 'Google User',
          email,
          phone: '9999999999',
          bloodGroup: 'O+',
          location: 'T Nagar, Chennai',
          coordinates: { lat: 13.0405, lng: 80.2337 },
          isAvailable: true,
          age: 28,
          gender: 'Male',
          weight: 70,
          currentHealthCondition: 'Healthy',
          majorMedicalConditions: ['None'],
          currentMedications: 'None',
          lastHealthCheckupDate: new Date(),
          preliminaryStatus: eligibilityResult.status,
          preliminaryReasons: eligibilityResult.reasons,
          healthCheckupHistory: [{
            checkupDate: new Date(),
            weight: 70,
            currentHealthCondition: 'Healthy',
            computedStatus: eligibilityResult.status,
            reasons: eligibilityResult.reasons
          }]
        });
      }
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Mock Google Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: formatUserResponse(user)
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
