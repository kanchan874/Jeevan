const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterPhone: {
    type: String,
    trim: true
  },
  requesterEmail: {
    type: String,
    trim: true
  },
  bloodComponent: {
    type: String,
    enum: ['Red Blood Cells', 'Whole Blood', 'Platelets', 'Plasma'],
    default: 'Red Blood Cells'
  },
  // --- LOCATION DETAILS ---
  hospitalName: {
    type: String,
    trim: true
  },
  fullAddress: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  hospitalAddress: {
    type: String,
    required: [true, 'Please add a hospital address']
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // --- BLOOD REQUIREMENT DETAILS ---
  bloodGroup: {
    type: String,
    required: [true, 'Please select a blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Please add number of units required'],
    min: [1, 'Must require at least 1 unit']
  },
  urgency: {
    type: String,
    default: 'Medium'
  },
  // --- TIMING DETAILS ---
  requiredDate: {
    type: Date,
    default: Date.now
  },
  requiredTime: {
    type: String,
    default: 'Anytime'
  },
  // --- PATIENT DETAILS ---
  patientName: {
    type: String,
    trim: true,
    default: 'Anonymous Patient'
  },
  patientAge: {
    type: Number
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  diseaseReason: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'expired', 'cancelled'],
    default: 'pending'
  },
  notifiedDonors: [
    {
      donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      aiMatchScore: {
        type: Number,
        default: 85
      },
      status: {
        type: String,
        enum: ['pending', 'contacted', 'committed', 'confirmed', 'donated', 'cancelled'],
        default: 'pending'
      },
      respondedAt: {
        type: Date
      },
      responseNotes: {
        type: String
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
