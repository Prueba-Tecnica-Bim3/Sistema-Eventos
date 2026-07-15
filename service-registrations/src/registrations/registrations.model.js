const mongoose = require('mongoose');

const { Schema } = mongoose;

const REGISTRATION_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

const registrationSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    attendeeName: {
      type: String,
      required: true,
      trim: true,
    },
    attendeeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    registeredBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.CONFIRMED,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

registrationSchema.index(
  { eventId: 1, attendeeEmail: 1 },
  {
    unique: true,
    partialFilterExpression: { status: REGISTRATION_STATUS.CONFIRMED },
  },
);

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
module.exports.REGISTRATION_STATUS = REGISTRATION_STATUS;
