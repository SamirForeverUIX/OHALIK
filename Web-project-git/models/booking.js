// models/booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  tourId: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  tourName: {
    type: String,
    required: true
  },
  customer: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  bookingDate: {
    type: Date,
    required: true
  },
  participants: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Calculate total price before saving
BookingSchema.pre('save', async function(next) {
  try {
    if (!this.totalPrice) {
      // If you have a Tour model with price, you could fetch it
      // const tour = await mongoose.model('Tour').findById(this.tourId);
      // this.totalPrice = tour.price * this.participants;
      
      // Alternatively, if the price is sent from the client:
      // this.totalPrice = this.pricePerPerson * this.participants;
    }
    
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Booking', BookingSchema);