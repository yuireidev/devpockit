import {
  bumpRecentToolIds,
  togglePinnedToolId,
} from '@/libs/tool-activity-storage';

describe('tool-activity-storage', () => {
  describe('bumpRecentToolIds', () => {
    it('moves tool to front and dedupes', () => {
      expect(bumpRecentToolIds(['b', 'c', 'a'], 'a')).toEqual(['a', 'b', 'c']);
    });

    it('caps length', () => {
      const current = Array.from({ length: 12 }, (_, i) => `t${i}`);
      const next = bumpRecentToolIds(current, 'new');
      expect(next).toHaveLength(12);
      expect(next[0]).toBe('new');
    });
  });

  describe('togglePinnedToolId', () => {
    it('adds and removes pin', () => {
      expect(togglePinnedToolId([], 'a')).toEqual(['a']);
      expect(togglePinnedToolId(['a'], 'a')).toEqual([]);
    });

    it('drops oldest when at max pins', () => {
      const full = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
      expect(togglePinnedToolId(full, 'z')).toEqual([...full.slice(1), 'z']);
    });
  });
});
