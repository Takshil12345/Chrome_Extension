const express = require('express');
const mongoose = require('mongoose');
const Problem = require('./Schema/problemSchema.js');

const uri =
  'mongodb+srv://astrorastogi12345:tMXc0AnyUAcKyZaY@cluster0.tg3h2ut.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const app = express();
app.use(express.json());

app.post('/api/addProblem', async (req, res) => {
  try {
    const { problemName, problemLink, problemStatus } = req.body;
    // console.log(problemName, problemLink, problemStatus);
    const existingProblem = await Problem.findOne({ problemName });

    if (existingProblem) {
      // console.log('Problem already exists');
      return res.send('Problem already exists');
    } else {
      const problem = new Problem({
        problemName,
        problemLink,
        problemStatus,
      });
      await problem.save();
      // console.log('Added Problem');
      res.send('Added Problem');
    }
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.post('/api/updateProblem', async (req, res) => {
  try {
    const { problemName, probleStatus } = req.body;

    const filter = { problemName: problemName };
    const update = { problemStatus: probleStatus };

    const newProblem = await Problem.findOneAndUpdate(filter, update, {
      new: true,
    });

    // console.log(newProblem);
    res.send('Updated Problem');
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.get('/api/getProblems', async (req, res) => {
  try {
    const result = await Problem.find();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
