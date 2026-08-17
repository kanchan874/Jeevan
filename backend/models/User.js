const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    minlength: 6,
    select: false // Exclude from queries by default
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit Indian phone number']
  },
  role: {
    type: String,
    enum: ['donor', 'hospital', 'bloodbank'],
    default: 'donor'
  },
  // --- HOSPITAL ROLE SPECIFIC FIELDS ---
  hospitalName: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  emergencyContactPerson: { type: String, trim: true },
  department: { type: String, trim: true },

  // --- BLOOD BANK ROLE SPECIFIC FIELDS ---
  bloodBankName: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  operatingHours: { type: String, default: '24/7 Emergency' },
  availableUnits: {
    'A+': { type: Number, default: 12 },
    'A-': { type: Number, default: 4 },
    'B+': { type: Number, default: 15 },
    'B-': { type: Number, default: 5 },
    'O+': { type: Number, default: 18 },
    'O-': { type: Number, default: 7 },
    'AB+': { type: Number, default: 8 },
    'AB-': { type: Number, default: 3 }
  },

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    default: 'O+'
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastAvailableChangedAt: {
    type: Date,
    default: Date.now
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  // --- DONOR ELIGIBILITY & HEALTH CHECKUP FIELDS ---
  dob: {
    type: Date
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  weight: {
    type: Number // in kg
  },
  hemoglobin: {
    type: Number // in g/dL
  },
  currentHealthCondition: {
    type: String,
    default: 'Healthy'
  },
  majorMedicalConditions: {
    type: [String],
    default: ['None']
  },
  currentMedications: {
    type: String,
    default: 'None'
  },
  recentIllnessOrSurgery: {
    type: Boolean,
    default: false
  },
  recentTattooOrPiercing: {
    type: Boolean,
    default: false
  },
  pregnancyStatus: {
    type: String,
    enum: ['Not Applicable', 'No', 'Currently Pregnant / Breastfeeding'],
    default: 'Not Applicable'
  },
  lastDonationDate: {
    type: Date
  },
  donationType: {
    type: String,
    enum: ['First-Time Donor', 'Whole Blood', 'Platelets', 'Plasma'],
    default: 'First-Time Donor'
  },
  lastHealthCheckupDate: {
    type: Date,
    default: Date.now
  },
  preliminaryStatus: {
    type: String,
    enum: ['Eligible', 'Temporarily Deferred', 'Needs Medical Review'],
    default: 'Eligible'
  },
  preliminaryReasons: {
    type: [String],
    default: []
  },
  healthCheckupHistory: [
    {
      checkupDate: { type: Date, default: Date.now },
      weight: Number,
      hemoglobin: Number,
      currentHealthCondition: String,
      majorMedicalConditions: [String],
      currentMedications: String,
      recentIllnessOrSurgery: Boolean,
      recentTattooOrPiercing: Boolean,
      pregnancyStatus: String,
      lastDonationDate: Date,
      donationType: String,
      computedStatus: String,
      reasons: [String]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving user
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare user entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
