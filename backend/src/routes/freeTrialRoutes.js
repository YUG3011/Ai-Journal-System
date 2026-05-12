const express = require('express');
const { body } = require('express-validator');
const { registerFreeTrial } = require('../controllers/freeTrialController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/free-trial',
  [
    body('name').isString().trim().notEmpty().withMessage('name must be a non-empty string'),
    body('age').isInt({ min: 1, max: 120 }).withMessage('age must be a number between 1 and 120')
  ],
  validate,
  registerFreeTrial
);

module.exports = router;
