/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/

const express = require('express');
const router = express.Router();

const booking = require('./booking/booking');
const timeslot = require('./timeslot/timeslot');
const terminal = require('./terminal/terminal');
const tts = require('./tts/tts');

router.get('/', (req, res) => {
    return res.send('api works');
});

router.use('/booking', booking);

router.use('/timeslot', timeslot);

router.use('/terminal', terminal);

router.use('/tts', tts);

module.exports = router;
