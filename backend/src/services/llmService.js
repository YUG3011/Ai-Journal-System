const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Redis = require('ioredis');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. The analyze endpoint will fail until it is provided.');
}

let genAI = null;
let model = null;

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
let redisClient = null;
let redisReady = false;

function ensureRedis() {
  if (redisClient) return redisClient;
  try {
    redisClient = new Redis(redisUrl);
    redisReady = true;
    redisClient.on('error', (err) => {
      redisReady = false;
      console.warn('Redis error (will fallback to in-memory cache):', err && err.message ? err.message : err);
    });
    redisClient.on('end', () => {
      redisReady = false;
    });
    redisClient.on('ready', () => {
      redisReady = true;
    });
  } catch (e) {
    console.warn('Redis init failed (will fallback to in-memory cache):', e && e.message ? e.message : e);
    redisClient = null;
    redisReady = false;
  }
  return redisClient;
}

function ensureClient() {
  if (genAI && model) return;
  try {
    genAI = new GoogleGenerativeAI(apiKey || '');
    const modelName = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME || 'models/text-bison-001';
    model = genAI.getGenerativeModel({ model: modelName });
  } catch (e) {
    console.error('GoogleGenerativeAI lazy-init warning:', e && e.stack ? e.stack : (e.message || e));
    // show which envs are present (without printing the key)
    try {
      const hasKey = !!process.env.GEMINI_API_KEY;
      const modelEnv = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME || null;
      console.error('Env status: GEMINI_API_KEY present=', hasKey, 'GEMINI_MODEL=', modelEnv);
    } catch (ee) {
      console.error('Error reading process.env for diagnostics', ee && ee.stack ? ee.stack : ee);
    }
    genAI = null;
    model = null;
  }
}

const cache = new Map();
const ONE_DAY_SECONDS = 60 * 60 * 24;

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    // Try to extract JSON block if wrapped
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse LLM response as JSON');
  }
}

async function analyzeText(text) {
  const key = hashText(text);
  ensureRedis();

  // Try Redis first, then in-memory
  if (redisReady && redisClient) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return { ...JSON.parse(cached), cached: true, source: 'redis' };
      }
    } catch (e) {
      console.warn('Redis get failed (fallback to in-memory):', e && e.message ? e.message : e);
    }
  }

  if (cache.has(key)) {
    return { ...cache.get(key), cached: true, source: 'memory' };
  }
  // Ensure client is initialized before checking availability
  ensureClient();
  if (!apiKey || !model) {
    console.error('analyzeText: apiKey present=', !!apiKey, 'model present=', !!model);
    const err = new Error('GEMINI_API_KEY not configured or Gemini client unavailable');
    err.status = 403;
    throw err;
  }

  const prompt = `You are an emotion analysis assistant. Given a user's journal text, return a strict JSON object with keys emotion (one word), keywords (array of 1-5 short words), summary (short sentence). Keep it terse.\nInput: "${text}"`;

  let result;
  try {
    // lazy-init client/model to avoid heavy work at module load
    ensureClient();
    if (!model) {
      const err = new Error('Gemini client/model unavailable');
      err.status = 503;
      throw err;
    }
    result = await model.generateContent(prompt);
  } catch (e) {
    // If Gemini fails with 404 (unsupported model) and OpenAI key is present, fallback to OpenAI
    const msg = e && (e.message || JSON.stringify(e));
    console.error('Gemini request error:', msg);
    const isNotFound = (e && (e.status === 404)) || (typeof msg === 'string' && msg.includes('404')) || (typeof msg === 'string' && msg.toLowerCase().includes('not found'));
    const openaiKey = process.env.OPENAI_API_KEY;
    if (isNotFound && openaiKey) {
      try {
        console.error('Falling back to OpenAI because Gemini model not found.');
        const openaiResp = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an emotion analysis assistant. Return STRICT JSON with keys: emotion (one word), keywords (array of 1-5 words), summary (short sentence).' },
              { role: 'user', content: `Analyze the following journal text and return only JSON: ${text}` }
            ],
            max_tokens: 200,
            temperature: 0.2
          },
          {
            headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' }
          }
        );
        const content = openaiResp.data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = parseJsonFromText(content);
          const normalized = {
            emotion: parsed.emotion || null,
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
            summary: parsed.summary || null
          };
          cache.set(key, normalized);
          return { ...normalized, cached: false, fallback: 'openai' };
        }
      } catch (oe) {
        console.error('OpenAI fallback failed:', oe && (oe.message || oe));
      }
    }

    const err = new Error('LLM request failed: ' + (e.message || 'unknown') + '. If using Google Gemini, ensure GEMINI_MODEL is set to a supported model for your account.');
    if (e.status) err.status = e.status;
    throw err;
  }

  const responseText = result.response?.text();
  if (!responseText) {
    const err = new Error('Empty response from Gemini');
    err.status = 502;
    throw err;
  }

  const parsed = parseJsonFromText(responseText);
  const normalized = {
    emotion: parsed.emotion || null,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    summary: parsed.summary || null
  };

  // Write-through cache: in-memory and Redis (with TTL) but never fail the request
  cache.set(key, normalized);
  if (redisReady && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(normalized), 'EX', ONE_DAY_SECONDS);
    } catch (e) {
      console.warn('Redis set failed (cache will remain in-memory only):', e && e.message ? e.message : e);
    }
  }

  return { ...normalized, cached: false };
}

module.exports = { analyzeText };
