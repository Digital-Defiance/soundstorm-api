import { exec } from 'child_process';
import express, { NextFunction } from 'express';
import { readFileSync, existsSync, fstatSync, readdirSync } from 'fs';
import { Request, Response } from 'express-serve-static-core';
import path from 'path';
import { environment, defaultPort, _API_DIR_, _REACT_DIR_ } from './environment';
import { authenticateEmail, validateAuth } from './auth';
import { RealmApp } from './realmApp';
import multer, { diskStorage, memoryStorage } from 'multer';
import mongoose from 'mongoose';
import { Mongo } from './db';
import { body, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

console.log("Starting services...")
Mongo.connect((m: typeof mongoose, db: mongoose.Connection) => {
  console.log("Starting express...");
  const app = express(),
    bodyParser = require("body-parser");

  app.use(bodyParser.json());
  app.use(express.static(_REACT_DIR_));

  // rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });

  app.use(limiter);
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://realm.mongodb.com', 'https://cdn.jsdelivr.net', 'https://westus.azure.realm.mongodb.com']
      }
    })
  );

  // Error handler middleware
  app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.post('/api/authenticate', 
  [
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
  ],
  (req: Request, res: Response) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    authenticateEmail(email, password, async (user: Realm.User, token: string) => {
      res.set('Authorization', `Bearer ${token}`);
      res.json(user);
    }, (err) => {
      res.status(500).send(err);
    });
  }
);

  // TODO: throttle this/limit to only certain IPs/users
  app.get('/api/version', (req: Request, res: Response) => {
    const apiVersionFilename = path.join(_API_DIR_, '.version');
    const apiTagFilename = path.join(_API_DIR_, '.tag');
    const reactVersionFilename = path.join(_REACT_DIR_, '.version');
    const reactTagFilename = path.join(_REACT_DIR_, '.tag');
    if (!existsSync(apiVersionFilename) || !existsSync(apiTagFilename) || !existsSync(reactVersionFilename) || !existsSync(reactTagFilename)) {
      console.log(apiVersionFilename, existsSync(apiVersionFilename))
      console.log(apiTagFilename, existsSync(apiTagFilename))
      console.log(reactVersionFilename, existsSync(reactVersionFilename))
      console.log(reactTagFilename, existsSync(reactTagFilename))
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
      // Use crypto to generate a random filename
      const randomName = randomBytes(16).toString('hex');
      cb(null, `${randomName}${path.extname(file.originalname)}`);
    },
  });
  const upload = multer({ storage });

  app.post("/api/upload", (req, res) => {
    validateAuth(req, res, () => {
      // The request should have our file in 'file'
      const file = req.file;
      if (!file) {
        res.status(400).send('No file uploaded');
        return;
      }

      // The file contents are available in 'file.buffer'
      const fileContents = file.buffer;

      const filename = file.originalname;
      const filesize = file.size;
      const filemimetype = file.mimetype;

      console.log(`Uploaded file: ${filename} (${filesize} bytes)`);
      console.log(`  mimetype: ${filemimetype}`);

      // make sure filename is komplete.db3
      if (filename !== 'komplete.db3') {
        res.status(400).send('Invalid file uploaded');
        return;
      }

      if (filemimetype !== 'application/x-sqlite3') {
        console.warn(`WARNING: mimetype is ${filemimetype} instead of application/x-sqlite3`);
      }

      res.json({
        filename,
        filesize,
        filemimetype,
        contents: fileContents.toString()  // assuming it's text
      });

    }, () => {
      res.status(401).send('Unauthorized');
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(_REACT_DIR_, '/index.html'));
  });

  app.listen(environment.nodePort, () => {
    console.log(`Server listening on the port::${environment.nodePort}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}, (err) => {
  console.log('Error connecting to MongoDB:', err);
});