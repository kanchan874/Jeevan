import React, { createContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('jeevan_lang') || 'en');

  const switchLanguage = (lang) => {
    if (['en', 'hi'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('jeevan_lang', lang);
    }
  };

  /**
   * Helper function to translate keys
   * Usage: t('nav_home') or t('impact_eligible_in', { days: 5 })
   */
  const t = (key, params = {}) => {
    const dict = translations[language] || translations['en'];
    let text = dict[key] || translations['en'][key] || key;

    // Interpolate dynamic parameters
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
