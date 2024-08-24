const { populate } = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const mongodb = require("mongodb");

const machineSchema = new mongoose.Schema({
  name: { type: String },
  location: {
    type: { type: String, enum: ["Point", "point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Set up 2dsphere index for location field
machineSchema.index({ location: "2dsphere" });

const machine = mongoose.model("machine", machineSchema);

module.exports = machine;
