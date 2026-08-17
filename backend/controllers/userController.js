const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const { geocodeAddress } = require('../utils/geocode');
const { calculatePreliminaryStatus, calculateAge } = require('../utils/eligibility');
const { calculateDonorImpact } = require('../utils/impactCalculator');
const sseService = require('../services/sseService');

// Helper to format user object
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  bloodGroup: user.bloodGroup,
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
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      bloodGroup,
      location,
      isAvailable,
      dob,
      gender,
      weight,
      hemoglobin
    } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (dob) {
      user.dob = dob;
      user.age = calculateAge(dob);
    }
    if (gender) user.gender = gender;
    if (typeof weight !== 'undefined') user.weight = Number(weight);
    if (typeof hemoglobin !== 'undefined') user.hemoglobin = hemoglobin ? Number(hemoglobin) : null;
    
    // If the location is changed, re-geocode it
    if (location && location !== user.location) {
      console.log(`Re-geocoding updated profile location: "${location}"`);
      const coords = await geocodeAddress(location);
      user.location = location;
      user.coordinates = coords;
    }

    if (typeof isAvailable !== 'undefined') {
      const oldVal = user.isAvailable;
      user.isAvailable = isAvailable;
      if (oldVal !== isAvailable) {
        user.lastAvailableChangedAt = Date.now();
      }
    }

    // Recalculate status based on current user parameters
    const statusResult = calculatePreliminaryStatus({
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
      donationType: user.donationType
    });

    user.preliminaryStatus = statusResult.status;
    user.preliminaryReasons = statusResult.reasons;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit bi-weekly 15-20 day Donor Health Checkup
 * @route   POST /api/users/health-checkup
 * @access  Private
 */
exports.submitHealthCheckup = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      weight,
      hemoglobin,
      currentHealthCondition,
      majorMedicalConditions,
      currentMedications,
      recentIllnessOrSurgery,
      recentTattooOrPiercing,
      pregnancyStatus,
      lastDonationDate,
      donationType
    } = req.body;

    if (typeof weight !== 'undefined') user.weight = Number(weight);
    if (typeof hemoglobin !== 'undefined') user.hemoglobin = hemoglobin ? Number(hemoglobin) : null;
    if (currentHealthCondition) user.currentHealthCondition = currentHealthCondition;
    
    if (typeof majorMedicalConditions !== 'undefined') {
      user.majorMedicalConditions = Array.isArray(majorMedicalConditions)
        ? majorMedicalConditions
        : [majorMedicalConditions || 'None'];
    }
    
    if (typeof currentMedications !== 'undefined') user.currentMedications = currentMedications;
    if (typeof recentIllnessOrSurgery !== 'undefined') user.recentIllnessOrSurgery = Boolean(recentIllnessOrSurgery);
    if (typeof recentTattooOrPiercing !== 'undefined') user.recentTattooOrPiercing = Boolean(recentTattooOrPiercing);
    if (pregnancyStatus) user.pregnancyStatus = pregnancyStatus;
    if (lastDonationDate) user.lastDonationDate = lastDonationDate;
    if (donationType) user.donationType = donationType;

    user.lastHealthCheckupDate = new Date();

    // Recalculate status
    const statusResult = calculatePreliminaryStatus({
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
      donationType: user.donationType
    });

    user.preliminaryStatus = statusResult.status;
    user.preliminaryReasons = statusResult.reasons;

    // Push to checkup history
    user.healthCheckupHistory.unshift({
      checkupDate: new Date(),
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
      computedStatus: statusResult.status,
      reasons: statusResult.reasons
    });

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Donor Health Checkup logged successfully!',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    console.error('Submit health checkup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle donor availability status
 * @route   PUT /api/users/availability
 * @access  Private
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isAvailable = !user.isAvailable;
    user.lastAvailableChangedAt = Date.now();

    const updatedUser = await user.save();

    // Broadcast SSE real-time event when a donor toggles availability status
    sseService.broadcastEvent('donor_status_changed', {
      donorId: updatedUser._id,
      donorName: updatedUser.name,
      bloodGroup: updatedUser.bloodGroup,
      location: updatedUser.location,
      coordinates: updatedUser.coordinates,
      isAvailable: updatedUser.isAvailable,
      preliminaryStatus: updatedUser.preliminaryStatus
    });

    res.json({
      success: true,
      isAvailable: updatedUser.isAvailable,
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get anonymized public live map pins for available/eligible donors
 * @route   GET /api/users/donor-map
 * @access  Public
 */
exports.getPublicDonorMap = async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' })
      .select('_id bloodGroup location coordinates isAvailable preliminaryStatus');
    
    // Format anonymized pins (no name, phone, or email exposed publicly for privacy)
    const mapPins = donors.map((d) => ({
      _id: d._id,
      bloodGroup: d.bloodGroup,
      location: d.location,
      coordinates: d.coordinates,
      isAvailable: d.isAvailable,
      preliminaryStatus: d.preliminaryStatus || 'Eligible'
    }));

    res.json({
      success: true,
      count: mapPins.length,
      donors: mapPins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Blood Bank unit inventory
 * @route   PUT /api/users/bloodbank-inventory
 * @access  Private
 */
exports.updateBloodBankInventory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Blood bank profile not found' });
    }

    const { availableUnits } = req.body;
    if (availableUnits) {
      user.availableUnits = {
        ...user.availableUnits,
        ...availableUnits
      };
      await user.save();
    }

    res.json({
      success: true,
      message: 'Blood bank inventory stock updated successfully!',
      availableUnits: user.availableUnits
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get donor streak, impact stats, countdown, and unlocked badges
 * @route   GET /api/users/impact-stats
 * @access  Private
 */
exports.getDonorImpactStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const completedCount = await BloodRequest.countDocuments({
      'notifiedDonors': {
        $elemMatch: {
          donorId: req.user._id,
          status: { $in: ['donated', 'confirmed', 'accepted'] }
        }
      }
    });

    const impact = calculateDonorImpact(user, completedCount);

    res.json({
      success: true,
      impact
    });
  } catch (error) {
    console.error('getDonorImpactStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

