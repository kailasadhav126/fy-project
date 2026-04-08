const nodemailer = require('nodemailer');

const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

function getSenderUser() {
  return process.env.SMTP_USER || process.env.EMAIL_USER || '';
}

function getSenderPass() {
  return (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s/g, '');
}

function getAdminRecipient() {
  return (process.env.SMTP_ADMIN_TO || getSenderUser()).trim();
}

function getSmtpHost() {
  const senderUser = getSenderUser();
  if (process.env.SMTP_HOST) return process.env.SMTP_HOST;
  if (senderUser.endsWith('@gmail.com')) return 'smtp.gmail.com';
  return '';
}

function getMissingMailConfig() {
  const missing = [];
  if (!getSmtpHost()) missing.push('SMTP_HOST');
  if (!getSenderUser()) missing.push('SMTP_USER');
  if (!getSenderPass()) missing.push('SMTP_PASS');
  return missing;
}

function isMailConfigured() {
  return getMissingMailConfig().length === 0;
}

function getTransportLabel(type) {
  if (type === 'intercity-bus') return 'Bus to Nashik Booking';
  if (type === 'city-bus') return 'Nashik City Bus Booking';
  if (type === 'train') return 'Train Booking';
  if (type === 'cab') return 'Cab Booking';
  return 'Transport Booking';
}

function getBookingTitle(booking) {
  if (booking.bookingType === 'hotel') return booking.hotelDetails?.hotelName || 'Hotel Booking';
  if (booking.bookingType === 'parking') return booking.parkingDetails?.parkingName || 'Parking Booking';
  if (booking.bookingType === 'medical') return booking.medicalDetails?.serviceName || 'Medical Booking';
  if (booking.bookingType === 'transport') return getTransportLabel(booking.transportDetails?.type);
  return 'Booking';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function addDetail(details, label, value) {
  if (value !== undefined && value !== null && value !== '') {
    details.push({ label, value: String(value) });
  }
}

function getBookingDetails(booking) {
  const details = [];
  addDetail(details, 'Booking ID', booking.bookingId);
  addDetail(details, 'Booking Type', getBookingTitle(booking));
  addDetail(details, 'Status', booking.status);

  if (booking.bookingType === 'transport' && booking.transportDetails) {
    const transport = booking.transportDetails;
    const extra = booking.bookingDetails || {};
    addDetail(details, 'From', transport.from);
    addDetail(details, 'To', transport.to);
    addDetail(details, 'Date', formatDate(transport.date));
    addDetail(details, 'Time', transport.time);
    addDetail(details, 'Passengers', transport.passengers);
    addDetail(details, 'Operator', extra.operator);
    addDetail(details, 'Bus Number', extra.busNumber);
    addDetail(details, 'Train Name', extra.trainName);
    addDetail(details, 'Cab', extra.cabName);
  }

  if (booking.bookingType === 'hotel' && booking.hotelDetails) {
    const hotel = booking.hotelDetails;
    addDetail(details, 'Hotel', hotel.hotelName);
    addDetail(details, 'Address', hotel.hotelAddress);
    addDetail(details, 'Check In', formatDate(hotel.checkIn));
    addDetail(details, 'Check Out', formatDate(hotel.checkOut));
    addDetail(details, 'Guests', hotel.guests);
    addDetail(details, 'Rooms', hotel.rooms);
    addDetail(details, 'Room Type', hotel.roomType);
  }

  if (booking.bookingType === 'parking' && booking.parkingDetails) {
    const parking = booking.parkingDetails;
    addDetail(details, 'Parking', parking.parkingName);
    addDetail(details, 'Slot', parking.slotId);
    addDetail(details, 'Vehicle Number', parking.vehicleNumber);
    addDetail(details, 'Vehicle Type', parking.vehicleType);
    addDetail(details, 'Reserved For', formatDate(parking.reservedFor));
    addDetail(details, 'Valid Until', formatDate(parking.validUntil));
  }

  if (booking.bookingType === 'medical' && booking.medicalDetails) {
    const medical = booking.medicalDetails;
    addDetail(details, 'Service', medical.serviceName);
    addDetail(details, 'Service Type', medical.serviceType);
    addDetail(details, 'Patient Name', medical.patientName);
    addDetail(details, 'Urgency', medical.urgency);
    addDetail(details, 'Address', medical.address);
    addDetail(details, 'Phone', medical.phone);
  }

  addDetail(details, 'Amount', booking.amount || booking.transportDetails?.totalPrice || booking.hotelDetails?.totalPrice);
  addDetail(details, 'Payment Method', booking.paymentMethod);

  return details;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderDetailsTable(details) {
  return details.map((detail) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${escapeHtml(detail.label)}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(detail.value)}</td>
    </tr>
  `).join('');
}

function renderPlainDetails(details) {
  return details.map((detail) => `${detail.label}: ${detail.value}`).join('\n');
}

function getRecipient(booking, user) {
  return (booking.contactDetails?.email || user?.email || booking.userId?.email || '').trim();
}

function getRecipientName(booking, user) {
  return booking.contactDetails?.name || user?.name || booking.userId?.name || 'User';
}

function getUserDetails(user, booking) {
  const details = [];
  addDetail(details, 'User Name', user?.name || booking.contactDetails?.name || booking.userId?.name);
  addDetail(details, 'User Email', user?.email || booking.contactDetails?.email || booking.userId?.email);
  addDetail(details, 'User Phone', user?.phone || booking.contactDetails?.phone || booking.userId?.phone);
  addDetail(details, 'User ID', user?._id || booking.userId?._id || booking.userId);
  return details;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: getSmtpHost(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: getSenderUser(),
      pass: getSenderPass()
    }
  });
}

async function sendBookingMail({ booking, user, subject, intro, closing }) {
  const to = getRecipient(booking, user);
  if (!to) {
    console.warn('Booking email skipped: no recipient email for booking', booking.bookingId);
    return { sent: false, reason: 'missing-recipient' };
  }

  if (!isMailConfigured()) {
    console.warn(`Booking email skipped for ${to}: missing ${getMissingMailConfig().join(', ')}`);
    return { sent: false, to, reason: 'missing-config' };
  }

  const details = getBookingDetails(booking);
  const name = getRecipientName(booking, user);
  const transporter = createTransporter();

  await transporter.sendMail({
    from: MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject,
    text: `Hi ${name},\n\n${intro}\n\n${renderPlainDetails(details)}\n\n${closing}\n\nKumbhSahyogi Team`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>${escapeHtml(intro)}</p>
        <table style="border-collapse:collapse;width:100%;max-width:640px;margin:16px 0;">
          ${renderDetailsTable(details)}
        </table>
        <p>${escapeHtml(closing)}</p>
        <p>KumbhSahyogi Team</p>
      </div>
    `
  });

  return { sent: true, to };
}

async function sendAdminBookingMail({ booking, user, subject, intro, closing }) {
  const to = getAdminRecipient();
  if (!to) {
    console.warn('Admin booking email skipped: SMTP_ADMIN_TO or SMTP_USER is required');
    return { sent: false, reason: 'missing-admin-recipient' };
  }

  if (!isMailConfigured()) {
    console.warn(`Admin booking email skipped for ${to}: missing ${getMissingMailConfig().join(', ')}`);
    return { sent: false, to, reason: 'missing-config' };
  }

  const details = [
    ...getUserDetails(user, booking),
    ...getBookingDetails(booking)
  ];
  const transporter = createTransporter();

  await transporter.sendMail({
    from: MAIL_FROM || getSenderUser(),
    to,
    subject,
    text: `Hi Admin,\n\n${intro}\n\n${renderPlainDetails(details)}\n\n${closing}\n\nKumbhSahyogi System`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
        <p>Hi Admin,</p>
        <p>${escapeHtml(intro)}</p>
        <table style="border-collapse:collapse;width:100%;max-width:640px;margin:16px 0;">
          ${renderDetailsTable(details)}
        </table>
        <p>${escapeHtml(closing)}</p>
        <p>KumbhSahyogi System</p>
      </div>
    `
  });

  return { sent: true, to };
}

async function sendBookingReceivedEmail(booking, user) {
  await sendBookingMail({
    booking,
    user,
    subject: `Booking received: ${booking.bookingId}`,
    intro: 'Your booking has been received successfully. Your booking details are below.',
    closing: 'We will mail you again when the booking is confirmed.'
  });
}

async function sendAdminBookingReceivedEmail(booking, user) {
  await sendAdminBookingMail({
    booking,
    user,
    subject: `New booking received: ${booking.bookingId}`,
    intro: `A new ${getBookingTitle(booking)} has been received from ${user?.name || booking.contactDetails?.name || 'a user'}.`,
    closing: 'Please review this booking in the admin panel and confirm it when appropriate.'
  });
}

async function sendBookingConfirmedEmail(booking, user) {
  await sendBookingMail({
    booking,
    user,
    subject: `Booking confirmed: ${booking.bookingId}`,
    intro: 'Your booking has been confirmed.',
    closing: 'Thank you for using KumbhSahyogi.'
  });
}

module.exports = {
  sendBookingReceivedEmail,
  sendAdminBookingReceivedEmail,
  sendBookingConfirmedEmail
};
