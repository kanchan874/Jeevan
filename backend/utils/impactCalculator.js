/**
 * Utility to calculate donor lifetime stats, streak, next eligible date countdown,
 * lives saved estimate, and gamification badges.
 */

function calculateDonorImpact(user, completedDonationCount = 0) {
  // 1. Calculate Total Donations
  let totalDonations = completedDonationCount;

  if (user.healthCheckupHistory && user.healthCheckupHistory.length > 0) {
    const checkupDonations = user.healthCheckupHistory.filter(h => h.lastDonationDate).length;
    totalDonations = Math.max(totalDonations, checkupDonations);
  }

  if (user.lastDonationDate && totalDonations === 0) {
    totalDonations = 1;
  }

  // 2. Lives Saved Estimate (1 Blood Unit = Up to 3 Lives Saved)
  const livesSaved = totalDonations * 3;

  // 3. Calculate Streak
  let streak = totalDonations;

  // 4. Next Eligible Date & Countdown
  let nextEligibleDate = null;
  let daysRemaining = 0;
  let isEligibleNow = true;

  if (user.lastDonationDate) {
    const lastDonated = new Date(user.lastDonationDate);
    const donationType = user.donationType || 'Whole Blood';
    const gender = user.gender || 'Male';

    let requiredDays = 90; // Default Male Whole Blood
    if (donationType === 'Platelets' || donationType === 'Plasma') {
      requiredDays = 14;
    } else if (gender === 'Female') {
      requiredDays = 120;
    }

    const eligibleTime = lastDonated.getTime() + requiredDays * 24 * 60 * 60 * 1000;
    nextEligibleDate = new Date(eligibleTime);

    if (Date.now() < eligibleTime) {
      isEligibleNow = false;
      daysRemaining = Math.ceil((eligibleTime - Date.now()) / (1000 * 60 * 60 * 24));
    }
  }

  // 5. Compute Gamification Badges
  const badges = [
    {
      id: 'first_donation',
      title: 'First Lifesaver',
      description: 'Completed 1st lifetime blood donation',
      icon: '🩸',
      unlocked: totalDonations >= 1,
      progress: Math.min(1, totalDonations) / 1
    },
    {
      id: 'champion_donor',
      title: 'Blood Champion',
      description: 'Achieved 3+ lifetime blood donations',
      icon: '🎖️',
      unlocked: totalDonations >= 3,
      progress: Math.min(3, totalDonations) / 3
    },
    {
      id: 'master_lifesaver',
      title: 'Master Lifesaver',
      description: 'Achieved 5+ lifetime blood donations',
      icon: '🏆',
      unlocked: totalDonations >= 5,
      progress: Math.min(5, totalDonations) / 5
    },
    {
      id: 'universal_hero',
      title: 'Universal Hero',
      description: 'O- or O+ High-Compatibility Donor',
      icon: '🦸',
      unlocked: ['O-', 'O+'].includes(user.bloodGroup),
      progress: ['O-', 'O+'].includes(user.bloodGroup) ? 1 : 0
    },
    {
      id: 'verified_lifeline',
      title: 'Verified Lifeline',
      description: 'Mobile Verified & Preliminary Health Cleared',
      icon: '🛡️',
      unlocked: Boolean(user.isMobileVerified && user.preliminaryStatus === 'Eligible'),
      progress: Boolean(user.isMobileVerified && user.preliminaryStatus === 'Eligible') ? 1 : 0.5
    }
  ];

  return {
    totalDonations,
    livesSaved,
    streak,
    lastDonationDate: user.lastDonationDate || null,
    nextEligibleDate,
    daysRemaining,
    isEligibleNow,
    bloodGroup: user.bloodGroup || 'O+',
    preliminaryStatus: user.preliminaryStatus || 'Eligible',
    badges
  };
}

module.exports = {
  calculateDonorImpact
};
