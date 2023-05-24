const { exec } = require('child_process');
const express = require('express');
const { readFileSync, existsSync } = require('fs');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 2222;

// place holder for the data
const users = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../soundstorm-react/build')));

app.get('/api/version', (req, res) => {
  const versionFilename = path.join(__dirname, '.version');
  const tagFilename = path.join(__dirname, '.tag');
  if (existsSync(versionFilename) && existsSync(tagFilename)) {
    const version = readFileSync(versionFilename)
    const tag = readFileSync(tagFilename)
    res.json({version: version.toString(), tag: tag.toString(), context: 'local'});
    return;
  }
  exec('git describe --tags', (err, stdout, stderr) => {
      if (err) {
          res.status(500).send({ message: 'Unable to get current tag version', error: err });
          return;
      }
      const tagVersion = stdout.trim();
      
      exec('git rev-parse HEAD', (err, stdout, stderr) => {
          if (err) {
              res.status(500).send({ message: 'Unable to get current hash', error: err });
              return;
          }
          const currentHash = stdout.trim();
          
          res.send({
              tag: tagVersion,
              version: currentHash,
              context: 'git'
          });
          return;
      });
  });
  res.status(500).send({ message: 'Unable to get current hash', error: err });
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
