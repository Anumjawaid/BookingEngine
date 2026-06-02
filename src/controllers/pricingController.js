const pricingService = require('../services/pricingService');
const catchAsync = require('../utils/catchAsync');

exports.estimateFare = catchAsync(async (req, res, next) => {
  const { origin, destination, distance, vehicleType, condition } = req.body;

  // Basic input validation parameters gatekeeper check
  if (!origin || !destination || !distance || !vehicleType) {
    const error = new Error('Missing calculation parameters. Required fields: origin, destination, distance, vehicleType.');
    error.statusCode = 400;
    return next(error);
  }

  const fareBreakdown = await pricingService.calculateTripFare(
    origin,
    destination,
    Number(distance),
    vehicleType,
    condition
  );

  res.status(200).json({
    status: 'success',
    data: fareBreakdown
  });
});