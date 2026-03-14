const { calculateInsights } = require('./insightsCalculator');

describe('calculateInsights', () => {
  test('returns zeroed insights when empty', () => {
    const result = calculateInsights([]);
    expect(result).toEqual({
      totalEntries: 0,
      topEmotion: null,
      mostUsedAmbience: null,
      recentKeywords: []
    });
  });

  test('aggregates metrics', () => {
    const entries = [
      { emotion: 'calm', ambience: 'forest', keywords: ['rain'], createdAt: new Date() },
      { emotion: 'focus', ambience: 'mountain', keywords: ['focus', 'peak'], createdAt: new Date() },
      { emotion: 'calm', ambience: 'forest', keywords: ['calm'], createdAt: new Date() }
    ];
    const result = calculateInsights(entries);
    expect(result.totalEntries).toBe(3);
    expect(result.topEmotion).toBe('calm');
    expect(result.mostUsedAmbience).toBe('forest');
    expect(result.recentKeywords).toEqual(['rain', 'focus', 'peak', 'calm']);
  });
});
