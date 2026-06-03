const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    // 🧠 Creates a reusable connection pool for high-velocity message delivery
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      auth: {
        user: process.env.SMTP_USER,
        季pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Core Universal Dispatch Method
   * @param {string|Array<string>} to - Single email string or array of recipient emails
   * @param {string} subject - The email subject line header
   * @param {string} htmlTemplate - Raw HTML compiled layout string
   */
  async send(to, subject, htmlTemplate) {
    try {
      const mailOptions = {
        from: `"Travel Engine Platform" <${process.env.EMAIL_FROM}>`,
        to: Array.isArray(to) ? to.join(', ') : to, // Handles bulk notification arrays automatically
        subject: subject,
        html: htmlTemplate
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Universal Mailer dispatched message safely. Message ID: [${info.messageId}]`);
      return info;
    } catch (error) {
      logger.error(`❌ Mailer Pipeline Execution Crash: ${error.message}`);
      // Do not crash the server if an email fails; pass the error gracefully to logs
      return null;
    }
  }

  // 🏛️ Dynamic Template 1: System Drop Notification
  getBookingDroppedTemplate(customerName, bookingDetails) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>New Travel Booking Request Registered</h2>
        <p>Hello <strong>${customerName}</strong>,</p>
        <p>Your trip request has been successfully logged into our queue. Our administration team is currently reviewing the operational parameters and generating your invoice ledger details.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <h3>Route Blueprint Ledger</h3>
        <ul>
          <li><strong>Origin Location:</strong> ${bookingDetails.origin}</li>
          <li><strong>Destination Target:</strong> ${bookingDetails.destination}</li>
          <li><strong>Estimated Price Quote:</strong> $${bookingDetails.fare}</li>
          <li><strong>Current Lifecycle State:</strong> Awaiting Invoice Generation</li>
        </ul>
        <p style="font-size: 12px; color: #777;">This is an automated operational system update. Please do not reply directly to this mail box.</p>
      </div>
    `;
  }

  // 🏛️ Dynamic Template 2: Invoice Dispatched Notification
  getInvoiceIssuedTemplate(customerName, invoiceUrl, fare) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Your Travel Invoice Has Been Generated</h2>
        <p>Hello ${customerName},</p>
        <p>An admin has finalized your travel routing manifest. Please review and process the settlement link beneath to secure your transport vehicle scheduling assets.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
          <strong>Total Balance Outstanding:</strong> $${fare}
        </div>
        <a href="${invoiceUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay and Finalize Invoice Ledger</a>
      </div>
    `;
  }

  // 🏛️ Dynamic Template 3: Settlement Clear Notification
  getPaymentConfirmedTemplate(customerName, referenceId) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #27ae60;">Payment Successfully Confirmed</h2>
        <p>Hello ${customerName},</p>
        <p>We are pleased to notify you that your transaction has settled securely. Your reservation holds a certified clear status indicator and has been forwarded directly to our dispatch network pool.</p>
        <p><strong>System Tracking Reference Identifier:</strong> ${referenceId}</p>
      </div>
    `;
  }
}

module.exports = new EmailService();