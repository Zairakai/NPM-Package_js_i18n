import { describe, expect, it } from 'vitest'
import { createTranslator } from '../../src/translator'

describe('translator', () => {
  it('translates keys with replacements', () => {
    const t = createTranslator(
      {
        en: {
          greeting: 'Hello :name',
          nested: {
            welcome: 'Welcome {name}',
          },
        },
      },
      'en'
    )

    expect(t.__('greeting', { name: 'Ada' })).toBe('Hello Ada')
    expect(t.__('nested.welcome', { name: 'Ada' })).toBe('Welcome Ada')
  })

  it('handles pluralization and count replacement', () => {
    const t = createTranslator({
      en: {
        apples: '{0} none|{1} one|[2,*] :count apples',
      },
    })

    expect(t.__('apples', 0)).toBe('none')
    expect(t.__('apples', 1)).toBe('one')
    expect(t.__('apples', 4)).toBe('4 apples')
  })

  it('returns key when missing', () => {
    const t = createTranslator({ en: { greeting: 'Hi' } })
    expect(t.__('missing.key')).toBe('missing.key')
  })
})
