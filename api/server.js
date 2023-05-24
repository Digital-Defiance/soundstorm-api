const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 2222;

// place holder for the data
const users = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../soundstorm-react/build')));

app.get('/api/version', (req, res) => {
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
              tagVersion,
              currentHash
          });
      });
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

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../soundstorm-react/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
