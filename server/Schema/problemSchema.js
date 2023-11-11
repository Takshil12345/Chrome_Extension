const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
  problemName: String,
  problemLink: String,
  problemStatus: String,
});

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;
