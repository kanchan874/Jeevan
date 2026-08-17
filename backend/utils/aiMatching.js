/**
 * AI-based Donor-Recipient Matching Algorithm
 * Calculates composite score (0-100%) based on:
 * 1. Blood Group Compatibility (35% weight)
 * 2. Preliminary Donor Screening & Health Eligibility (30% weight)
 * 3. Availability & Active Status (15% weight)
 * 4. Proximity & Physical Distance Decay (20% weight)
 */

const getBloodCompatibilityScore = (patientGroup, donorGroup) => {
  if (patientGroup === donorGroup) {
    return 100; // Perfect exact match
  }

  // Universal Donor (O-)
  if (donorGroup === 'O-') {
    return 95;
  }

  // O+ can donate to any Rh-positive patient (A+, B+, AB+, O+)
  if (donorGroup === 'O+' && patientGroup.endsWith('+')) {
    return 90;
  }

  // Same antigen group Rh negative to Rh positive (e.g. A- to A+)
  if (patientGroup.endsWith('+') && donorGroup === patientGroup.replace('+', '-')) {
    return 92;
  }

  // Compatible donor
  return 85;
};

const getEligibilityScore = (donor) => {
  if (donor.preliminaryStatus === 'Eligible') {
    let score = 100;
    // Check if recent checkup was completed within 15 days
    if (donor.lastHealthCheckupDate) {
      const days = Math.floor((Date.now() - new Date(donor.lastHealthCheckupDate).getTime()) / (1000 * 3600 * 24));
      if (days <= 15) score += 5; // Bonus for recent verification
    }
    return Math.min(score, 100);
  }

  if (donor.preliminaryStatus === 'Needs Medical Review') {
    return 40;
  }

  return 0; // Temporarily Deferred or ineligible
};

const getAvailabilityScore = (donor) => {
  if (!donor.isAvailable) return 0;
  return 100;
};

const getProximityScore = (distanceKm) => {
  if (distanceKm <= 0) return 100;
  // Exponential decay model: Score = 100 * e^(-0.04 * distance)
  const score = Math.round(100 * Math.exp(-0.04 * distanceKm));
  return Math.max(score, 10);
};

/**
 * Compute AI Match Score between a Donor and a Blood Request
 */
const calculateAIMatchScore = (donor, distanceKm, patientGroup) => {
  const bloodScore = getBloodCompatibilityScore(patientGroup, donor.bloodGroup);
  const eligibilityScore = getEligibilityScore(donor);
  const availabilityScore = getAvailabilityScore(donor);
  const proximityScore = getProximityScore(distanceKm);

  // Weighted sum formula
  const compositeScore = Math.round(
    0.35 * bloodScore +
    0.30 * eligibilityScore +
    0.15 * availabilityScore +
    0.20 * proximityScore
  );

  const matchReasons = [];
  if (patientGroup === donor.bloodGroup) {
    matchReasons.push('Exact blood type match');
  } else {
    matchReasons.push(`Compatible blood type (${donor.bloodGroup} → ${patientGroup})`);
  }

  if (donor.preliminaryStatus === 'Eligible') {
    matchReasons.push('Verified donor health eligibility');
  }

  if (distanceKm <= 5) {
    matchReasons.push(`High proximity (${distanceKm} km away)`);
  } else {
    matchReasons.push(`Location distance ${distanceKm} km`);
  }

  return {
    score: Math.min(Math.max(compositeScore, 10), 99),
    breakdown: {
      bloodScore,
      eligibilityScore,
      availabilityScore,
      proximityScore
    },
    reasons: matchReasons
  };
};

module.exports = {
  calculateAIMatchScore
};
