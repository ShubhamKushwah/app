const mongoose = require('mongoose');

const { Schema } = mongoose;

// Usually there would be different collections for authentication, and user profile data
const authSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password_hash: { type: String, required: true }
})

module.exports = mongoose.model('Authentication', authSchema);