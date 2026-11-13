/**
 * Pluralization utilities for Laravel-style translation strings
 * Handles complex pluralization rules with conditions and ranges
 */

/**
 * Selects the appropriate plural form based on count
 * Supports Laravel formats:
 * - Simple: "item|items"
 * - With conditions: "{0} none|{1} one|[2,*] many"
 * - With ranges: "[1,19] some|[20,*] many"
 *
 * @param message - Translation string with plural forms
 * @param count - Count to determine plural form
 * @returns Selected plural form
 */
/**
 * Group of a regular expression match. The groups of the patterns used here
 * always take part in the match: the empty string is only for the type.
 */
const group = (match: RegExpMatchArray, index: number): string =>
  match[index] ?? ''

/**
 * Trimmed text of a part, empty when there is none
 */
const first = (part: string | undefined): string => part?.trim() ?? ''

export const selectPluralForm = (message: string, count: number): string => {
  const parts = message.split('|')

  // Check each part for conditions
  for (const part of parts) {
    const trimmedPart = part.trim()

    // Look for exact match conditions {n}
    const exactMatch = trimmedPart.match(/^{\s*(\d+)\s*}\s*(.*)$/)
    // Look for range conditions [n,m]
    const rangeMatch = trimmedPart.match(
      /^\[\s*(\d+|\*)\s*,\s*(\d+|\*)\s*\]\s*(.*)$/,
    )

    if (exactMatch) {
      // Exact number match {5}
      const exactNumber = parseInt(group(exactMatch, 1), 10)
      if (count === exactNumber) {
        return group(exactMatch, 2).trim()
      }
    } else if (rangeMatch) {
      // Range match [1,5] or [20,*]
      const min =
        rangeMatch[1] === '*' ? -Infinity : parseInt(group(rangeMatch, 1), 10)
      const max =
        rangeMatch[2] === '*' ? Infinity : parseInt(group(rangeMatch, 2), 10)

      if (count >= min && count <= max) {
        return group(rangeMatch, 3).trim()
      }
    }
  }

  // Fallback to simple plural logic (no special conditions)
  const simpleParts = parts.filter((part) => {
    const trimmed = part.trim()
    // eslint-disable-next-line no-useless-escape
    return !trimmed.match(/^[{\[]/) // No special condition markers
  })

  if (simpleParts.length >= 2) {
    // English pluralization: only 1 = singular, others (including 0) = plural
    return first(simpleParts[count === 1 ? 0 : 1])
  } else if (simpleParts.length === 1) {
    return first(simpleParts[0])
  }

  // Last resort: return first part, extracting content from patterns
  const firstPart = first(parts[0])

  // Try to extract content from patterns
  const exactMatch = firstPart.match(/^{\s*(\d+)\s*}\s*(.*)$/)
  const rangeMatch = firstPart.match(
    /^\[\s*(\d+|\*)\s*,\s*(\d+|\*)\s*\]\s*(.*)$/,
  )

  if (exactMatch) {
    return group(exactMatch, 2).trim()
  } else if (rangeMatch) {
    return group(rangeMatch, 3).trim()
  }

  return firstPart
}

/**
 * Apply pluralization rules to a translation
 * @param translation - Translation string
 * @param count - Count for pluralization
 * @returns Pluralized translation
 */
export const applyPluralization = (
  translation: string,
  count: number | null,
): string => {
  if (
    typeof translation === 'string' &&
    translation.includes('|') &&
    count !== null
  ) {
    return selectPluralForm(translation, count)
  }
  return translation
}
