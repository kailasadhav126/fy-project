const mongoose = require('mongoose');

const TransportDetailsSchema = new mongoose.Schema({
  type: String, // bus, train, cab
  from: String,
  to: String,
  date: Date,
  time: String,
  passengers: Number,
  totalPrice: Number
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['hotel', 'transport', 'medical', 'parking'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Hotel Booking Details
  hotelDetails: {
    hotelId: String,
    hotelName: String,
    hotelAddress: String,
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    rooms: Number,
    roomType: String,
    totalPrice: Number
  },
  
  // Transport Booking Details
  transportDetails: TransportDetailsSchema,

  // Medical Booking Details
  medicalDetails: {
    serviceId: String,
    serviceName: String,
    serviceType: String,
    address: String,
    phone: String,
    patientName: String,
    age: Number,
    gender: String,
    symptoms: String,
    urgency: String
  },

  // Parking Booking Details
  parkingDetails: {
    parkingName: String,
    slotId: String,
    vehicleNumber: String,
    vehicleType: String,
    passengers: Number,
    reservedFor: String,
    validUntil: Date
  },

  bookingDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  amount: {
    type: Number,
    default: 0
  },
  
  // Guest Details
  guestDetails: [{
    name: String,
    age: Number,
    gender: String,
    idProof: String
  }],
  
  // Contact Details
  contactDetails: {
    name: String,
    phone: String,
    email: String
  },
  
  specialRequests: String,
  paymentMethod: String,
  adminNotes: String,
  bookingId: {
    type: String,
    unique: true
  },
  
  // Metadata
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate unique booking ID
BookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const prefix = this.bookingType.toUpperCase().substring(0, 3);
    this.bookingId = `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
