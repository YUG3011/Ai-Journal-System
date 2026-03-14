const express = require('express');
const { body } = require('express-validator');
const { register, login, googleStart, googleCallback, githubStart, githubCallback, me } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters')
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('password').notEmpty().withMessage('password is required')
  ],
  validate,
  login
);

router.get('/me', requireAuth, me);

router.get('/google/start', googleStart);
router.get('/google/callback', googleCallback);
router.get('/github/start', githubStart);
router.get('/github/callback', githubCallback);

module.exports = router;
