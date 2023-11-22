const mongoose = require('mongoose');

const smartWatchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  calTotal: {
    type: Number,
    required: [true, 'Total calories field is required'],
  },
  calToday: {
    type: Number,
    required: [true, 'Today calories field is required'],
  },
  calMonth: {
    type: Number,
    required: [true, 'This month calories field is required'],
  },
  distanceTotal: {
    type: Number,
    required: [true, 'Total distance field is required'],
  },
  distanceToday: {
    type: Number,
    required: [true, 'Today distance field is required'],
  },
  distanceMonth: {
    type: Number,
    required: [true, 'This month distance field is required'],
  },
  distanceYear: {
    type: Number,
    required: [true, 'This year distance field is required'],
  },
  pace: {
    type: Number,
    required: [true, 'Pace field is required'],
  },
  stepsTotal: {
    type: Number,
    required: [true, 'Total steps field is required'],
  },
  stepsToday: {
    type: Number,
    required: [true, 'Today steps field is required'],
  },
  stepsMonth: {
    type: Number,
    required: [true, 'This month steps field is required'],
  },
  name: {
    type: String,
    required: [true, 'Name field is required'],
  },
  success: {
    type: Boolean,
    required: [true, 'Success field is required'],
  },
});

module.exports = smartWatchSchema;
