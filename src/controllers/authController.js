const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const result = await authService.registerUser({ name, email, phone, password });

  res.status(201).json({
    status: 'success',
    token: result.token,
    data: { user: result.user }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  res.status(200).json({
    status: 'success',
    token: result.token,
    data: { user: result.user }
  });
});