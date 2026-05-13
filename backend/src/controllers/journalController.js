const prisma = require('../config/db');
const { analyzeText } = require('../services/llmService');
const { calculateInsights } = require('../utils/insightsCalculator');
const { generateEmotionInsightsPdf } = require('../utils/pdfGenerator');

async function createEntry(req, res, next) {
  try {
    const { ambience, text } = req.body;
    const userId = req.user?.id;
    if (!userId || !ambience || !text) {
      return res.status(400).json({ error: 'userId, ambience, and text are required' });
    }

    let analysis = null;
    try {
      analysis = await analyzeText(text);
    } catch (e) {
      // Don't block entry creation if LLM fails; store without analysis and flag the error
      console.warn('Analysis failed during createEntry:', e.message || e);
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        ambience,
        text,
        emotion: analysis?.emotion || null,
        keywords: analysis?.keywords || [],
        summary: analysis?.summary || null
      }
    });

    // Update Streak Logic
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      let newStreak = user.currentStreak;
      let maxStreak = user.longestStreak;
      let activeDays = user.totalActiveDays;
      let lastEntry = user.lastEntryDate;

      if (lastEntry) {
        const lastDate = new Date(lastEntry);
        lastDate.setUTCHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays === 1) {
          newStreak += 1;
          activeDays += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
          activeDays += 1;
        }
      } else {
        newStreak = 1;
        activeDays = 1;
      }

      if (newStreak > maxStreak) {
        maxStreak = newStreak;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: maxStreak,
          totalActiveDays: activeDays,
          lastEntryDate: new Date()
        }
      });
    }

    const payload = { entry };
    if (!analysis) payload.analysisError = 'Analysis unavailable (see server logs)';
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

async function getEntries(req, res, next) {
  try {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [entries, totalEntries] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.journalEntry.count({ where: { userId, deletedAt: null } })
    ]);

    res.json({ entries, page, limit, totalEntries });
  } catch (err) {
    next(err);
  }
}

async function analyzeEntry(req, res, next) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    const analysis = await analyzeText(text);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
}

// Streaming analyze: streams the summary back in chunks using plain text chunks.
async function analyzeStream(req, res, next) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Use non-streaming analyzer to produce a full analysis, then stream the summary
    const analysis = await analyzeText(text);
    const summary = (analysis && analysis.summary) ? String(analysis.summary) : '';

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    // First send emotion and keywords as JSON lines
    res.write(JSON.stringify({ type: 'meta', emotion: analysis.emotion || null, keywords: analysis.keywords || [] }) + '\n');

    // Stream the summary in chunks (split by words into small groups)
    const words = summary.split(/\s+/);
    const chunkSize = 8;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      res.write(JSON.stringify({ type: 'chunk', text: chunk }) + '\n');
      // small pause to emulate streaming tokens
      await new Promise((r) => setTimeout(r, 80));
    }

    // Finalize with an 'end' message including full analysis
    res.write(JSON.stringify({ type: 'end', analysis }) + '\n');
    res.end();
  } catch (err) {
    next(err);
  }
}

async function getInsights(req, res, next) {
  try {
    const userId = req.user?.id;
    const entries = await prisma.journalEntry.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });
    const insights = calculateInsights(entries);
    res.json(insights);
  } catch (err) {
    next(err);
  }
}

async function deleteEntry(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const entryId = Number(id);
    if (!entryId) return res.status(400).json({ error: 'invalid id' });

    console.log('deleteEntry called by user:', userId, 'for id:', entryId);
    const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
    console.log('entry lookup result:', !!entry, entry ? { id: entry.id, userId: entry.userId, deletedAt: entry.deletedAt } : null);
    if (!entry) return res.status(404).json({ error: 'entry not found' });
    if (entry.userId !== userId) return res.status(403).json({ error: 'not allowed' });

    await prisma.journalEntry.update({ where: { id: entryId }, data: { deletedAt: new Date() } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function exportPdf(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const options = req.body;
    
    // Time filter logic
    const whereClause = { userId, deletedAt: null };
    if (options.timeFilter) {
      const now = new Date();
      if (options.timeFilter === 'today') {
        const start = new Date(now.setHours(0,0,0,0));
        whereClause.createdAt = { gte: start };
      } else if (options.timeFilter === 'this_week') {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        whereClause.createdAt = { gte: start };
      } else if (options.timeFilter === 'this_month') {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        whereClause.createdAt = { gte: start };
      } else if (options.timeFilter === 'this_year') {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        whereClause.createdAt = { gte: start };
      }
    }

    const [user, entries] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.journalEntry.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } })
    ]);

    const pdfBuffer = await generateEmotionInsightsPdf(options, user, entries);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Emotion_Insights.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEntry,
  getEntries,
  analyzeEntry,
  analyzeStream,
  getInsights,
  deleteEntry,
  exportPdf
};
