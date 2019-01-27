/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/

// Modul dependencies
const express = require('express');
const timeout = require('connect-timeout');
const path = require('path');
// const http = require('http');
const https = require('https');
const morgan = require('morgan');
const winston = require('winston');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem'),
  ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
  honorCipherOrder: true
};

require('./models/db.model');

// Get our API routes
const api = require('./routes/api');
const app = express();

app.use(timeout(240000));
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Point static path to dist
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, '../client/src')));

// Cross Origin middleware
app.use(function (req, res, next) {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Credentials');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Set api routes
app.use('/', api);

// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.sendStatus(401);
    res.json({ 'message': err.name + ': ' + err.message });
  }
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.sendStatus(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// Production error handler
app.use(function (err, req, res, next) {
  res.sendStatus(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

// log error/info/warings to file
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
//app.use(morgan('dev', {stream: accessLogStream}));
app.use(morgan('combined', { stream: accessLogStream }));
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'access.log' })
  ]
});

// Get port from environment and store in Express
const port = process.env.PORT || '3000';
app.set('port', port);

// // Create HTTP server
// const server = http.createServer(app);
// server.listen(port, () => console.log(`API running on host:${port}`));

// Create HTTPS server
https.createServer(options, app).listen(port);
