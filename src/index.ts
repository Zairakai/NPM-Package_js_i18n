/**
 * @zairakai/npm-i18n
 * Lightweight internationalization library with Laravel-style features
 */

export { applyPluralization, selectPluralForm } from './pluralization.js'
export { createTranslator } from './translator.js'
export type {
  ReplacementParameters,
  TranslateFunction,
  TranslationData,
  TranslationObject,
  Translator,
} from './types.js'

import { createTranslator } from './translator.js'
import type { TranslationData, Translator } from './types.js'

/**
 * Create a quick translator instance
 * @param translations - Translation object
 * @param locale - Default locale
 * @returns Translator instance with __ function
 */
export const createI18n = (translations: TranslationData = {}, locale = 'en'): Translator => {
  return createTranslator(translations, locale)
}
