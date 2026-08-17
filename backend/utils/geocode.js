const axios = require('axios');

/**
 * Geocodes an address string to { lat, lng } using OpenStreetMap's Nominatim API.
 * Includes a simulated fallback mode if the network fails or is rate-limited.
 */
const geocodeAddress = async (address) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'JeevanBloodDonationApp/1.0.0 (kanchan.contact@example.com)'
      },
      timeout: 5000
    });

    if (response.data && response.data.length > 0) {
      const lat = parseFloat(response.data[0].lat);
      const lng = parseFloat(response.data[0].lon);
      return { lat, lng };
    }
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error.message);
  }

  // Fallback: Generate reasonable coordinates inside standard Indian metro areas to keep the app working offline or during API downtime
  console.log(`Using fallback coordinates for location: "${address}"`);
  
  // Default fallback is T Nagar, Chennai
  let lat = 13.0405;
  let lng = 80.2337;

  const lowercaseAddr = address.toLowerCase();
  if (lowercaseAddr.includes('mumbai') || lowercaseAddr.includes('bombay') || lowercaseAddr.includes('bandra') || lowercaseAddr.includes('andheri')) {
    lat = 19.0760;
    lng = 72.8777;
  } else if (lowercaseAddr.includes('bangalore') || lowercaseAddr.includes('bengaluru') || lowercaseAddr.includes('koramangala') || lowercaseAddr.includes('hsr')) {
    lat = 12.9716;
    lng = 77.5946;
  } else if (lowercaseAddr.includes('delhi') || lowercaseAddr.includes('noida') || lowercaseAddr.includes('gurgaon')) {
    lat = 28.6139;
    lng = 77.2090;
  } else if (lowercaseAddr.includes('kolkata') || lowercaseAddr.includes('calcutta')) {
    lat = 22.5726;
    lng = 88.3639;
  } else if (lowercaseAddr.includes('hyderabad')) {
    lat = 17.3850;
    lng = 78.4867;
  } else {
    // Add minor random noise so not all fallback users resolve to the exact same point
    const noiseLat = (Math.random() - 0.5) * 0.05;
    const noiseLng = (Math.random() - 0.5) * 0.05;
    lat += noiseLat;
    lng += noiseLng;
  }

  return { lat, lng };
};

module.exports = { geocodeAddress };
