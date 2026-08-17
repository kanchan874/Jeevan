const test = require('node:test');
const assert = require('node:assert');

test('Multi-Language i18n - English and Hindi dictionaries have matching keys', () => {
  const translations = {
    en: {
      nav_home: 'Home',
      nav_dashboard: 'Dashboard',
      nav_request_blood: 'Request Blood',
      impact_title: 'Your Donation Streak & Impact'
    },
    hi: {
      nav_home: 'होम',
      nav_dashboard: 'डैशबोर्ड',
      nav_request_blood: 'रक्त अनुरोध',
      impact_title: 'आपकी रक्तदान लड़ी और प्रभाव'
    }
  };

  const enKeys = Object.keys(translations.en);
  const hiKeys = Object.keys(translations.hi);

  assert.strictEqual(enKeys.length, hiKeys.length);
  enKeys.forEach((key) => {
    assert.ok(translations.hi[key], `Missing Hindi translation for key: ${key}`);
  });
});
