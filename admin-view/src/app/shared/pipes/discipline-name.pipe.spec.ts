import { describe, expect, it } from 'vitest';

import { DisciplineNamePipe } from './discipline-name.pipe';

describe('DisciplineNamePipe', () => {
  const pipe = new DisciplineNamePipe();
  const type = { id: 2, name: 'Jungen 18 B 1201-1400' };

  it('shows the short name of a discipline that has one', () => {
    expect(pipe.transform(type, { 2: 'J18 B' })).toBe('J18 B');
  });

  it('shows the full name of a discipline without a short name', () => {
    expect(pipe.transform(type, { 3: 'D' })).toBe('Jungen 18 B 1201-1400');
  });

  it('shows the full name while the short names are not loaded', () => {
    expect(pipe.transform(type, null)).toBe('Jungen 18 B 1201-1400');
  });

  it('shows nothing without a discipline', () => {
    expect(pipe.transform(undefined, { 2: 'J18 B' })).toBe('');
  });
});
