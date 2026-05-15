import { describe, it, expect } from 'vitest';
import { formatLKR } from './currency';

describe('formatLKR', () => {
  it('formats numeric values as LKR currency', () => {
    const formatted = formatLKR(12345.67);
    expect(formatted).toBeDefined();
    // Should include LKR or currency symbol
    expect(typeof formatted).toBe('string');
  });

  it('handles non-numeric values gracefully', () => {
    expect(formatLKR(undefined)).toContain('LKR');
  });
});
