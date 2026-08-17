const test = require('node:test');
const assert = require('node:assert');
const { calculatePreliminaryStatus } = require('../utils/eligibility');

test('Eligibility Calculator - Healthy Adult Donor should be Eligible', () => {
  const result = calculatePreliminaryStatus({
    age: 25,
    gender: 'Male',
    weight: 65,
    currentHealthCondition: 'Healthy',
    hemoglobin: 14
  });

  assert.strictEqual(result.status, 'Eligible');
  assert.ok(result.reasons.some((r) => r.includes('Meets all preliminary')));
});

test('Eligibility Calculator - Underage Donor should require Medical Review', () => {
  const result = calculatePreliminaryStatus({
    age: 16,
    gender: 'Female',
    weight: 55,
    currentHealthCondition: 'Healthy'
  });

  assert.strictEqual(result.status, 'Needs Medical Review');
  assert.ok(result.reasons.some((r) => r.includes('under 18 years')));
});

test('Eligibility Calculator - Low Hemoglobin should be Temporarily Deferred', () => {
  const result = calculatePreliminaryStatus({
    age: 30,
    gender: 'Female',
    weight: 52,
    hemoglobin: 10
  });

  assert.strictEqual(result.status, 'Temporarily Deferred');
  assert.ok(result.reasons.some((r) => r.includes('Hemoglobin level')));
});
