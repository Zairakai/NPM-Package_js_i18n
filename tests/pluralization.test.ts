import { describe, expect, it } from 'vitest'
import { applyPluralization, selectPluralForm } from '../src/pluralization.js'

describe('selectPluralForm', () => {
  describe('simple pluralization', () => {
    it('should handle simple plural forms', () => {
      const message = 'item|items'

      expect(selectPluralForm(message, 0)).toBe('items') // 0 is plural
      expect(selectPluralForm(message, 1)).toBe('item') // 1 is singular
      expect(selectPluralForm(message, 2)).toBe('items') // 2+ is plural
      expect(selectPluralForm(message, 10)).toBe('items')
      expect(selectPluralForm(message, 100)).toBe('items')
    })

    it('should handle single form', () => {
      const message = 'always same'

      expect(selectPluralForm(message, 0)).toBe('always same')
      expect(selectPluralForm(message, 1)).toBe('always same')
      expect(selectPluralForm(message, 5)).toBe('always same')
    })
  })

  describe('exact match conditions', () => {
    it('should handle exact number matches', () => {
      const message = '{0} No items|{1} One item|{5} Exactly five|More items'

      expect(selectPluralForm(message, 0)).toBe('No items')
      expect(selectPluralForm(message, 1)).toBe('One item')
      expect(selectPluralForm(message, 5)).toBe('Exactly five')
      expect(selectPluralForm(message, 2)).toBe('More items') // Falls back
      expect(selectPluralForm(message, 10)).toBe('More items')
    })

    it('should handle multiple exact matches', () => {
      const message = '{0} None|{1} Single|{2} Pair|Many'

      expect(selectPluralForm(message, 0)).toBe('None')
      expect(selectPluralForm(message, 1)).toBe('Single')
      expect(selectPluralForm(message, 2)).toBe('Pair')
      expect(selectPluralForm(message, 3)).toBe('Many')
      expect(selectPluralForm(message, 100)).toBe('Many')
    })
  })

  describe('range conditions', () => {
    it('should handle range matches', () => {
      const message = '[1,5] Few|[6,10] Several|[11,*] Many'

      expect(selectPluralForm(message, 1)).toBe('Few')
      expect(selectPluralForm(message, 3)).toBe('Few')
      expect(selectPluralForm(message, 5)).toBe('Few')
      expect(selectPluralForm(message, 6)).toBe('Several')
      expect(selectPluralForm(message, 8)).toBe('Several')
      expect(selectPluralForm(message, 10)).toBe('Several')
      expect(selectPluralForm(message, 11)).toBe('Many')
      expect(selectPluralForm(message, 100)).toBe('Many')
    })

    it('should handle open-ended ranges', () => {
      const message = '[0,0] Zero|[1,1] One|[2,*] Multiple'

      expect(selectPluralForm(message, 0)).toBe('Zero')
      expect(selectPluralForm(message, 1)).toBe('One')
      expect(selectPluralForm(message, 2)).toBe('Multiple')
      expect(selectPluralForm(message, 1000)).toBe('Multiple')
    })

    it('should handle ranges with asterisk', () => {
      const message = '[*,5] Up to five|[6,*] More than five'

      expect(selectPluralForm(message, -10)).toBe('Up to five')
      expect(selectPluralForm(message, 0)).toBe('Up to five')
      expect(selectPluralForm(message, 3)).toBe('Up to five')
      expect(selectPluralForm(message, 5)).toBe('Up to five')
      expect(selectPluralForm(message, 6)).toBe('More than five')
      expect(selectPluralForm(message, 100)).toBe('More than five')
    })
  })

  describe('mixed conditions', () => {
    it('should handle exact matches with ranges', () => {
      const message = '{0} None|[1,5] Few|[6,19] Some|[20,*] Many'

      expect(selectPluralForm(message, 0)).toBe('None')
      expect(selectPluralForm(message, 1)).toBe('Few')
      expect(selectPluralForm(message, 3)).toBe('Few')
      expect(selectPluralForm(message, 5)).toBe('Few')
      expect(selectPluralForm(message, 6)).toBe('Some')
      expect(selectPluralForm(message, 15)).toBe('Some')
      expect(selectPluralForm(message, 19)).toBe('Some')
      expect(selectPluralForm(message, 20)).toBe('Many')
      expect(selectPluralForm(message, 100)).toBe('Many')
    })

    it('should handle complex Laravel-style format', () => {
      const message = '{0} No items|{1} One item|[2,*] :count items'

      expect(selectPluralForm(message, 0)).toBe('No items')
      expect(selectPluralForm(message, 1)).toBe('One item')
      expect(selectPluralForm(message, 2)).toBe(':count items')
      expect(selectPluralForm(message, 10)).toBe(':count items')
    })
  })

  describe('fallback behavior', () => {
    it('should fall back to simple plural if no conditions match', () => {
      const message = '{10} Special case|item|items'

      expect(selectPluralForm(message, 0)).toBe('items')
      expect(selectPluralForm(message, 1)).toBe('item')
      expect(selectPluralForm(message, 2)).toBe('items')
      expect(selectPluralForm(message, 5)).toBe('items')
      expect(selectPluralForm(message, 10)).toBe('Special case')
    })

    it('should return first part if no match found — exact condition fallback', () => {
      const message = '{10} Ten only|{20} Twenty only'

      expect(selectPluralForm(message, 5)).toBe('Ten only')
      expect(selectPluralForm(message, 15)).toBe('Ten only')
    })

    it('should return first part if no match found — range condition fallback', () => {
      // All parts are ranges, none match count=99, first part is a range → rangeMatch fallback
      const message = '[1,5] Few|[6,10] Several'

      expect(selectPluralForm(message, 99)).toBe('Few')
    })

    it('should return raw first part when no pattern matches', () => {
      // All parts start with { but invalid syntax → no match, no simpleParts, no exactMatch/rangeMatch
      const message = '{invalid} text|{also-invalid} other'

      expect(selectPluralForm(message, 5)).toBe('{invalid} text')
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace in conditions', () => {
      const message = '{ 0 } None | { 1 } One | [ 2 , * ] Many'

      expect(selectPluralForm(message, 0)).toBe('None')
      expect(selectPluralForm(message, 1)).toBe('One')
      expect(selectPluralForm(message, 2)).toBe('Many')
    })

    it('should handle malformed conditions gracefully', () => {
      const message = '{invalid} Bad|{1} One|items'

      expect(selectPluralForm(message, 0)).toBe('items')
      expect(selectPluralForm(message, 1)).toBe('One')
      expect(selectPluralForm(message, 2)).toBe('items')
    })

    it('should handle empty parts', () => {
      const message = '|items'

      expect(selectPluralForm(message, 0)).toBe('items')
      expect(selectPluralForm(message, 1)).toBe('')
      expect(selectPluralForm(message, 2)).toBe('items')
    })
  })
})

describe('applyPluralization', () => {
  it('should apply pluralization when translation contains pipes and count is provided', () => {
    const translation = '{0} No items|{1} One item|[2,*] :count items'

    expect(applyPluralization(translation, 0)).toBe('No items')
    expect(applyPluralization(translation, 1)).toBe('One item')
    expect(applyPluralization(translation, 5)).toBe(':count items')
  })

  it('should not apply pluralization when count is null', () => {
    const translation = 'item|items'

    expect(applyPluralization(translation, null)).toBe('item|items')
  })

  it('should not apply pluralization when translation has no pipes', () => {
    const translation = 'Simple translation'

    expect(applyPluralization(translation, 5)).toBe('Simple translation')
  })

  it('should handle edge cases', () => {
    expect(applyPluralization('item|items', 0)).toBe('items')
    expect(applyPluralization('', 5)).toBe('')
    expect(applyPluralization('no|pipes|here', null)).toBe('no|pipes|here')
  })

  it('should work with complex pluralization rules', () => {
    const translation = '[1,1] :count minute|[2,59] :count minutes|[60,*] :count hour(s)'

    expect(applyPluralization(translation, 1)).toBe(':count minute')
    expect(applyPluralization(translation, 30)).toBe(':count minutes')
    expect(applyPluralization(translation, 60)).toBe(':count hour(s)')
    expect(applyPluralization(translation, 120)).toBe(':count hour(s)')
  })
})
