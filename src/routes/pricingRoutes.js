const express = require('express');
const pricingController = require('../controllers/pricingController');

const router = express.Router();

// Publicly reachable calculation endpoint matrix lookup
router.post('/estimate', pricingController.estimateFare);

module.exports = router;