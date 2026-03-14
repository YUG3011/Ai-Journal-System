const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const prisma = require('../config/db');

const TOKEN_TTL = '7d';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  return jwt.sign(
    { email: user.email },
    jwtSecret,
    { subject: user.id, expiresIn: TOKEN_TTL }
  );
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, provider: 'credentials' } });
    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.provider !== 'credentials') {
      return res.status(400).json({ error: `Use ${user.provider} login for this account.` });
    }
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    return next(err);
  }
}

function buildOauthState(provider) {
  return jwt.sign({ provider }, jwtSecret, { expiresIn: '10m' });
}

function oauthPopupResponse(token, user) {
  return `<!doctype html><html><body><script>
    window.opener && window.opener.postMessage({ token: '${token}', user: ${JSON.stringify(user)} }, '*');
    window.close();
  </script></body></html>`;
}

async function googleStart(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  const state = buildOauthState('google');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  return res.json({ url: url.toString() });
}

async function googleCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code/state');
    jwt.verify(state, jwtSecret);
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    const { access_token } = tokenRes.data;
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const email = profileRes.data.email;
    const providerId = profileRes.data.sub;
    if (!email) return res.status(400).send('Email not available from Google');
    const user = await prisma.user.upsert({
      where: { email },
      update: { provider: 'google', providerId },
      create: { email, provider: 'google', providerId }
    });
    const token = signToken(user);
    res.set('Content-Type', 'text/html');
    return res.send(oauthPopupResponse(token, { id: user.id, email: user.email }));
  } catch (err) {
    return next(err);
  }
}

async function githubStart(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }
  const state = buildOauthState('github');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'read:user user:email');
  url.searchParams.set('state', state);
  return res.json({ url: url.toString() });
}

async function githubCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code/state');
    jwt.verify(state, jwtSecret);
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    }, { headers: { Accept: 'application/json' } });
    const { access_token } = tokenRes.data;
    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'ai-journal' }
    });
    const emailsRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'ai-journal' }
    });
    const primaryEmail = (emailsRes.data || []).find((e) => e.primary && e.verified)?.email;
    const fallbackEmail = (emailsRes.data || [])[0]?.email;
    const email = primaryEmail || fallbackEmail;
    const providerId = `${profileRes.data.id}`;
    if (!email) return res.status(400).send('Email not available from GitHub');
    const user = await prisma.user.upsert({
      where: { email },
      update: { provider: 'github', providerId },
      create: { email, provider: 'github', providerId }
    });
    const token = signToken(user);
    res.set('Content-Type', 'text/html');
    return res.send(oauthPopupResponse(token, { id: user.id, email: user.email }));
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, provider: true } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, googleStart, googleCallback, githubStart, githubCallback, me };
