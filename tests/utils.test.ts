import { describe, it, expect } from 'vitest'
import { formatPrice, truncate, getInitials } from '../lib/utils'

describe('lib/utils', () => {
  describe('formatPrice', () => {
    it('formats numbers to IDR currency correctly', () => {
      // Non-breaking spaces might be used by Intl in some environments, so we do a general check
      const formatted = formatPrice(150000)
      expect(formatted).toMatch(/Rp/)
      expect(formatted).toMatch(/150\.000/)
    })

    it('returns "Nego" when amount is null or undefined', () => {
      expect(formatPrice(null)).toBe('Nego')
      expect(formatPrice(undefined)).toBe('Nego')
    })
  })

  describe('truncate', () => {
    it('truncates string longer than maxLength', () => {
      expect(truncate('Hello World', 5)).toBe('Hello…')
    })

    it('returns original string if shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })
  })

  describe('getInitials', () => {
    it('gets initials for a full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('gets initials for single name', () => {
      expect(getInitials('Alice')).toBe('A')
    })
  })
})