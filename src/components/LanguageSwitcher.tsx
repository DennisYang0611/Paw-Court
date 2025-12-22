'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { LocaleCode, localeNames, localeFlags } from '../locales';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: LocaleCode) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Language"
      >
        <span className={styles.flag}>{localeFlags[locale]}</span>
        <span className={styles.name}>{localeNames[locale]}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {Object.entries(localeNames).map(([code, name]) => (
            <button
              key={code}
              className={`${styles.option} ${locale === code ? styles.active : ''}`}
              onClick={() => handleLocaleChange(code as LocaleCode)}
            >
              <span className={styles.flag}>{localeFlags[code as LocaleCode]}</span>
              <span className={styles.name}>{name}</span>
              {locale === code && <span className={styles.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;