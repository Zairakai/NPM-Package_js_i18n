/**
 * Tests for Zod runtime validation schemas
 */

import { describe, expect, it } from 'vitest'
import {
  CountOrReplacementsSchema,
  ReplacementParametersSchema,
  TranslationDataSchema,
  TranslationObjectSchema,
} from '../src/schemas.js'

describe('TranslationObjectSchema', () => {
  it('validates flat string values', () => {
    const result = TranslationObjectSchema.safeParse({ hello: 'world', goodbye: 'bye' })
    expect(result.success).toBe(true)
  })

  it('validates nested objects', () => {
    const result = TranslationObjectSchema.safeParse({
      auth: { login: 'Sign in', logout: 'Sign out' },
      home: 'Home',
    })
    expect(result.success).toBe(true)
  })

  it('validates deeply nested objects', () => {
    const result = TranslationObjectSchema.safeParse({
      a: { b: { c: 'deep' } },
    })
    expect(result.success).toBe(true)
  })

  it('rejects number values', () => {
    const result = TranslationObjectSchema.safeParse({ count: 42 })
    expect(result.success).toBe(false)
  })

  it('rejects array values', () => {
    const result = TranslationObjectSchema.safeParse({ items: ['a', 'b'] })
    expect(result.success).toBe(false)
  })

  it('accepts empty object', () => {
    const result = TranslationObjectSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('TranslationDataSchema', () => {
  it('validates locale map with translation objects', () => {
    const result = TranslationDataSchema.safeParse({
      en: { hello: 'Hello' },
      fr: { hello: 'Bonjour' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty map', () => {
    const result = TranslationDataSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects locale with non-object value', () => {
    const result = TranslationDataSchema.safeParse({ en: 'not an object' })
    expect(result.success).toBe(false)
  })

  it('rejects locale with array value', () => {
    const result = TranslationDataSchema.safeParse({ en: ['a', 'b'] })
    expect(result.success).toBe(false)
  })

  it('rejects locale with numeric leaf values', () => {
    const result = TranslationDataSchema.safeParse({ en: { count: 99 } })
    expect(result.success).toBe(false)
  })
})

describe('ReplacementParametersSchema', () => {
  it('validates string values', () => {
    const result = ReplacementParametersSchema.safeParse({ name: 'Alice' })
    expect(result.success).toBe(true)
  })

  it('validates number values', () => {
    const result = ReplacementParametersSchema.safeParse({ count: 5 })
    expect(result.success).toBe(true)
  })

  it('validates mixed string and number', () => {
    const result = ReplacementParametersSchema.safeParse({ name: 'Bob', count: 3 })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = ReplacementParametersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects boolean values', () => {
    const result = ReplacementParametersSchema.safeParse({ active: true })
    expect(result.success).toBe(false)
  })

  it('rejects object values', () => {
    const result = ReplacementParametersSchema.safeParse({ nested: { a: 'b' } })
    expect(result.success).toBe(false)
  })
})

describe('CountOrReplacementsSchema', () => {
  it('accepts a number (case 1 — count for pluralization)', () => {
    expect(CountOrReplacementsSchema.safeParse(3).success).toBe(true)
  })

  it('accepts a replacements object (case 2 — named replacements)', () => {
    expect(CountOrReplacementsSchema.safeParse({ name: 'Alice', count: 2 }).success).toBe(true)
  })

  it('accepts an empty object (case 2 — no replacements)', () => {
    expect(CountOrReplacementsSchema.safeParse({}).success).toBe(true)
  })

  it('rejects a boolean', () => {
    expect(CountOrReplacementsSchema.safeParse(true).success).toBe(false)
  })

  it('rejects an object with invalid value types', () => {
    expect(CountOrReplacementsSchema.safeParse({ name: [1, 2] }).success).toBe(false)
  })
})

describe('translate() Zod validation (case 1+2+3)', () => {
  it('throws when second param is neither number nor object', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator({ en: { hello: 'Hi' } })
    expect(() => t.translate('hello', true as never)).toThrow()
  })

  it('throws when third param is invalid replacements', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator({ en: { hello: 'Hi :name' } })
    expect(() => t.translate('hello', 1, { name: true } as never)).toThrow()
  })

  it('accepts case 1: (path, count)', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator({ en: { items: '{0} item|{1} item|[2,*] :count items' } })
    expect(() => t.translate('items', 3)).not.toThrow()
  })

  it('accepts case 2: (path, replacements)', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator({ en: { hello: 'Hello :name' } })
    expect(() => t.translate('hello', { name: 'Bob' })).not.toThrow()
  })

  it('accepts case 3: (path, count, replacements)', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator({ en: { items: '[2,*] :count items for :name' } })
    expect(() => t.translate('items', 5, { name: 'Alice' })).not.toThrow()
  })
})

describe('createTranslator Zod validation', () => {
  it('throws on invalid translations passed to createTranslator', async () => {
    const { createTranslator } = await import('../src/translator.js')
    expect(() => createTranslator({ en: 'not an object' } as never)).toThrow()
  })

  it('throws on invalid translations passed to setTranslations', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator()
    expect(() => t.setTranslations('en', { bad: 42 } as never)).toThrow()
  })

  it('throws on invalid translations passed to addTranslations', async () => {
    const { createTranslator } = await import('../src/translator.js')
    const t = createTranslator()
    expect(() => t.addTranslations('en', { bad: true } as never)).toThrow()
  })
})
