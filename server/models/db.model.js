const path = require('path');
const fs = require('fs');
const winston = require('winston');

var mongoose = require('mongoose');
const dbURI = require('../config/db.config').database;

// logging to a file
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), {flags: 'a'});
var logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'access.log' })
  ]
});

mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

require('./booking.model');
