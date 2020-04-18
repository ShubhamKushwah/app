const mongoose = require('mongoose');

const { Schema } = mongoose;

// Usually there would be different collections for authentication, and user profile data
const authSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password_hash: { type: String, required: true },
  profile_image: { type: String, required: false },
  likes: { type: [String], required: false, default: undefined }, // These can be ObjectId as well.
  blocks: { type: [String], required: false, default: undefined },
  superlikes: { type: [String], required: false, default: undefined },
  // superlikes: { type: [Schema.Types.ObjectId], ref: 'Authentication', required: false, default: undefined },
})

module.exports = mongoose.model('Authentication', authSchema);