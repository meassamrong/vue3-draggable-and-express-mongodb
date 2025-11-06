const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  // This is the crucial field
  order: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);