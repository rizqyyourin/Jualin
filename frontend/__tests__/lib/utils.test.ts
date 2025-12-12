import { cn } from '@/lib/utils'

describe('Utils - cn function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('removes falsy values', () => {
    const result = cn('px-2', false && 'hidden', undefined, 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
    expect(result).not.toContain('hidden')
  })

  it('handles object syntax', () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      'hidden': false,
    })
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('returns string result', () => {
    const result = cn('px-2', 'px-4')
    expect(typeof result).toBe('string')
  })
})

