function calculateInsights(entries) {
  const totalEntries = entries.length;
  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      topEmotion: null,
      mostUsedAmbience: null,
      recentKeywords: []
    };
  }

  const emotionCount = {};
  const ambienceCount = {};
  const recentKeywords = [];

  entries.forEach((entry) => {
    if (entry.emotion) {
      emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
    }
    if (entry.ambience) {
      ambienceCount[entry.ambience] = (ambienceCount[entry.ambience] || 0) + 1;
    }
    if (Array.isArray(entry.keywords)) {
      recentKeywords.push(...entry.keywords);
    }
  });

  const topEmotion = Object.keys(emotionCount).reduce((top, curr) => {
    if (top === null || emotionCount[curr] > emotionCount[top]) return curr;
    return top;
  }, null);

  const mostUsedAmbience = Object.keys(ambienceCount).reduce((top, curr) => {
    if (top === null || ambienceCount[curr] > ambienceCount[top]) return curr;
    return top;
  }, null);

  // Limit recent keywords to the most recent 20 keywords to avoid payload bloat
  const limitedRecentKeywords = recentKeywords.slice(-20);

  return {
    totalEntries,
    topEmotion,
    mostUsedAmbience,
    recentKeywords: limitedRecentKeywords
  };
}

module.exports = { calculateInsights };
