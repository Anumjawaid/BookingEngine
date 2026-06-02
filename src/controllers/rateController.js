const csvService = require('../services/csvService');
const Rate = require('../models/rateModel');
const catchAsync = require('../utils/catchAsync');

exports.uploadRateMatrix = catchAsync(async (req, res, next) => {
  // ⚡ Define the strict structural checklist rule for this file import
  const expectedColumns = ['originCity', 'destinationCity', 'basePrice', 'perKmRate', 'vehicleType'];

  // Run the universal engine worker path
  const result = await csvService.uploadAndProcessBulkImport(
    req.file,            // Raw file stream asset from Multer
    'rate-matrices',     // Firebase Storage cloud root folder target name
    Rate,                // Mongoose destination collection pointer
    expectedColumns      // Dynamic header mapping array
  );

  res.status(200).json({
    status: 'success',
    message: 'Global inter-city travel rates matrix populated successfully.',
    data: result
  });
});