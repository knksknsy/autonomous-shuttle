/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/
const express = require('express');
const router = express.Router();
const request = require('request');

var mongoose = require('mongoose');
var BookingModel = mongoose.model('Booking');

var emotionCtrl = require('../../controllers/emotion.ctrl');
var bookingCtrl = require('../../controllers/booking.ctrl');

// Endpoint for booking a timeslot
router.post('/', (req, res, next) => {
    if (!req.body || !req.body.datetime || !req.body.station || !req.body.passenger.name || !req.body.passenger.image) {
        return res.sendStatus(500).json({ 'message': 'Body invalid.' });
    }
    let timeSlotDateTime;
    bookingCtrl.bookTimeslot(req.body, res)
        .then((booking) => {
            console.log('bookTimeslot() finished.');
            return emotionCtrl.analyseEmotion(booking);
        })
        .then((booking) => {
            console.log('analyseEmotion() finished.');
            timeSlotDateTime = booking.datetime;
            if (booking.passenger.instagram_profile && booking.passenger.instagram_profile.length) {
                return emotionCtrl.instagramInterests(booking.passenger.instagram_profile, timeSlotDateTime);
            }
            return null;
        })
        .then(() => {
            console.log('instagramInterests() finished.');
            return bookingCtrl.completeTimeslot(timeSlotDateTime);
        })
        .then((emotions) => {
            console.log('completeTimeslot() finished.');
            return emotionCtrl.assessActivity(timeSlotDateTime, emotions);
        })
        .then((activity) => {
            console.log('assessActivity() finished.');
            return bookingCtrl.prepareActivity(timeSlotDateTime, activity);
        })
        .then(() => {
            console.log('prepareActivity() finished.');
            return res.sendStatus(200);
        })
        .catch((error) => {
            if (error.message && error.message === '200') {
                console.log('break promise chain.');
                return res.sendStatus(200).json({ 'message': 'Timeslot successfully booked.' });
            } else if (error && !error.message) {
                console.log('error happened.', error);
                return res.sendStatus(500).json(error);
            } else if (error) {
                console.log('error happened.', error);
                return res.sendStatus(500).json(error);
            }
        });
});

router.delete('/', (req, res, next) => {
    if (!req.body || !req.body.datetime || !req.body.station) {
        return res.sendStatus(500).json({ 'message': 'Body invalid.' });
    }
    bookingCtrl.deleteTimeslot(req.body.datetime, req.body.station)
        .then(() => {
            return res.sendStatus(200).json({ 'message': 'Timeslot successfully deleted.' });
        })
        .catch((err) => {
            return res.sendStatus(500).json(error);
        });
});

// // Testing endpoint for instagram matching
// router.get('/scraper', (req, res, next) => {
//     let profiles = ['humaidalbuqaish', 'danbilzerian'];
//     let today = new Date();
//     emotionCtrl.instagramMatching(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0).getTime(), profiles)
//         .then(() => {
//             return res.sendStatus(200);
//         })
//         .catch((err) => {
//             if (error.message === '200') {
//                 return res.sendStatus(200).json({ 'message': 'error.message' });
//             }
//             console.error(err);
//             return res.sendStatus(500).json({ 'message': err });
//         });
// });

// // Testing endpoint for fully booking out a timeslot
// router.post('/mock', (req, res, next) => {
//     if (!req.body || !req.body.data) {
//         return res.sendStatus(500).json({ 'message': 'Body invalid.' });
//     }
//     req.body.data.forEach((value) => {
//         if (!value.datetime || !value.station || !value.passenger.name || !value.passenger.image) {
//             return res.sendStatus(500).json({ 'message': 'Body invalid.' });
//         }
//         let today = new Date();
//         BookingModel.findOneAndUpdate(
//             {
//                 datetime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0).getTime(),
//                 station: value.station,
//                 booked_out: false
//             },
//             {
//                 $set: {
//                     'passenger.name': value.passenger.name,
//                     'passenger.instagram_profile': value.passenger.instagram_profile,
//                     'passenger.interests': value.passenger.interests,
//                     'passenger.image': value.passenger.image,
//                     'passenger.emotion': value.passenger.emotion,
//                     booked_out: true
//                 }
//             },
//             { new: true },
//             (err) => {
//                 if (err) {
//                     return next(err);
//                 }
//             });
//     });
//     return res.sendStatus(200);
// });

module.exports = router;
