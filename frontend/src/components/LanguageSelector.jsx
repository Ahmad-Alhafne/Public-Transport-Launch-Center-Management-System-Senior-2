import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';

const languages = [
  { code: 'ar', labelKey: 'settings.arabic', flag: '🇸🇦' },
  { code: 'en', labelKey: 'settings.english', flag: '🇬🇧' },
];

export default function LanguageSelector({ className = '' }) {
  const { t, i18n } = useTranslation();
  const { user, setLanguagePreference } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'ar');
  const [status, setStatus] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const current = i18n.language || 'ar';
    setSelectedLanguage(current);
  }, [i18n.language]);

  // Handle clicking outside to close the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const applyLanguage = async (language) => {
    setSelectedLanguage(language);
    setStatus('');
    setIsOpen(false);

    // Apply immediately in the UI
    if (typeof setLanguagePreference === 'function') {
      setLanguagePreference(language);
    }
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = i18n.dir(language);

    // Persist in local storage for new sessions
    try {
      localStorage.setItem('preferredLanguage', language);
      localStorage.setItem('i18nextLng', language);
    } catch {
      // localStorage may be unavailable in some environments
    }

    // Try saving to the backend when authenticated
    if (user) {
      try {
        await updateMyProfile({ languagePreference: language });
      } catch (err) {
        console.warn('Unable to persist language preference on backend.', err);
      }
    }

    setStatus(t('profile.languageSaved'));
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setStatus('');
    }, 3000);
  };

  const currentLangObj = languages.find((l) => l.code === selectedLanguage) || languages[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {t('profile.language')}
      </label>
      
      {/* Custom Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 border rounded-[var(--radius-sm)] bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--charcoal)] focus:ring-2 focus:ring-[var(--forest)] focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" role="img" aria-hidden="true">{currentLangObj.flag}</span>
          <span>{t(currentLangObj.labelKey)}</span>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Options Menu Overlay */}
      {isOpen && (
        <ul
          className="absolute z-50 w-full mt-1 border shadow-lg overflow-hidden focus:outline-none bg-[var(--surface)] border-[var(--border-subtle)] rounded-[var(--radius)]"
          role="listbox"
        >
          {languages.map((language) => {
            const isSelected = language.code === selectedLanguage;
            return (
              <li key={language.code}>
                <button
                  type="button"
                  onClick={() => applyLanguage(language.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left font-medium transition-colors duration-150 rtl:text-right hover:bg-[var(--background-subtle)] ${
                    isSelected ? 'text-[var(--forest)] bg-[var(--surface-subtle)]' : 'text-[var(--charcoal)]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="text-base" role="img" aria-hidden="true">{language.flag}</span>
                  <span className="flex-1">{t(language.labelKey)}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[var(--forest)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Dynamic System Alert Messaging */}
      {status && (
        <div className="absolute left-0 right-0 mt-1 text-xs font-medium text-center text-[var(--forest)] animate-fade-in">
          {status}
        </div>
      )}
    </div>
  );
}