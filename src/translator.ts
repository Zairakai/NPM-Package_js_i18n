/**
 * Core translation functionality
 */

import { applyPluralization } from './pluralization.js'
import {
  CountOrReplacementsSchema,
  ReplacementParametersSchema,
  TranslationDataSchema,
  TranslationObjectSchema,
} from './schemas.js'
import type {
  ReplacementParameters,
  TranslateFunction,
  TranslationData,
  TranslationObject,
  Translator,
} from './types.js'

/**
 * Creates a translator instance
 * @param translations - Translation object
 * @param locale - Current locale
 * @returns Translator instance
 */
export const createTranslator = (translations: TranslationData = {}, locale = 'en'): Translator => {
  const currentTranslations = TranslationDataSchema.parse(translations)
  let currentLocale = locale

  /**
   * Translate a key with optional pluralization and replacements
   * @param path - Translation key (dot notation)
   * @param countOrReplacements - Count for pluralization or replacements object
   * @param replacements - Replacement values for placeholders
   * @returns Translated string
   */
  const translate: TranslateFunction = (
    path: string,
    countOrReplacements: number | ReplacementParameters = {},
    replacements: ReplacementParameters = {}
  ): string => {
    CountOrReplacementsSchema.parse(countOrReplacements)
    ReplacementParametersSchema.parse(replacements)

    let count: number | null = null
    let actualReplacements = replacements

    // Handle parameter overloading
    if ('number' === typeof countOrReplacements) {
      count = countOrReplacements
      // Automatically add count to replacements
      actualReplacements = { count: countOrReplacements, ...replacements }
    } else {
      actualReplacements = { ...countOrReplacements, ...replacements }
    }

    // Check if locale exists
    if (!currentTranslations[currentLocale]) {
      return path
    }

    // Navigate through translation object using dot notation
    const segments = path.split('.')
    let translation: string | TranslationObject = currentTranslations[currentLocale]

    for (const segment of segments) {
      if (
        translation &&
        'object' === typeof translation &&
        Object.prototype.hasOwnProperty.call(translation, segment)
      ) {
        translation = translation[segment]
      } else {
        return path // Return key if not found
      }
    }

    if ('string' === typeof translation) {
      // Apply pluralization if count provided
      const pluralizedTranslation = applyPluralization(translation, count)

      // Replace placeholders (:key and {key} formats)
      const result = pluralizedTranslation
        .replace(/:(\w+)/g, (match, key) => {
          return Object.prototype.hasOwnProperty.call(actualReplacements, key) ? String(actualReplacements[key]) : match
        })
        .replace(/{(\w+)}/g, (match, key) => {
          return Object.prototype.hasOwnProperty.call(actualReplacements, key) ? String(actualReplacements[key]) : match
        })

      return result
    }

    // Return path if translation is not a string
    return path
  }

  /**
   * Set current locale
   * @param newLocale - New locale
   */
  const setLocale = (newLocale: string): void => {
    currentLocale = newLocale
  }

  /**
   * Get current locale
   * @returns Current locale
   */
  const getLocale = (): string => currentLocale

  /**
   * Set translations for a locale
   * @param locale - Locale code
   * @param translations - Translation object
   */
  const setTranslations = (locale: string, translations: TranslationObject): void => {
    currentTranslations[locale] = TranslationObjectSchema.parse(translations)
  }

  /**
   * Add translations to existing locale
   * @param locale - Locale code
   * @param translations - Translation object to merge
   */
  const addTranslations = (locale: string, translations: TranslationObject): void => {
    const validated = TranslationObjectSchema.parse(translations)
    if (!currentTranslations[locale]) {
      currentTranslations[locale] = {}
    }
    currentTranslations[locale] = { ...currentTranslations[locale], ...validated }
  }

  /**
   * Check if a translation key exists
   * @param path - Translation key
   * @param locale - Locale to check (optional, uses current if not provided)
   * @returns True if key exists
   */
  const hasTranslation = (path: string, locale: string | null = null): boolean => {
    const checkLocale = locale ?? currentLocale

    // Check if locale exists
    if (!currentTranslations[checkLocale]) {
      return false
    }

    const segments = path.split('.')
    let current: Record<string, unknown> | string = currentTranslations[checkLocale]

    // Navigate through the path
    for (const segment of segments) {
      if (current && 'object' === typeof current && segment in current) {
        current = current[segment] as Record<string, unknown> | string
      } else {
        return false
      }
    }

    // Check if final value is a string
    return 'string' === typeof current
  }

  /**
   * Get available locales
   * @returns Array of available locale codes
   */
  const getAvailableLocales = (): string[] => Object.keys(currentTranslations)

  return {
    __: translate,
    translate,
    setLocale,
    getLocale,
    setTranslations,
    addTranslations,
    hasTranslation,
    getAvailableLocales,
  }
}
