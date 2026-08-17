const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const mockDonors = [
  // CHENNAI DONORS
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9840123456',
    bloodGroup: 'O-', // Universal Donor
    location: 'T Nagar, Chennai',
    coordinates: { lat: 13.0405, lng: 80.2337 },
    isAvailable: true
  },
  {
    name: 'Priya Sundaram',
    email: 'priya.sundaram@example.com',
    phone: '9884123456',
    bloodGroup: 'A+',
    location: 'Adyar, Chennai',
    coordinates: { lat: 13.0063, lng: 80.2574 }, // ~5.5 km from T Nagar
    isAvailable: true
  },
  {
    name: 'Suresh Krishnan',
    email: 'suresh.k@example.com',
    phone: '9790123456',
    bloodGroup: 'B+',
    location: 'Velachery, Chennai',
    coordinates: { lat: 12.9815, lng: 80.2180 }, // ~7.5 km from T Nagar
    isAvailable: true
  },
  {
    name: 'Anjali Sharma',
    email: 'anjali.s@example.com',
    phone: '9841123456',
    bloodGroup: 'AB+', // Universal Recipient / compatible donor for AB+
    location: 'Nungambakkam, Chennai',
    coordinates: { lat: 13.0607, lng: 80.2392 }, // ~2.5 km from T Nagar
    isAvailable: true
  },
  {
    name: 'Karthik Raja',
    email: 'karthik.r@example.com',
    phone: '9885123456',
    bloodGroup: 'O+',
    location: 'Mylapore, Chennai',
    coordinates: { lat: 13.0330, lng: 80.2690 }, // ~4 km from T Nagar
    isAvailable: false // Unavailable donor to test availability filtering
  },

  // MUMBAI DONORS
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9820123456',
    bloodGroup: 'A+',
    location: 'Bandra West, Mumbai',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    isAvailable: true
  },
  {
    name: 'Neha Deshmukh',
    email: 'neha.d@example.com',
    phone: '9819123456',
    bloodGroup: 'O-',
    location: 'Andheri West, Mumbai',
    coordinates: { lat: 19.1363, lng: 72.8277 }, // ~8.5 km from Bandra
    isAvailable: true
  },

  // BANGALORE DONORS
  {
    name: 'Vikram Gowda',
    email: 'vikram.g@example.com',
    phone: '9845123456',
    bloodGroup: 'B-',
    location: 'Indiranagar, Bangalore',
    coordinates: { lat: 12.9719, lng: 77.6412 },
    isAvailable: true
  },
  {
    name: 'Shwetha Reddy',
    email: 'shwetha.r@example.com',
    phone: '9844123456',
    bloodGroup: 'O-',
    location: 'Koramangala, Bangalore',
    coordinates: { lat: 12.9352, lng: 77.6244 }, // ~4.5 km from Indiranagar
    isAvailable: true
  },

  // NAGPUR DONORS
  {
    name: 'Sameer Joshi',
    email: 'sameer.joshi@example.com',
    phone: '9822123456',
    bloodGroup: 'O+',
    location: 'Dharampeth, Nagpur',
    coordinates: { lat: 21.1428, lng: 79.0645 },
    isAvailable: true
  },
  {
    name: 'Pooja Raut',
    email: 'pooja.raut@example.com',
    phone: '9823123456',
    bloodGroup: 'B+',
    location: 'Sitabuldi, Nagpur',
    coordinates: { lat: 21.1466, lng: 79.0833 },
    isAvailable: true
  },
  {
    name: 'Nikhil Meshram',
    email: 'nikhil.m@example.com',
    phone: '9890123456',
    bloodGroup: 'O-',
    location: 'Ramdaspeth, Nagpur',
    coordinates: { lat: 21.1350, lng: 79.0760 },
    isAvailable: true
  },
  {
    name: 'Sneha Tiwari',
    email: 'sneha.t@example.com',
    phone: '9860123456',
    bloodGroup: 'A+',
    location: 'Wardha Road, Nagpur',
    coordinates: { lat: 21.1030, lng: 79.0620 },
    isAvailable: true
  },
  {
    name: 'Chetan Bagde',
    email: 'chetan.b@example.com',
    phone: '9850123456',
    bloodGroup: 'AB-',
    location: 'Pratap Nagar, Nagpur',
    coordinates: { lat: 21.1180, lng: 79.0550 },
    isAvailable: true
  },
  {
    name: 'Rohan Deshpande',
    email: 'rohan.d@example.com',
    phone: '9881123456',
    bloodGroup: 'A-',
    location: 'Sadar, Nagpur',
    coordinates: { lat: 21.1610, lng: 79.0815 },
    isAvailable: false
  },

  // DEMO HOSPITAL ACCOUNT
  {
    name: 'Apollo Emergency Hospital',
    email: 'hospital.apollo@example.com',
    phone: '9840999888',
    role: 'hospital',
    hospitalName: 'Apollo Emergency Center',
    registrationNumber: 'HOSP-TN-2024-99',
    emergencyContactPerson: 'Dr. Arvind Swamy',
    department: 'Trauma & Emergency Care',
    location: 'Greams Road, Chennai',
    coordinates: { lat: 13.0600, lng: 80.2500 },
    isAvailable: true
  },

  // DEMO BLOOD BANK ACCOUNT
  {
    name: 'Red Cross Central Blood Bank',
    email: 'bloodbank.redcross@example.com',
    phone: '9840777666',
    role: 'bloodbank',
    bloodBankName: 'Red Cross Central Blood Bank',
    licenseNumber: 'BB-LIC-8821-TN',
    operatingHours: '24/7 Emergency & Dispatch',
    availableUnits: { 'A+': 18, 'A-': 6, 'B+': 22, 'B-': 8, 'O+': 30, 'O-': 12, 'AB+': 10, 'AB-': 5 },
    location: 'Egmore, Chennai',
    coordinates: { lat: 13.0732, lng: 80.2609 },
    isAvailable: true
  }
];

const seedDB = async (skipConnect = false) => {
  try {
    if (!skipConnect) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jeevan');
      console.log('Connected to MongoDB to seed database...');
    }

    // Clear existing mock accounts to prevent email duplication errors
    await User.deleteMany({ email: { $in: mockDonors.map(d => d.email) } });
    console.log('Cleared existing mock donors...');

    const donorsWithPassword = mockDonors.map(donor => ({
      ...donor,
      password: 'password123' // Will be hashed by pre-save schema hook
    }));

    await User.create(donorsWithPassword);
    console.log(`Successfully seeded ${mockDonors.length} mock donors!`);

    if (!skipConnect) {
      mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
    if (!skipConnect) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, mockDonors };

