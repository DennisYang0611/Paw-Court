'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocaleCode, locales, defaultLocale } from '../locales';
import { Translations } from '../locales/zh-CN';

interface I18nContextType {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: Translations;
  formatMessage: (template: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleCode>(defaultLocale);

  // 从localStorage加载语言设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as LocaleCode;
      if (savedLocale && locales[savedLocale]) {
        setLocaleState(savedLocale);
      } else {
        // 尝试从浏览器语言检测
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hk')) {
          setLocaleState('zh-TW');
        } else if (browserLang.startsWith('zh')) {
          setLocaleState('zh-CN');
        } else if (browserLang.startsWith('en')) {
          setLocaleState('en');
        }
      }
    }
  }, []);

  const setLocale = (newLocale: LocaleCode) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  // 简单的字符串格式化函数
  const formatMessage = (template: string, params?: Record<string, string | number>): string => {
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t: locales[locale],
    formatMessage
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// 便捷Hook用于翻译
export const useTranslation = () => {
  const { t, formatMessage } = useI18n();

  return {
    t,
    formatMessage
  };
};