import { exec } from 'child_process';
import express, { NextFunction, Errback } from 'express';
import { readFileSync, existsSync, renameSync, unlinkSync } from 'fs';
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
import { sqliteToMemory } from './sqlitemongo';
import { processFile, upload } from './upload.service';
import { User } from './interfaces/user';

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
        connectSrc: ["'self'", 'https://realm.mongodb.com', 'https://westus.azure.realm.mongodb.com'],
        imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
      },
    })
  );

  // Error handler middleware
  // app.use(function (err: Error, req: Request, res: Response) {
  //   console.error(err.stack);
  //   res.status(500).send('Something broke!');
  // });

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

      authenticateEmail(email, password, async (realmUser: Realm.User, user: User, token: string) => {
        //res.set('Authorization', `Bearer ${token}`);
        req.user = realmUser;
        res.json({user,token});
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

  app.post("/api/upload", upload.single('file'), (req: express.Request, res: express.Response) => {
    validateAuth(req, res, async (req: express.Request, res: express.Response, realmUser: Realm.User | undefined, user: User | undefined) => {
      console.log('upload called!', user, realmUser);
      // The request should have our file in 'file'
      const file = req.file;
      if (!file) {
        res.status(400).send('No file uploaded');
        return;
      }
      
      if (!user) {
        res.status(401).send('Unauthorized');
        return;
      }
  
      try {        
        const result = await processFile(user, file, res);
        if (!result) {
          res.status(500).send('Error processing file');
        } else {
            res.json({
              filename: file.originalname,
              filesize: file.size,
              filetmimetype: file.mimetype,
              contents: Array.from(result)
            });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Error processing file');
      }
  
    }, () => {
      // delete the uploaded file
      if (req.file && req.file.path) {
        unlinkSync(req.file.path);
        console.log('Deleted file:', req.file.path);
      }
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