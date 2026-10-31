import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../content';
import { search } from './search';

describe('search', () => {
  it('returns nothing for an empty query', () => {
    expect(search('   ')).toEqual([]);
  });
  it('ranks a lesson whose title matches above body-text matches', () => {
    const l = ALL_LESSONS[5];
    const r = search(l.title);
    expect(r[0]).toMatchObject({ kind: 'lesson', title: l.title });
  });
  it('finds glossary terms', () => {
    const [term] = ALL_LESSONS[0].terms[0];
    expect(search(term).some((r) => r.kind === 'term' && r.title === term)).toBe(true);
  });
  it('requires every word to match', () => {
    expect(search('groupby zzzqqq')).toEqual([]);
    expect(search('groupby').length).toBeGreaterThan(0);
  });
  it('is case-insensitive and searches the learner notes', () => {
    const id = ALL_LESSONS[0].id;
    const r = search('BANANA', { [id]: 'remember: banana split test' });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ kind: 'note', to: expect.stringContaining(`${id}#notes`) });
  });
});
