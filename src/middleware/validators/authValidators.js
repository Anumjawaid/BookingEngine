const Joi = require('joi');

exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name field cannot be left blank.',
      'any.required': 'Name is a required field.'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid, structured email address.',
      'any.required': 'Email is a required field.'
    }),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Phone number must follow international E.164 formatting (e.g., +1234567890).',
      'any.required': 'Phone number is a required field.'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long.',
      'any.required': 'Password is a required field.'
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400; // Bad Request
    return next(err);
  }
  next();
};