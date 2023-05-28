import { exec } from 'child_process';
import express from 'express';
import { readFileSync, existsSync, fstatSync, readdirSync } from 'fs';
import { Request, Response } from 'express-serve-static-core';
import path from 'path';
import { environment, defaultPort, _API_DIR_, _REACT_DIR_ } from './environment';
import { authenticateEmail, validateAuth } from './auth';
import { RealmApp } from './realmApp';
import multer, {diskStorage} from 'multer';
import mongoose from 'mongoose';
import { Mongo } from './db';

console.log("Starting services...")
Mongo.connect((m: typeof mongoose, db: mongoose.Connection) => {
  console.log("Starting express...");
  const app = express(),
        bodyParser = require("body-parser");

  app.use(bodyParser.json());
  app.use(express.static(_REACT_DIR_));

  app.post('/api/authenticate', (req: Request, res: Response) => {
    const email = (req.body.email ?? '').trim().toLowerCase();
    const password = (req.body.password ?? '').trim();
    authenticateEmail(email, password, async (user: Realm.User, token: string) => {
      // send the new token back in another authorization header and json send the user
      res.set('Authorization', `Bearer ${token}`);
      res.json(user);
    }, (err) => {
      res.status(500).send(err);
    });
  });

  // TODO: throttle this/limit to only certain IPs/users
  app.get('/api/version', (req: Request, res: Response) => {
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
      environment: { 
        production: environment.production,
        apiBaseUrl: environment.apiBaseUrl,
        siteUrl: environment.siteUrl,
        nodePort: environment.nodePort,
      },
      versions: {
        api: {
          tag: apiTag,
          version: apiVersion,
        },
        react: {
          tag: reactTag,
          version: reactVersion,
        },
      }
    });
  });

  // app.get('/api/users', (req, res) => {
  //   console.log('api/users called!')
  //   res.json(users);
  // });

  // app.post('/api/user', (req, res) => {
  //   const user = req.body.user;
  //   console.log('Adding user:::::', user);
  //   users.push(user);
  //   res.json("user addedd");
  // });

  // Configure multer storage
  const storage = diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    validateAuth(req, res, () => {
      // the request should have our file in 'file'
      const file = req.file;
      if (!file) {
        res.status(400).send('No file uploaded');
        return;
      }
      const filename = file.originalname;
      const filepath = file.path;
      const filesize = file.size;
      const filemimetype = file.mimetype;
      console.log(`Uploaded file: ${filename} (${filesize} bytes)`);
      console.log(`  path: ${filepath}`);
      console.log(`  mimetype: ${filemimetype}`);
      res.json({
        filename,
        filepath,
        filesize,
        filemimetype,
      });
    }, () => {
      res.status(401).send('Unauthorized');
    });
  });

  app.get('*', (req,res) => {
    res.sendFile(path.join(_REACT_DIR_, '/index.html'));
  });

  app.listen(environment.nodePort, () => {
      console.log(`Server listening on the port::${environment.nodePort}`);
  });
}, (err) => {
  console.log('Error connecting to MongoDB:', err);
});