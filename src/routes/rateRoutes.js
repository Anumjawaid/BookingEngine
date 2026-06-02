const express = require('express');
const rateController = require('../controllers/rateController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Enforce single-field upload named 'file' through multipart payload parameters
router.post('/upload-matrix', upload.single('file'), rateController.uploadRateMatrix);

module.exports = router;