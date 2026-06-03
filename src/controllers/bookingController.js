const Booking = require('../models/bookingModel');
const socketService = require('../services/socketService');
const emailService = require('../services/emailService'); // <-- Pull in the new service tool
const catchAsync = require('../utils/catchAsync');

// STEP 1: Request dropped ➔ Alert Client and Admin via Email
exports.createBookingRequest = catchAsync(async (req, res, next) => {
    const { origin, destination, fare, customerId } = req.body;

    // Populate user data automatically on save so we can extract their contact email safely
    const newBooking = await Booking.create({ customerId, origin, destination, fare, status: 'Awaiting_Invoice' });
    const populatedBooking = await newBooking.populate('customerId', 'name email');

    // Compile layout structure content
    const customerEmailHTML = emailService.getBookingDroppedTemplate(populatedBooking.customerId.name, populatedBooking);

    // ⚡ Universal Trigger Event 1: Fire to BOTH client and admin boxes concurrently
    await emailService.send(populatedBooking.customerId.email, 'Travel Manifest Received - Review Pending', customerEmailHTML);
    await emailService.send(process.env.ADMIN_EMAIL, 'ALERT: New System Reservation Awaiting Review', customerEmailHTML);

    socketService.sendToUser('admin_dashboard_group', 'new_request_received', populatedBooking);

    res.status(201).json({ status: 'success', data: populatedBooking });
});

// STEP 2: Invoice Sent ➔ Trigger Email with payment link
exports.sendInvoice = catchAsync(async (req, res, next) => {
    const { bookingId, invoiceUrl } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, {
        status: 'Invoiced', invoiceUrl, invoiceSentAt: Date.now()
    }, { new: true }).populate('customerId', 'name email');

    // ⚡ Universal Trigger Event 2: Send Invoice notification
    const invoiceHTML = emailService.getInvoiceIssuedTemplate(booking.customerId.name, booking.invoiceUrl, booking.fare);
    await emailService.send(booking.customerId.email, 'Action Required: Clear Your Travel Balance Invoice', invoiceHTML);

    socketService.sendToUser(booking.customerId.toString(), 'invoice_ready', { bookingId: booking._id });

    res.status(200).json({ status: 'success', data: booking });
});

// STEP 3: Payment Settled ➔ Trigger Payment Clear Confirmation Email
exports.confirmPayment = catchAsync(async (req, res, next) => {
    const { bookingId, paymentReferenceId } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, {
        status: 'Payment_Confirmed', paymentReferenceId, paymentConfirmedAt: Date.now()
    }, { new: true }).populate('customerId', 'name email');

    // ⚡ Universal Trigger Event 3: Send settlement clear notification
    const paymentHTML = emailService.getPaymentConfirmedTemplate(booking.customerId.name, booking.paymentReferenceId);
    await emailService.send(booking.customerId.email, 'Transaction Cleared - Travel Reservation Secured', paymentHTML);

    socketService.sendToUser(booking.customerId.toString(), 'payment_verified', { bookingId: booking._id });

    res.status(200).json({ status: 'success', data: booking });
});

// STEP 4: Admin Dispatches to fleet (Remains identical)
exports.dispatchToDrivers = catchAsync(async (req, res, next) => {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.status !== 'Payment_Confirmed') {
        const error = new Error('Cannot dispatch! Booking must be fully paid and verified first.');
        error.statusCode = 400;
        return next(error);
    }

    booking.status = 'Dispatched_To_Drivers';
    await booking.save();

    socketService.io.emit('ride_available', { bookingDetails: booking });
    res.status(200).json({ status: 'success', data: booking });
});
// 2. Driver accepts the booking request
exports.confirmBooking = catchAsync(async (req, res, next) => {
    const { bookingId, driverId } = req.body;

    // Find the booking and make sure it hasn't already been taken by another driver
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'Pending') {
        const error = new Error('Booking is no longer available or has already been accepted.');
        error.statusCode = 400;
        return next(error);
    }

    // Update trip status state inside MongoDB
    booking.driverId = driverId;
    booking.status = 'Confirmed';
    await booking.save();

    // ⚡ THE MASTER MATCH STEP: Push a real-time event directly to the customer's browser socket
    socketService.sendToUser(booking.customerId.toString(), 'booking_confirmed', {
        message: 'Your ride has been successfully booked!',
        bookingDetails: booking
    });

    res.status(200).json({
        status: 'success',
        message: 'Booking successfully assigned to driver.',
        data: booking
    });
});