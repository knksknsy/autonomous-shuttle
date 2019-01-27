/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/
const express = require('express');
const router = express.Router();

const startTime = require('../../config/timeslot.config').start;
const endTime = require('../../config/timeslot.config').end;
const intervalTimeslot = require('../../config/timeslot.config').interval;
const intervalEndTime = require('../../config/timeslot.config').intervalEnd;

const stations = require('../../models/utils/data.model').stations;

var mongoose = require('mongoose');
var BookingModel = mongoose.model('Booking');

// Get free timeslots for a station
router.get('/:station', (req, res, next) => {
    if (!req.params.station) {
        return res.send(500).json({ 'message': 'No station param provided.' });
    }
    let station = req.params.station;
    BookingModel
        .find({ station: station, booked_out: false })
        .sort('datetime')
        .select('datetime booked_out -_id')
        .exec((err, timeslots) => {
            if (err) {
                console.error('error', err);
                return next(err);
            }
            return res.send(timeslots);
        });
});

// Create timeslots for today
router.post('/', (req, res, next) => {
    let timeSlots = [];
    stations.forEach((station) => {
        let hours = startTime;
        let minutes = 0;

        let today = new Date();
        let date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime, 0, 0);

        timeSlots.push({
            datetime: date.getTime(),
            station: station,
            passenger: {
                name: null,
                instagram_profile: null,
                instagram_interests: [],
                interests: [],
                image: null,
                emotion: null
            },
            interests: [],
            booked_out: false,
            activity: null
        });
        while (hours >= startTime && hours < endTime) {
            if (minutes < intervalEndTime) {
                minutes = minutes + intervalTimeslot;
                date = new Date(date.setMinutes(minutes, 0, 0));
                timeSlots.push({
                    datetime: date.getTime(),
                    station: station,
                    passenger: {
                        name: null,
                        instagram_profile: null,
                        instagram_interests: [],
                        interests: [],
                        image: null,
                        emotion: null
                    },
                    interests: [],
                    booked_out: false,
                    activity: null
                });
            } else if (minutes === intervalEndTime) {
                minutes = 0;
                hours = hours + 1;
                date = new Date(date.setHours(hours, minutes, 0, 0));
                timeSlots.push({
                    datetime: date.getTime(),
                    station: station,
                    passenger: {
                        name: null,
                        instagram_profile: null,
                        instagram_interests: [],
                        interests: [],
                        image: null,
                        emotion: null
                    },
                    interests: [],
                    booked_out: false,
                    activity: null
                });
            }
        }
        timeSlots.pop();
    });

    BookingModel.insertMany(timeSlots, (err, docs) => {
        if (err) {
            console.error('error', err);
            return next(err);
        }
        if (docs) {
            docs.forEach((doc) => {
                console.log('Timeslot generated: ' + new Date(doc.datetime).toISOString() + ', ' + doc.datetime);
            })
        }
        return res.send(200);
    });
});

router.delete('/', (req, res, next) => {
    mongoose.connection.db.dropDatabase(function(err, result) {
        if (err) {
            console.error('error', err);
            return next(err);
        }
        return res.send(200);
    });
});

module.exports = router;
