const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  preferredCuisine: String,

  budget: Number,

  vegOnly: {
    type: Boolean,
    default: false
  },

  savedRestaurants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
    }
  ],

  likedRestaurants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);