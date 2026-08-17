const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocode');
const { sendSMS, getSimulatedLogs } = require('../utils/smsService');
const { calculateAIMatchScore } = require('../utils/aiMatching');
const sseService = require('../services/sseService');

// Blood Compatibility Matrix: Who can donate to a patient of blood type X
const getCompatibleDonorGroups = (patientGroup) => {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], // Universal Recipient
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'] // Universal Donor
  };
  return compatibility[patientGroup] || [patientGroup];
};

// Haversine formula to calculate distance between two coordinates in Kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // Round to 2 decimal places
};

// Helper to pre-generate WhatsApp Click-to-Chat links
const generateWhatsAppLink = (phone, donorName, bloodGroup, hospitalAddress) => {
  const message = `Hi ${donorName}, I urgently need ${bloodGroup} blood at ${hospitalAddress}. Can you help? (Sent via Jeevan App)`;
  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * @desc    Create a new blood request, find matches via AI engine, and trigger alerts
 * @route   POST /api/requests/create
 * @access  Private
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      hospitalAddress,
      hospitalName,
      fullAddress,
      city,
      district,
      requesterPhone,
      requesterEmail,
      bloodComponent,
      unitsRequired,
      urgency,
      requiredDate,
      requiredTime,
      patientAge,
      patientGender,
      diseaseReason,
      additionalNotes
    } = req.body;

    const fullHospitalLocation = hospitalAddress || `${hospitalName || ''} ${fullAddress || ''} ${city || ''} ${district || ''}`.trim() || 'Emergency Center';

    if (!bloodGroup || !unitsRequired) {
      return res.status(400).json({ success: false, message: 'Please select blood group and units required.' });
    }

    // Geocode hospital address to coordinates
    console.log(`Geocoding hospital address: "${fullHospitalLocation}"`);
    const hospitalCoords = await geocodeAddress(fullHospitalLocation);

    // Find compatible donors in database who are available AND eligible
    const donorGroups = getCompatibleDonorGroups(bloodGroup);
    const availableDonors = await User.find({
      bloodGroup: { $in: donorGroups },
      isAvailable: true,
      preliminaryStatus: 'Eligible', // HARD FILTER: Exclude Deferred/Review donors
      _id: { $ne: req.user._id } // Exclude the requester themselves
    });

    // Calculate distance and AI match scores
    let matchedDonors = availableDonors.map((donor) => {
      const distance = calculateDistance(
        donor.coordinates.lat,
        donor.coordinates.lng,
        hospitalCoords.lat,
        hospitalCoords.lng
      );

      const aiResult = calculateAIMatchScore(donor, distance, bloodGroup);
      const waLink = generateWhatsAppLink(donor.phone, donor.name, bloodGroup, hospitalAddress);
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalAddress)}`;

      return {
        _id: donor._id,
        name: donor.name,
        phone: donor.phone,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        distance,
        aiMatchScore: aiResult.score,
        aiMatchBreakdown: aiResult.breakdown,
        aiMatchReasons: aiResult.reasons,
        preliminaryStatus: donor.preliminaryStatus,
        lastAvailableChangedAt: donor.lastAvailableChangedAt,
        whatsappLink: waLink,
        mapLink
      };
    });

    // Sort by AI Match Score descending, then distance ascending
    matchedDonors.sort((a, b) => b.aiMatchScore - a.aiMatchScore || a.distance - b.distance);

    // Prepare notified donors list for top matches
    const topMatches = matchedDonors.slice(0, 5);
    const notifiedDonorsPayload = topMatches.map((d) => ({
      donorId: d._id,
      aiMatchScore: d.aiMatchScore,
      status: 'pending'
    }));

    // Create Blood Request in database
    const request = await BloodRequest.create({
      requesterId: req.user._id,
      requesterPhone: requesterPhone || req.user.phone,
      requesterEmail: requesterEmail || req.user.email,
      bloodComponent: bloodComponent || 'Red Blood Cells',
      hospitalName,
      fullAddress,
      city,
      district,
      patientName: patientName || 'Anonymous Patient',
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender: patientGender || 'Male',
      diseaseReason,
      additionalNotes,
      requiredDate: requiredDate || new Date(),
      requiredTime: requiredTime || 'Anytime',
      bloodGroup,
      hospitalAddress: fullHospitalLocation,
      coordinates: hospitalCoords,
      unitsRequired: Number(unitsRequired),
      urgency: urgency || 'Medium',
      notifiedDonors: notifiedDonorsPayload
    });

    // Automatically trigger simulated/real SMS alerts to top 3 matched donors
    const topDonors = matchedDonors.slice(0, 3);
    for (const donor of topDonors) {
      const smsBody = `EMERGENCY: Hi ${donor.name}, ${unitsRequired} units of ${bloodGroup} blood are urgently needed for patient ${patientName} at ${hospitalAddress} (${donor.distance} km away, ${donor.aiMatchScore}% AI Match). Can you donate? Contact requester or reply via Jeevan App.`;
      
      sendSMS(donor.phone, smsBody).catch((err) =>
        console.error(`Failed to send fallback SMS to ${donor.name}:`, err.message)
      );
    }

    // Broadcast real-time SSE event for newly created emergency request
    sseService.broadcastEvent('emergency_request_created', {
      requestId: request._id,
      bloodGroup: request.bloodGroup,
      unitsRequired: request.unitsRequired,
      urgency: request.urgency,
      hospitalAddress: request.hospitalAddress,
      patientName: request.patientName
    });

    res.status(201).json({
      success: true,
      request,
      matchedDonors
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Find matching donors for a manual lookup
 * @route   POST /api/requests/match
 * @access  Public
 */
exports.matchDonors = async (req, res) => {
  try {
    const { bloodGroup, hospitalAddress } = req.body;

    if (!bloodGroup || !hospitalAddress) {
      return res.status(400).json({ success: false, message: 'Please provide bloodGroup and hospitalAddress' });
    }

    const hospitalCoords = await geocodeAddress(hospitalAddress);
    const donorGroups = getCompatibleDonorGroups(bloodGroup);

    const availableDonors = await User.find({
      bloodGroup: { $in: donorGroups },
      isAvailable: true,
      preliminaryStatus: 'Eligible' // HARD FILTER: Exclude Deferred/Review donors
    });

    const maskPhone = (phone) => {
      if (!phone) return '98****1234';
      const clean = phone.replace(/\D/g, '');
      if (clean.length < 10) return '98****1234';
      return `${clean.slice(0, 2)}****${clean.slice(-4)}`;
    };

    let matchedDonors = availableDonors.map((donor) => {
      const distance = calculateDistance(
        donor.coordinates.lat,
        donor.coordinates.lng,
        hospitalCoords.lat,
        hospitalCoords.lng
      );

      const maskedPhoneNumber = maskPhone(donor.phone);
      const waLink = generateWhatsAppLink(maskedPhoneNumber, donor.name, bloodGroup, hospitalAddress);
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalAddress)}`;

      return {
        _id: donor._id,
        name: donor.name,
        phone: maskedPhoneNumber, // Privacy Masking on public route
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        distance,
        lastAvailableChangedAt: donor.lastAvailableChangedAt,
        whatsappLink: waLink,
        mapLink
      };
    });

    // Sort by proximity
    matchedDonors.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      hospitalCoords,
      matchedDonors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get active requests (under 24 hours TTL, handled by mongo, status pending)
 * @route   GET /api/requests/active
 * @access  Public
 */
exports.getActiveRequests = async (req, res) => {
  try {
    const maskPhone = (phone) => {
      if (!phone) return '98****1234';
      const clean = phone.replace(/\D/g, '');
      if (clean.length < 10) return '98****1234';
      return `${clean.slice(0, 2)}****${clean.slice(-4)}`;
    };

    const rawRequests = await BloodRequest.find({ status: 'pending' })
      .populate('requesterId', 'name phone')
      .sort({ createdAt: -1 });

    const requests = rawRequests.map((reqItem) => {
      const item = reqItem.toObject();
      item.requesterPhone = maskPhone(item.requesterPhone);
      if (item.requesterId && item.requesterId.phone) {
        item.requesterId.phone = maskPhone(item.requesterId.phone);
      }
      return item;
    });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get logged in user's request history
 * @route   GET /api/requests/my-requests
 * @access  Private
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get incoming AI matched blood requests assigned to logged in donor
 * @route   GET /api/requests/donor-notifications
 * @access  Private
 */
exports.getDonorNotifications = async (req, res) => {
  try {
    const donorId = req.user._id;

    // Find all pending blood requests where notifiedDonors contains this donor
    const requests = await BloodRequest.find({
      'notifiedDonors.donorId': donorId,
      status: 'pending'
    })
      .populate('requesterId', 'name phone email role hospitalName')
      .sort({ createdAt: -1 });

    const notifications = requests.map((reqItem) => {
      const match = reqItem.notifiedDonors.find((n) => n.donorId.toString() === donorId.toString());

      // Calculate distance if coordinates present
      let distanceKm = 3.5;
      if (req.user.coordinates && reqItem.coordinates) {
        distanceKm = calculateDistance(
          req.user.coordinates.lat,
          req.user.coordinates.lng,
          reqItem.coordinates.lat,
          reqItem.coordinates.lng
        );
      }

      return {
        _id: reqItem._id,
        patientName: reqItem.patientName,
        bloodGroup: reqItem.bloodGroup,
        hospitalAddress: reqItem.hospitalAddress,
        unitsRequired: reqItem.unitsRequired,
        urgency: reqItem.urgency || 'Urgent',
        createdAt: reqItem.createdAt,
        requester: reqItem.requesterId,
        aiMatchScore: match ? match.aiMatchScore : 88,
        responseStatus: match ? match.status : 'pending',
        distanceKm,
        whatsappLink: generateWhatsAppLink(
          reqItem.requesterId?.phone || '9999999999',
          req.user.name,
          reqItem.bloodGroup,
          reqItem.hospitalAddress
        )
      };
    });

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('getDonorNotifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Donor responds (accepts / declines) to an incoming request notification
 * @route   POST /api/requests/respond-notification
 * @access  Private
 */
exports.respondToNotification = async (req, res) => {
  try {
    const { requestId, action, notes } = req.body;
    const donorId = req.user._id;

    if (!requestId || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid request or action' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    let matchFound = false;
    request.notifiedDonors = request.notifiedDonors.map((item) => {
      if (item.donorId.toString() === donorId.toString()) {
        matchFound = true;
        return {
          ...item.toObject(),
          status: action === 'accept' ? 'accepted' : 'declined',
          respondedAt: new Date(),
          responseNotes: notes || ''
        };
      }
      return item;
    });

    if (!matchFound) {
      request.notifiedDonors.push({
        donorId,
        aiMatchScore: 90,
        status: action === 'accept' ? 'accepted' : 'declined',
        respondedAt: new Date(),
        responseNotes: notes || ''
      });
    }

    await request.save();

    res.json({
      success: true,
      message: action === 'accept' ? 'Thank you! Your acceptance has been logged and shared with the recipient.' : 'Notification declined.',
      request
    });
  } catch (error) {
    console.error('respondToNotification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Get logged in user's donation activities (Committed, Contacted, Confirmed, Donated, Cancelled)
 * @route   GET /api/requests/my-donations
 * @access  Private
 */
exports.getMyDonationActivities = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find requests where logged in user is in notifiedDonors or has an activity
    const requests = await BloodRequest.find({
      'notifiedDonors.donorId': userId
    })
      .populate('requesterId', 'name phone email location')
      .sort({ createdAt: -1 });

    const activities = [];
    const counts = {
      all: 0,
      committed: 0,
      contacted: 0,
      confirmed: 0,
      donated: 0,
      cancelled: 0
    };

    requests.forEach((reqItem) => {
      const entry = reqItem.notifiedDonors.find((n) => n.donorId.toString() === userId.toString());
      if (entry) {
        const rawStatus = (entry.status || 'pending').toLowerCase();
        let normalizedStatus = 'contacted';
        if (rawStatus === 'accepted' || rawStatus === 'committed') normalizedStatus = 'committed';
        else if (rawStatus === 'confirmed') normalizedStatus = 'confirmed';
        else if (rawStatus === 'donated') normalizedStatus = 'donated';
        else if (rawStatus === 'declined' || rawStatus === 'cancelled') normalizedStatus = 'cancelled';
        else if (rawStatus === 'pending') normalizedStatus = 'contacted';

        counts.all += 1;
        if (counts[normalizedStatus] !== undefined) {
          counts[normalizedStatus] += 1;
        }

        activities.push({
          _id: reqItem._id,
          requestId: reqItem._id,
          patientName: reqItem.patientName,
          bloodGroup: reqItem.bloodGroup,
          bloodComponent: reqItem.bloodComponent || 'Red Blood Cells',
          hospitalName: reqItem.hospitalName || reqItem.hospitalAddress,
          hospitalAddress: reqItem.hospitalAddress,
          unitsRequired: reqItem.unitsRequired,
          urgency: reqItem.urgency,
          requiredDate: reqItem.requiredDate,
          requesterName: reqItem.requesterId?.name || 'Patient Family',
          requesterPhone: reqItem.requesterPhone || reqItem.requesterId?.phone,
          status: normalizedStatus,
          statusLabel: normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1),
          updatedAt: entry.respondedAt || reqItem.createdAt
        });
      }
    });

    res.json({
      success: true,
      counts,
      activities
    });
  } catch (error) {
    console.error('getMyDonationActivities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get list of simulated SMS sent (dev demonstration only)
 * @route   GET /api/requests/sms-simulation
 * @access  Public
 */
exports.getSMSSimulationLogs = (req, res) => {
  res.json({
    success: true,
    logs: getSimulatedLogs()
  });
};

/**
 * @desc    Establish SSE real-time event stream
 * @route   GET /api/requests/live-stream
 * @access  Public
 */
exports.getLiveStream = (req, res) => {
  sseService.addClient(req, res);
};
