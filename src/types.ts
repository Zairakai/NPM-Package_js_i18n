/**
 * Type definitions for the i18n library
 */

/** Object containing nested translation values */
export interface TranslationObject {
  [key: string]: string | TranslationObject
}

/** Translation data for multiple locales */
export type TranslationData = Record<string, TranslationObject>

/** Parameters that can be used to replace placeholders in translations */
export type ReplacementParameters = Record<string, string | number>

/** Translator instance interface */
export interface Translator {
  /** Main translation function (alias for translate) */
  __: TranslateFunction
  /** Main translation function */
  translate: TranslateFunction
  /** Set the current locale */
  setLocale: (locale: string) => void
  /** Get the current locale */
  getLocale: () => string
  /** Set translations for a specific locale */
  setTranslations: (locale: string, translations: TranslationObject) => void
  /** Add translations to an existing locale */
  addTranslations: (locale: string, translations: TranslationObject) => void
  /** Check if a translation key exists */
  hasTranslation: (path: string, locale?: string | null) => boolean
  /** Get all available locales */
  getAvailableLocales: () => string[]
}

/** Translation function signature with overloads */
export interface TranslateFunction {
  /** Translate with replacements only */
  (path: string, replacements?: ReplacementParameters): string
  /** Translate with count for pluralization */
  (path: string, count: number, replacements?: ReplacementParameters): string
}
