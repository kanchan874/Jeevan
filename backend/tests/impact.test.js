const test = require('node:test');
const assert = require('node:assert');
const { calculateDonorImpact } = require('../utils/impactCalculator');

test('Impact Calculator - Calculates lives saved as 3x donation count', () => {
  const user = {
    bloodGroup: 'O+',
    isMobileVerified: true,
    preliminaryStatus: 'Eligible',
    healthCheckupHistory: []
  };

  const impact = calculateDonorImpact(user, 3);
  assert.strictEqual(impact.totalDonations, 3);
  assert.strictEqual(impact.livesSaved, 9);
  assert.strictEqual(impact.isEligibleNow, true);
});

test('Impact Calculator - Unlocks Universal Hero badge for O- donors', () => {
  const user = {
    bloodGroup: 'O-',
    isMobileVerified: true,
    preliminaryStatus: 'Eligible'
  };

  const impact = calculateDonorImpact(user, 1);
  const heroBadge = impact.badges.find((b) => b.id === 'universal_hero');
  assert.ok(heroBadge);
  assert.strictEqual(heroBadge.unlocked, true);
});

test('Impact Calculator - Calculates countdown for recent donation', () => {
  const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
  const user = {
    bloodGroup: 'A+',
    gender: 'Male',
    lastDonationDate: recentDate,
    donationType: 'Whole Blood'
  };

  const impact = calculateDonorImpact(user, 1);
  assert.strictEqual(impact.isEligibleNow, false);
  assert.ok(impact.daysRemaining > 70 && impact.daysRemaining <= 80);
});
