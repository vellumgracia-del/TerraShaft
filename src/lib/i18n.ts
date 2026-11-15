'use client';

import { useEffect, useCallback } from 'react';
import { createInstance } from 'i18next';
import en from '@/locales/en.json';
import id from '@/locales/id.json';
import { AppLocale, useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Crop } from '@/types/agronomy';

const i18nInstance = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  interpolation: {
    escapeValue: false,
  },
});

if (!i18nInstance.isInitialized) {
  i18nInstance.init();
}

export function translateKey(
  locale: AppLocale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const fixedT = i18nInstance.getFixedT(locale);
  return String(vars ? fixedT(key, vars) : fixedT(key));
}

export function useAppI18n() {
  const locale = useTerraShaftStore(s => s.locale);
  const setLocale = useTerraShaftStore(s => s.setLocale);
  const hydrateLocale = useTerraShaftStore(s => s.hydrateLocale);

  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  useEffect(() => {
    if (i18nInstance.language !== locale) {
      i18nInstance.changeLanguage(locale);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const fixedT = i18nInstance.getFixedT(locale);
      return String(vars ? fixedT(key, vars) : fixedT(key));
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
    isEn: locale === 'en',
  };
}

export function localizeCropName(crop: Pick<Crop, 'name' | 'name_en'>, locale: AppLocale): string {
  if (locale === 'en') {
    return crop.name_en || crop.name;
  }
  return crop.name;
}

export function localizeCropNotes(
  crop: Pick<Crop, 'local_notes' | 'local_notes_en'>,
  locale: AppLocale
): string {
  if (locale === 'en') {
    return crop.local_notes_en || crop.local_notes || '';
  }
  return crop.local_notes || crop.local_notes_en || '';
}

export function localizePathwayCopy(
  pathwayId: 'A' | 'B' | 'C',
  locale: AppLocale
): { title: string; subtitle: string; description: string } {
  const prefix = `rotation.pathway${pathwayId}`;
  return {
    title: translateKey(locale, prefix),
    subtitle: translateKey(locale, `${prefix}Sub`),
    description: translateKey(locale, `${prefix}Desc`),
  };
}

export default i18nInstance;
