/**
 * Zod schemas for runtime validation of translation data structures
 */

import { z } from 'zod'
import type { ReplacementParameters, TranslationData, TranslationObject } from './types.js'

/**
 * Recursive schema for a translation value (string or nested TranslationObject)
 */
const TranslationValueSchema: z.ZodType<string | TranslationObject> = z.lazy(() =>
  z.union([z.string(), z.record(z.string(), TranslationValueSchema)])
) as z.ZodType<string | TranslationObject>

/**
 * Schema for a locale's translation object (flat or nested key/value pairs)
 */
export const TranslationObjectSchema: z.ZodType<TranslationObject> = z.record(
  z.string(),
  TranslationValueSchema
) as z.ZodType<TranslationObject>

/**
 * Schema for the full translation data map (locale → TranslationObject)
 */
export const TranslationDataSchema: z.ZodType<TranslationData> = z.record(z.string(), TranslationObjectSchema)

/**
 * Schema for placeholder replacement parameters
 */
export const ReplacementParametersSchema: z.ZodType<ReplacementParameters> = z.record(
  z.string(),
  z.union([z.string(), z.number()])
)

/**
 * Schema for the second parameter of translate():
 * either a count (number) for pluralization or a replacements object
 */
export const CountOrReplacementsSchema = z.union([z.number(), ReplacementParametersSchema])
