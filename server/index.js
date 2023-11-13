const express = require('express');
const mongoose = require('mongoose');
const Problem = require('./Schema/problemSchema.js');
const path = require('path');
const open = require('open');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const keyfile = path.join(__dirname, 'credentials.json');
const keys = JSON.parse(fs.readFileSync(keyfile));
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

const authorizeUrl = client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

const uri = process.env.mongo_uri;
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
    // console.log(result);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.get('/callback', (req, res) => {
  const code = req.query.code;
  client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:');
      throw err;
    }
    client.credentials = tokens;
    // console.log(client.credentials);
    console.log('DONE WITH AUTHENTICATION');
    res.send('Authentication successful!');
  });
});

app.get('/api/createSpreadSheet', async (req, res) => {
  const service = google.sheets({ version: 'v4' });
  const resource = {
    properties: {
      title: 'LeetCode Problems',
    },
  };

  try {
    const spreadsheet = await service.spreadsheets.create({
      auth: client,
      resource,
      fields: 'spreadsheetId',
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    res.send(spreadsheet);
  } catch (err) {
    console.log('ERR : ' + err);
    throw err;
  }
});

app.post('/api/updateSheet', async (req, res) => {
  const { spreadSheetId } = req.body;
  console.log(spreadSheetId);
  const service = google.sheets({ version: 'v4' });
  const result = await Problem.find().lean().exec();
  console.log(result);
  const values = [['Problem Name', 'Problem Link', 'Problem Status']];
  // const problems = await result.json();

  for (entry of result) {
    const value = [];

    value.push(entry.problemName);
    value.push(entry.problemLink);
    value.push(entry.problemStatus);

    values.push(value);
  }

  console.log(values);

  const resource = {
    values,
  };
  try {
    const result = await service.spreadsheets.values.update({
      auth: client,
      spreadsheetId: `${spreadSheetId}`,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      resource,
    });
    console.log('%d cells updated.', result.data.updatedCells);
    res.send(result);
  } catch (err) {
    // TODO (Developer) - Handle exception
    throw err;
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
  open(authorizeUrl);
});
