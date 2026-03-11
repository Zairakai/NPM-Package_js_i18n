import { beforeEach, describe, expect, it } from 'vitest'
import { createTranslator } from '../src/translator.js'
import type { TranslationData, Translator } from '../src/types.js'

describe('createTranslator', () => {
  let translator: Translator
  const testTranslations: TranslationData = {
    en: {
      hello: 'Hello',
      welcome: 'Welcome, :name!',
      nested: {
        message: 'This is nested',
        with_params: 'Hello :name, you have :count messages',
      },
      pluralization: {
        item: '{0} No items|{1} One item|[2,*] :count items',
        simple: 'item|items',
      },
    },
    fr: {
      hello: 'Bonjour',
      welcome: 'Bienvenue, :name!',
      nested: {
        message: 'Ceci est imbriqué',
      },
    },
  }

  beforeEach(() => {
    translator = createTranslator(
      {
        en: {
          hello: 'Hello',
          goodbye: 'Goodbye',
          welcome: 'Welcome, :name!',
          nested: {
            message: 'This is nested',
            with_params: 'Hello {name}, you have {count} messages',
          },
          pluralization: {
            item: '{0} No items|{1} One item|[2,*] {count} items',
            simple: 'item|items',
          },
        },
        fr: {
          hello: 'Bonjour',
          goodbye: 'Au revoir',
          nested: {
            message: 'Ceci est un message imbriqué.',
          },
        },
      },
      'en'
    )
  })

  describe('basic translation', () => {
    it('should translate simple keys', () => {
      expect(translator.translate('hello')).toBe('Hello')
      expect(translator.__('hello')).toBe('Hello') // Alias
    })

    it('should return key if translation not found', () => {
      expect(translator.translate('nonexistent')).toBe('nonexistent')
    })

    it('should handle nested keys with dot notation', () => {
      expect(translator.translate('nested.message')).toBe('This is nested')
    })

    it('should return key if nested path not found', () => {
      expect(translator.translate('nested.nonexistent')).toBe('nested.nonexistent')
      expect(translator.translate('nonexistent.path')).toBe('nonexistent.path')
    })
  })

  describe('parameter replacement', () => {
    it('should replace simple parameters', () => {
      expect(translator.translate('welcome', { name: 'John' })).toBe('Welcome, John!')
    })

    it('should replace multiple parameters', () => {
      expect(translator.translate('nested.with_params', { name: 'John', count: 5 })).toBe(
        'Hello John, you have 5 messages'
      )
    })

    it('should leave unreplaced parameters as is', () => {
      expect(translator.translate('welcome', { age: 25 })).toBe('Welcome, :name!')
    })

    it('should handle empty replacement object', () => {
      expect(translator.translate('welcome', {})).toBe('Welcome, :name!')
    })
  })

  describe('pluralization', () => {
    it('should handle pluralization with count', () => {
      expect(translator.translate('pluralization.item', 0)).toBe('No items')
      expect(translator.translate('pluralization.item', 1)).toBe('One item')
      expect(translator.translate('pluralization.item', 2)).toBe('2 items')
      expect(translator.translate('pluralization.item', 5)).toBe('5 items')
    })

    it('should handle simple pluralization', () => {
      expect(translator.translate('pluralization.simple', 1)).toBe('item')
      expect(translator.translate('pluralization.simple', 2)).toBe('items')
      expect(translator.translate('pluralization.simple', 0)).toBe('items')
    })

    it('should combine pluralization with replacements', () => {
      const result = translator.translate('pluralization.item', 3, { extra: 'test' })
      expect(result).toBe('3 items')
    })
  })

  describe('parameter overloading', () => {
    it('should handle replacements as first parameter', () => {
      expect(translator.translate('welcome', { name: 'Jane' })).toBe('Welcome, Jane!')
    })

    it('should handle count and replacements', () => {
      expect(translator.translate('pluralization.item', 2, { extra: 'value' })).toBe('2 items')
    })

    it('should handle count as first parameter for pluralization', () => {
      expect(translator.translate('pluralization.item', 1)).toBe('One item')
    })
  })

  describe('locale management', () => {
    it('should return current locale', () => {
      expect(translator.getLocale()).toBe('en')
    })

    it('should set new locale', () => {
      translator.setLocale('fr')
      expect(translator.getLocale()).toBe('fr')
      expect(translator.translate('hello')).toBe('Bonjour')
    })

    it('should return key if locale not found', () => {
      translator.setLocale('es')
      expect(translator.translate('hello')).toBe('hello')
    })

    it('should get available locales', () => {
      const locales = translator.getAvailableLocales()
      expect(locales).toEqual(expect.arrayContaining(['en', 'fr']))
      expect(locales.length).toBe(2)
    })
  })

  describe('translation management', () => {
    it('should set translations for new locale', () => {
      translator.setTranslations('es', {
        hello: 'Hola',
        welcome: '¡Bienvenido, :name!',
      })

      translator.setLocale('es')
      expect(translator.translate('hello')).toBe('Hola')
      expect(translator.translate('welcome', { name: 'Juan' })).toBe('¡Bienvenido, Juan!')
    })

    it('should add translations to existing locale', () => {
      translator.addTranslations('en', {
        new_key: 'New translation',
        nested: {
          new_nested: 'New nested translation',
        },
      })

      expect(translator.translate('new_key')).toBe('New translation')
      expect(translator.translate('nested.new_nested')).toBe('New nested translation')
      // Should preserve existing translations
      expect(translator.translate('hello')).toBe('Hello')
    })

    it('should create locale if it does not exist when adding translations', () => {
      translator.addTranslations('de', {
        hello: 'Hallo',
      })

      translator.setLocale('de')
      expect(translator.translate('hello')).toBe('Hallo')
    })

    it('should merge with existing translations when adding', () => {
      translator.addTranslations('fr', {
        goodbye: 'Au revoir',
      })

      translator.setLocale('fr')
      expect(translator.translate('hello')).toBe('Bonjour') // Existing
      expect(translator.translate('goodbye')).toBe('Au revoir') // Added
    })
  })

  describe('hasTranslation', () => {
    it('should check if translation exists in current locale', () => {
      expect(translator.hasTranslation('hello')).toBe(true)
      expect(translator.hasTranslation('nonexistent')).toBe(false)
      expect(translator.hasTranslation('nested.message')).toBe(true)
      expect(translator.hasTranslation('nested.nonexistent')).toBe(false)
    })

    it('should check translation in specific locale', () => {
      expect(translator.hasTranslation('nested.with_params', 'en')).toBe(true)
      expect(translator.hasTranslation('nested.with_params', 'fr')).toBe(false)
    })

    it('should return false for non-existent locale', () => {
      expect(translator.hasTranslation('hello', 'es')).toBe(false)
    })

    it('should handle deep nested paths', () => {
      translator.setTranslations('test', {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      })

      expect(translator.hasTranslation('level1.level2.level3', 'test')).toBe(true)
      expect(translator.hasTranslation('level1.level2.level4', 'test')).toBe(false)
      expect(translator.hasTranslation('level1.level3', 'test')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty translator', () => {
      const emptyTranslator = createTranslator()
      expect(emptyTranslator.translate('hello')).toBe('hello')
      expect(emptyTranslator.getLocale()).toBe('en')
      expect(emptyTranslator.getAvailableLocales()).toEqual([])
    })

    it('should handle null and undefined values', () => {
      expect(translator.translate('')).toBe('')
    })

    it('should handle numeric keys', () => {
      translator.setTranslations('en', {
        ...testTranslations.en,
        '123': 'numeric key',
      })
      expect(translator.translate('123')).toBe('numeric key')
    })

    it('should return path when resolved value is an object, not a string', () => {
      // `nested` resolves to an object { message: '...', with_params: '...' }
      expect(translator.translate('nested')).toBe('nested')
      expect(translator.translate('pluralization')).toBe('pluralization')
    })

    it('should keep {key} placeholder when replacement is not provided', () => {
      // setTranslations adds a {key}-format string to test the fallback branch of replace(/{(\w+)}/g)
      translator.setTranslations('en', {
        ...testTranslations.en,
        curly: 'Hello {name}, you have {count} items',
      })
      // Only provide `name` — `{count}` must remain unchanged
      expect(translator.translate('curly', { name: 'Alice' })).toBe('Hello Alice, you have {count} items')
    })
  })
})
