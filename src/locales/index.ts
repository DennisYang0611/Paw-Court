import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { en } from './en';

export const locales = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en
} as const;

export type LocaleCode = keyof typeof locales;

export const defaultLocale: LocaleCode = 'zh-CN';

// 语言名称映射
export const localeNames: Record<LocaleCode, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English'
};

// 语言图标映射
export const localeFlags: Record<LocaleCode, string> = {
  'zh-CN': '🇨🇳',
  'zh-TW': '🇨🇳',
  'en': '🇺🇸'
};