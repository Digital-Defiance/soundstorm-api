const { exec } = require('child_process');
const express = require('express');
const { readFileSync, existsSync, fstatSync, readdirSync, open } = require('fs');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 2222;

const production = process.env.NODE_ENV === 'production';

/* we need to be able to be able to run on windows, wsl (ubuntu), and linux/mac
 * it seems on windows the process.cwd() works, but on ubuntu it doesn't
 */ 
const cwd_1 = path.resolve(process.cwd());
const cwd_2 = path.resolve(__dirname);
const cwd = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
const _API_DIR_ = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
const _REACT_DIR_ = path.join(cwd, '../soundstorm-react/build');

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
  if (!existsSync(apiVersionFilename) || !existsSync(apiTagFilename) || !existsSync(reactVersionFilename) || !existsSync(reactTagFilename)) {
    res.status(500).send('Version files not found');
    return;
  }
  const apiVersion = readFileSync(apiVersionFilename, 'utf8').trim().split('\n')[0];
  const apiTag = readFileSync(apiTagFilename, 'utf8').trim().split('\n')[0];
  const reactVersion = readFileSync(reactVersionFilename, 'utf8').trim().split('\n')[0];
  const reactTag = readFileSync(reactTagFilename, 'utf8').trim().split('\n')[0];
  res.json({
    api: {
      tag: apiTag,
      version: apiVersion,
    },
    react: {
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
  res.sendFile(path.join(_REACT_DIR_, '/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
