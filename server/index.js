const express = require('express');
const mongoose = require('mongoose');
const Problem = require('./Schema/problemSchema.js');
const User = require('./Schema/userSchema.js');
// const User = require('./Schema/userSchema.js');
const path = require('path');
const open = require('open');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const people = google.people('v1');

const keyfile = path.join(__dirname, 'credentials.json');
const keys = JSON.parse(fs.readFileSync(keyfile));
const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

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

    const result = await people.people.get({
      auth: client,
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });
    console.log(result.data.emailAddresses[0].value);

    const existingUser = await User.findOne({
      name: result.data.emailAddresses[0].value,
    });

    if (!existingUser) {
      const user = new User({
        name: result.data.emailAddresses[0].value,
      });

      user.problems.push({ problemName, problemLink, problemStatus });
      await user.save();

      console.log('Added User');
      console.log(user);
    } else {
      const user = await User.findOne({
        name: result.data.emailAddresses[0].value,
      });

      for (let i = 0; i < user.problems.length; i++) {
        if (user.problems[i].problemName === problemName) {
          return res.send('Problem already exists');
        }
      }

      user.problems.push({ problemName, problemLink, problemStatus });
      await user.save();
    }
    console.log('Added Problem');
    res.send('Added Problem');
    // console.log(problemName, problemLink, problemStatus);
    // const existingProblem = await Problem.findOne({ problemName });
    // console.log(existingProblem.problemLink);

    // if (existingProblem) {
    //   // console.log('Problem already exists');
    //   return res.send('Problem already exists');
    // } else {
    //   const problem = new Problem({
    //     problemName,
    //     problemLink,
    //     problemStatus,
    //   });
    //   await problem.save();
    //   // console.log('Added Problem');
    //   res.send('Added Problem');
    // }
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.post('/api/updateProblem', async (req, res) => {
  try {
    const { problemName, probleStatus } = req.body;

    // const filter = { problemName: problemName };
    // const update = { problemStatus: probleStatus };

    const result = await people.people.get({
      auth: client,
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });
    console.log(result.data.emailAddresses[0].value);

    // const newProblem = await Problem.findOneAndUpdate(filter, update, {
    //   new: true,
    // });
    const user = await User.findOne({
      name: result.data.emailAddresses[0].value,
    });

    for (let i = 0; i < user.problems.length; i++) {
      if (user.problems[i].problemName === problemName) {
        user.problems[i].problemStatus = probleStatus;
        await user.save();
        break;
      }
    }

    // console.log(newProblem);
    res.send('Updated Problem');
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.get('/api/getProblems', async (req, res) => {
  try {
    // const result = await Problem.find();
    // console.log(result);
    const user = await people.people.get({
      auth: client,
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });

    const existingUser = await User.findOne({
      name: user.data.emailAddresses[0].value,
    });
    const result = existingUser.problems;

    res.send(result);
  } catch (err) {
    console.log(err);
    res.send('Error ' + err);
  }
});

app.get('/api/authenticate', (req, res) => {
  console.log('AUTHENTICATING Starting ');

  if (Object.keys(client.credentials).length !== 0) {
    console.log(client);
    console.log(client.credentials);
    console.log('Already Authenticated');
    res.send({ message: 'DONE' });
  } else {
    res.send({ url: `${authorizeUrl}`, message: 'NOT DONE' });
  }
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  client.getToken(code, async (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:');
      throw err;
    }
    client.credentials = tokens;
    // console.log(client);
    // console.log(client.credentials);
    try {
      const result = await people.people.get({
        auth: client,
        resourceName: 'people/me',
        personFields: 'emailAddresses,names',
      });
      console.log(result.data.emailAddresses[0].value);
      console.log('DONE WITH AUTHENTICATION');

      res.send({
        message: 'DONE',
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
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
    if (keys.web.hasOwnProperty('spreadsheetId')) {
      console.log('Spread Sheet Id already exists');
      res.send(keys.web);
    } else {
      const spreadsheet = await service.spreadsheets.create({
        auth: client,
        resource,
        fields: 'spreadsheetId',
      });
      console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);

      console.log('Starting to read file');

      keys.web.spreadsheetId = spreadsheet.data.spreadsheetId;
      fs.writeFileSync(keyfile, JSON.stringify(keys), (err) => {
        if (err) throw err;
        console.log('Spread Sheet Id was appended to the json file');
      });

      console.log('Done updating the file');

      res.send(spreadsheet.data);
    }
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

  console.log(values.length);

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
  // open(authorizeUrl);
});
