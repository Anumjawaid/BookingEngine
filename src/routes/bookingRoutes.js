const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/request', bookingController.createBookingRequest);
router.post('/confirm', bookingController.confirmBooking);
router.post('/send-invoice', bookingController.sendInvoice);
router.post('/dispatch', bookingController.dispatchBooking);

module.exports = router;