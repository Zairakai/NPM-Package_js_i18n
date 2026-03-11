import { describe, expect, it } from 'vitest'

describe('main exports', () => {
  it('should export translator functions', async () => {
    const translatorExports = await import('../src/translator.js')

    expect(translatorExports.createTranslator).toBeDefined()
    expect(typeof translatorExports.createTranslator).toBe('function')
  })

  it('should export pluralization functions', async () => {
    const pluralizationExports = await import('../src/pluralization.js')

    expect(pluralizationExports.selectPluralForm).toBeDefined()
    expect(pluralizationExports.applyPluralization).toBeDefined()
    expect(typeof pluralizationExports.selectPluralForm).toBe('function')
    expect(typeof pluralizationExports.applyPluralization).toBe('function')
  })

  it('should export main index file', async () => {
    const mainExports = await import('../src/index.js')

    // Should re-export all functions from submodules
    expect(Object.keys(mainExports).length).toBeGreaterThan(0)

    // Test a few key functions are available in main export
    expect(mainExports.createTranslator).toBeDefined()
    expect(mainExports.selectPluralForm).toBeDefined()
    expect(mainExports.applyPluralization).toBeDefined()
  })

  it('should create working translator from main export', async () => {
    const { createTranslator } = await import('../src/index.js')

    const translator = createTranslator({
      en: {
        test: 'Test message',
        with_param: 'Hello :name',
      },
    })

    expect(translator.translate('test')).toBe('Test message')
    expect(translator.translate('with_param', { name: 'World' })).toBe('Hello World')
  })

  it('should create working translator via createI18n shorthand', async () => {
    const { createI18n } = await import('../src/index.js')

    const translator = createI18n({ en: { hello: 'Hello' } }, 'en')

    expect(translator.translate('hello')).toBe('Hello')
    expect(translator.getLocale()).toBe('en')
  })
})
