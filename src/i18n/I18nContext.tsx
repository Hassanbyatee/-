import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, type TranslationDictionary } from './translations';
import type { LanguageCode } from '../types/domain';

interface I18nContextValue {
  lang: LanguageCode;
  dir: 'rtl' | 'ltr';
  setLang: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  getLocalizedName: (item?: { nameAr: string; nameKu: string; nameEn: string } | null) => string;
  getLocalizedAddress: (item?: { addressAr?: string; addressKu?: string; addressEn?: string } | null) => string;
  formatIqd: (amount: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const LANG_STORAGE_KEY = 'masar_iraq_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode | null;
      if (saved === 'ar' || saved === 'ku' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
    return 'ar';
  });

  const dir: 'rtl' | 'ltr' = lang === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang, dir]);

  const setLang = (next: LanguageCode) => {
    setLangState(next);
  };

  const value = useMemo<I18nContextValue>(() => {
    const t = TRANSLATIONS[lang];
    return {
      lang,
      dir,
      setLang,
      t,
      getLocalizedName: (item) => {
        if (!item) return '';
        if (lang === 'ku') return item.nameKu || item.nameAr;
        if (lang === 'en') return item.nameEn || item.nameAr;
        return item.nameAr;
      },
      getLocalizedAddress: (item) => {
        if (!item) return '';
        if (lang === 'ku') return item.addressKu || item.addressAr || item.addressEn || '';
        if (lang === 'en') return item.addressEn || item.addressAr || '';
        return item.addressAr || item.addressEn || '';
      },
      formatIqd: (amount: number) => {
        const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount));
        return `${formatted} ${t.currency}`;
      },
    };
  }, [lang, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
