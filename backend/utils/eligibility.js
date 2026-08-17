/**
 * Utility to calculate Preliminary Donor Status
 * Statuses: 'Eligible', 'Temporarily Deferred', 'Needs Medical Review'
 * 
 * Rules based on standard blood donation eligibility guidelines:
 * 1. Age: 18 - 65 years. (<18 or >65 -> Needs Medical Review)
 * 2. Weight: >= 45 kg (<45 kg -> Temporarily Deferred)
 * 3. Hemoglobin: >= 12.5 g/dL (if provided; <12.5 -> Temporarily Deferred)
 * 4. Current Health: 'Healthy' required. ('Unwell' or 'Mild Unwellness' -> Temporarily Deferred)
 * 5. Major Medical Conditions: Diabetes, Hypertension, Heart Disease, Hepatitis, Cancer, HIV, Kidney Disease -> Needs Medical Review
 * 6. Recent Illness / Surgery / Tattoo / Piercing in last 6 months -> Temporarily Deferred
 * 7. Pregnancy / Breastfeeding -> Temporarily Deferred
 * 8. Last Donation Interval:
 *    - Whole Blood: Male >= 90 days, Female >= 120 days
 *    - Platelets / Plasma: >= 14 days
 */

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function calculatePreliminaryStatus(data) {
  const reasons = [];
  let status = 'Eligible';

  const age = data.dob ? calculateAge(data.dob) : (data.age ? Number(data.age) : null);
  const weight = Number(data.weight);
  const hb = data.hemoglobin ? Number(data.hemoglobin) : null;
  const gender = data.gender || 'Male';

  // 1. Age check
  if (age !== null) {
    if (age < 18) {
      status = 'Needs Medical Review';
      reasons.push(`Donor age (${age} yrs) is under 18 years minimum limit`);
    } else if (age > 65) {
      status = 'Needs Medical Review';
      reasons.push(`Donor age (${age} yrs) is over 65 years upper limit`);
    }
  }

  // 2. Weight check
  if (weight && weight < 45) {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push(`Body weight (${weight} kg) is below 45 kg minimum threshold`);
  }

  // 3. Hemoglobin check
  if (hb !== null && hb > 0 && hb < 12.5) {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push(`Hemoglobin level (${hb} g/dL) is below 12.5 g/dL threshold`);
  }

  // 4. Current Health Condition
  if (data.currentHealthCondition && data.currentHealthCondition !== 'Healthy') {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push(`Current health status reported as "${data.currentHealthCondition}"`);
  }

  // 5. Major Medical Conditions
  const majorConditions = Array.isArray(data.majorMedicalConditions)
    ? data.majorMedicalConditions
    : (data.majorMedicalConditions ? data.majorMedicalConditions.split(',').map(s => s.trim()) : []);

  const severeConditions = majorConditions.filter(
    c => c && c.toLowerCase() !== 'none' && c.toLowerCase() !== 'n/a'
  );

  if (severeConditions.length > 0) {
    status = 'Needs Medical Review';
    reasons.push(`Reported major medical condition(s): ${severeConditions.join(', ')}`);
  }

  // 6. Recent Tattoo, Piercing, Illness or Surgery
  if (data.recentTattooOrPiercing) {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push('Recent tattoo or body piercing within last 6 months');
  }

  if (data.recentIllnessOrSurgery) {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push('Recent major illness, infection, or surgical procedure');
  }

  // 7. Pregnancy / Breastfeeding
  if (data.pregnancyStatus === 'Currently Pregnant / Breastfeeding') {
    if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
    reasons.push('Currently pregnant or breastfeeding');
  }

  // 8. Last Donation Date & Gap check
  let nextEligibleDonationDate = null;
  if (data.lastDonationDate) {
    const lastDonated = new Date(data.lastDonationDate);
    const donationType = data.donationType || 'Whole Blood';

    let requiredDays = 90; // Default Male Whole Blood
    if (donationType === 'Platelets' || donationType === 'Plasma') {
      requiredDays = 14;
    } else if (gender === 'Female') {
      requiredDays = 120;
    }

    const eligibleTime = lastDonated.getTime() + requiredDays * 24 * 60 * 60 * 1000;
    nextEligibleDonationDate = new Date(eligibleTime);

    if (Date.now() < eligibleTime) {
      const remainingDays = Math.ceil((eligibleTime - Date.now()) / (1000 * 60 * 60 * 24));
      if (status !== 'Needs Medical Review') status = 'Temporarily Deferred';
      reasons.push(`Last ${donationType} donation was recent. Eligible again in ${remainingDays} day(s).`);
    }
  }

  if (reasons.length === 0) {
    reasons.push('Meets all preliminary physical and health eligibility criteria');
  }

  return {
    status,
    reasons,
    age,
    nextEligibleDonationDate
  };
}

module.exports = {
  calculateAge,
  calculatePreliminaryStatus
};
