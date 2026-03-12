const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  cuisine: {
    type: String,
    required: true
  },

  vegOnly: {
    type: Boolean,
    default: false
  },

  special: {
    type: String
  },

  rating: {
    type: Number,
    default: 0
  },

  averageCost: {
    type: Number,
    required: true
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }

}, { timestamps: true });

restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);