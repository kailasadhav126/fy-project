const router = require('express').Router();
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middleware/auth');
const { sendBookingReceivedEmail, sendAdminBookingReceivedEmail } = require('../utils/bookingEmails');

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post('/', async (req, res) => {
  try {
    console.log('Creating booking for user:', req.user._id);
    console.log('Booking data:', JSON.stringify(req.body, null, 2));
    
    const bookingData = {
      userId: req.user._id,
      ...req.body
    };

    if (bookingData.contactDetails) {
      bookingData.contactDetails.email = (bookingData.contactDetails.email || req.user.email || '').trim();
    }

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('Booking created successfully:', booking.bookingId);
    console.log('Booking notification email recipient:', booking.contactDetails?.email || req.user.email);

    try {
      const userEmailResult = await sendBookingReceivedEmail(booking, req.user);
      if (userEmailResult?.sent) {
        console.log('Booking received email sent to user:', userEmailResult.to);
      }
    } catch (emailError) {
      console.error('Booking received email failed:', emailError.message);
    }

    try {
      const adminEmailResult = await sendAdminBookingReceivedEmail(booking, req.user);
      if (adminEmailResult?.sent) {
        console.log('Admin booking received email sent to:', adminEmailResult.to);
      }
    } catch (emailError) {
      console.error('Admin booking received email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking: ' + error.message
    });
  }
});

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ userId: req.user._id });
    const confirmedBookings = await Booking.countDocuments({
      userId: req.user._id,
      status: 'confirmed'
    });
    const pendingBookings = await Booking.countDocuments({
      userId: req.user._id,
      status: 'pending'
    });
    const completedBookings = await Booking.countDocuments({
      userId: req.user._id,
      status: 'completed'
    });
    const cancelledBookings = await Booking.countDocuments({
      userId: req.user._id,
      status: 'cancelled'
    });

    res.json({
      success: true,
      stats: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        upcoming: confirmedBookings + pendingBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ userId: req.user._id });
    const confirmedBookings = await Booking.countDocuments({ 
      userId: req.user._id, 
      status: 'confirmed' 
    });
    const completedBookings = await Booking.countDocuments({ 
      userId: req.user._id, 
      status: 'completed' 
    });
    const cancelledBookings = await Booking.countDocuments({ 
      userId: req.user._id, 
      status: 'cancelled' 
    });

    res.json({
      success: true,
      stats: {
        total: totalBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        upcoming: confirmedBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
