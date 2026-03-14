const express = require('express');
const { body, query } = require('express-validator');
const {
  createEntry,
  getEntries,
  analyzeEntry,
  analyzeStream,
  getInsights,
  deleteEntry
} = require('../controllers/journalController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/journal',
  [
    body('ambience').isIn(['forest', 'ocean', 'mountain']).withMessage('ambience must be forest|ocean|mountain'),
    body('text').isString().notEmpty().withMessage('text must not be empty')
  ],
  requireAuth,
  validate,
  createEntry
);

router.get(
  '/journal',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100')
  ],
  requireAuth,
  validate,
  getEntries
);

router.post(
  '/journal/analyze',
  [body('text').isString().notEmpty().withMessage('text must not be empty')],
  validate,
  analyzeEntry
);

router.post('/journal/analyze/stream', validate, analyzeStream);

router.get('/journal/insights', requireAuth, getInsights);

router.delete('/journal/:id', requireAuth, deleteEntry);

module.exports = router;
