const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((err) => ({ field: err.param, message: err.msg }));
  const error = new Error('Invalid request');
  error.status = 400;
  error.details = formatted;
  return next(error);
}

module.exports = validate;