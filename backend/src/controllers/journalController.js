const prisma = require('../config/db');
const { analyzeText } = require('../services/llmService');
const { calculateInsights } = require('../utils/insightsCalculator');

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

module.exports = {
  createEntry,
  getEntries,
  analyzeEntry,
  analyzeStream,
  getInsights,
  deleteEntry
};
