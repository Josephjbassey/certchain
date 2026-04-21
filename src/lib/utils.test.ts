import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('px-2', 'py-1', 'text-sm');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-sm');
  });

  it('deduplicates conflicting tailwind classes via tailwind-merge', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles conditional and falsy values', () => {
    const result = cn('text-sm', false && 'hidden', undefined, null as unknown as string, 'block');
    expect(result).toBe('text-sm block');
  });
});
