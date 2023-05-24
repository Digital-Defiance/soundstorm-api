const { exec } = require('child_process');
const express = require('express');
const { readFileSync, existsSync, fstatSync } = require('fs');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 2222;
const _REACT_DIR_ = path.join(__dirname, '../soundstorm-react/build');
const _API_DIR_ = path.join(__dirname);

// place holder for the data
const users = [];

app.use(bodyParser.json());
app.use(express.static(_REACT_DIR_));

// TODO: throttle this/limit to only certain IPs/users
app.get('/api/version', (req, res) => {
  const apiVersionFilename = path.join(_API_DIR_, '.version');
  const apiTagFilename = path.join(_API_DIR_, '.tag');
  const reactVersionFilename = path.join(_REACT_DIR_, '.version');
  const reactTagFilename = path.join(_REACT_DIR_, '.tag');
  console.log(_API_DIR_, _REACT_DIR_, apiVersionFilename, apiTagFilename, reactVersionFilename, reactTagFilename);
  if (!existsSync(apiVersionFilename) || !existsSync(apiTagFilename) || !existsSync(reactVersionFilename) || !existsSync(reactTagFilename)) {
    res.send(500, 'Version file not found');
    return;
  }
  const apiDate = fstatSync(apiVersionFilename).mtime;
  const apiVersion = readFileSync(apiVersionFilename, 'utf8');
  const apiTag = readFileSync(apiTagFilename, 'utf8');
  const reactDate = fstatSync(reactVersionFilename).mtime;
  const reactVersion = readFileSync(reactVersionFilename, 'utf8');
  const reactTag = readFileSync(reactTagFilename, 'utf8');
  res.json({
    api: {
      date: apiDate,
      tag: apiTag,
      version: apiVersion,
    },
    react: {
      date: reactDate,
      tag: reactTag,
      version: reactVersion,
    },
  });
});

app.get('/api/users', (req, res) => {
  console.log('api/users called!')
  res.json(users);
});

app.post('/api/user', (req, res) => {
  const user = req.body.user;
  console.log('Adding user:::::', user);
  users.push(user);
  res.json("user addedd");
});

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../soundstorm-react/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
