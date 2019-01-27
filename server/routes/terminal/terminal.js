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

var mongoose = require('mongoose');
var BookingModel = mongoose.model('Booking');

router.get('/timeslots', (req, res, next) => {
    const date = new Date();
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime, 0, 0).getTime();
    const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime, 0, 0).getTime();

    BookingModel.find(
        {
            datetime: {
                $gte: dateStart,
                $lte: dateEnd
            }
        },
        'datetime station passenger.name activity _id',
        { sort: 'datetime' },
        (err, bookings) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            let datetimes = bookings.map((booking) => {
                return booking.datetime.toString();
            });
            datetimes = Array.from(new Set(datetimes));
            let timeslots = {};
            datetimes.forEach((dt) => {
                timeslots[dt] = [];
            });
            bookings.forEach((booking) => {
                let dateIndex = datetimes.indexOf(booking.datetime.toString());
                if (dateIndex !== -1) {
                    timeslots[datetimes[dateIndex]].push(booking);
                }
            });
            let response = [];
            for (let property in timeslots) {
                if (timeslots.hasOwnProperty(property)) {
                    response.push(timeslots[property]);
                }
            }
            return res.send(response);
        });
});

router.get('/get/:ids', (req, res, next) => {
    let ids = req.params.ids;
    if (!ids && !ids.length) {
        return res.send(500).json({ 'message': 'Missing ids parameter' });
    }
    let id1 = ids.split('-')[0];
    let id2 = ids.split('-')[1];
    if (id1 && id1.length && id2 && id2.length) {
        BookingModel.find(
            {
                _id: {
                    $in: [id1, id2]
                }
            },
            (err, bookings) => {
                if (!bookings) {
                    return res.send(500);
                }
                if (bookings instanceof Array && bookings.length === 2 && (bookings[0].datetime || bookings[1].datetime)) {
                    // data for upper part of operating terminal: interests, instagram_interests, activity, passenger information
                    let response = {};
                    response.datetime = bookings[0].datetime || bookings[1].datetime;
                    response.interests = bookings[0].interests || bookings[1].interests;
                    response.instagram_interests = bookings[0].instagram_interests || bookings[1].instagram_interests;
                    response.activity = bookings[0].activity || bookings[1].activity;
                    response.passengers = [];
                    bookings.forEach((booking, i) => {
                        let passenger = {};
                        passenger.station = booking.station;
                        passenger.instagram_interests = booking.passenger.instagram_interests;
                        passenger.interests = booking.passenger.interests;
                        passenger.name = booking.passenger.name;
                        passenger.instagram_profile = booking.passenger.instagram_profile;
                        passenger.emotion = booking.passenger.emotion;
                        passenger.image = booking.passenger.image;
                        response.passengers.push(passenger);
                    });
                    // data for lower part: tts texts -> commands, activity
                    return res.send(response);
                }
                return res.send(500).json({ 'message': 'Could not get timeslots.' });
            });
    } else {
        return res.send(500).json({ 'message': 'Could not get timeslots.' });
    }
});

module.exports = router;
