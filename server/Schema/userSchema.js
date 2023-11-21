const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  problems: [
    { problemName: String, problemLink: String, problemStatus: String },
  ],
});

const User = mongoose.model('user', userSchema);
module.exports = User;
