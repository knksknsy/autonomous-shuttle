/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/

var mongoose = require('mongoose');
var BookingModel = mongoose.model('Booking');

var emotionCtrl = require('./emotion.ctrl');
const activities = require('../models/utils/data.model').activities;
const interests = require('../models/utils/data.model').interests;
const stations = require('../models/utils/data.model').stations;

module.exports.bookTimeslot = function (body, res) {
    return new Promise((resolve, reject) => {
        let today = new Date();
        BookingModel.findOneAndUpdate(
            {
                datetime: body.datetime, // production datetime value
                // datetime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0).getTime(), // testing datetime value
                station: body.station,
                booked_out: false
            },
            {
                $set: {
                    'passenger.name': body.passenger.name,
                    'passenger.instagram_profile': body.passenger.instagram_profile,
                    'passenger.interests': body.passenger.interests,
                    'passenger.image': body.passenger.image,
                    booked_out: true
                }
            },
            { new: true },
            (err, raw) => {
                if (err) {
                    console.error('bookTimeslot error', err);
                    reject(err);
                }
                if (raw) {
                    resolve(raw);
                }
                else {
                    console.error('bookTimeslot error: nothing to update.');
                    reject({ 'message': 'Timeslot is booked out.' });
                }
            });
    });
}
module.exports.deleteTimeslot = function (datetime, station) {
    return new Promise((resolve, reject) => {

        BookingModel.findOneAndUpdate(
            {
                datetime: datetime,
                station: station
            },
            {
                booked_out: false,
                instagram_interests: [],
                interests: [],
                activity: null,
                'passenger.name': null,
                'passenger.instagram_profile': null,
                'passenger.image': null,
                'passenger.emotion': null,
                'passenger.instagram_interests': [],
                'passenger.interests': []
            },
            { new: true },
            (err, booking) => {
                if (err) {
                    console.log('deleteTimeslot1 error', err);
                    reject(err);
                }
                BookingModel.findOneAndUpdate(
                    {
                        datetime: datetime,
                        booked_out: true
                    },
                    {
                        instagram_interests: [],
                        interests: [],
                        activity: null,
                    },
                    { new: true },
                    (err, b) => {
                        if (err) {
                            console.log('deleteTimeslot2 error', err);
                            reject(err);
                        }
                        resolve();
                    }
                );
            }
        );
    });
}
module.exports.completeTimeslot = function (datetime) {
    return new Promise((resolve, reject) => {
        BookingModel.find(
            { datetime: datetime },
            (err, bookings) => {
                if (err) {
                    console.error('completeTimeslot error', err);
                    reject(err);
                }
                let timeslots_booked_out = false;
                if (bookings instanceof Array && bookings.length === 2 && bookings[0].booked_out && bookings[1].booked_out) {
                    timeslots_booked_out = true;
                }
                if (timeslots_booked_out) {
                    // res.send(200);
                    let emotions = getEmotions(bookings);
                    interestMatching(datetime, bookings)
                        .then(() => {
                            console.log('interestMatching() finished.');
                            resolve(emotions);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                } else {
                    reject({ message: '200' });
                }
            }
        );
    });
}
module.exports.prepareActivity = function (datetime, activity) {
    return new Promise((resolve, reject) => {
        switch (activity) {
            case activities.conversation:
                resolve();
                break;

            case activities.quiz:
                resolve();
                break;

            case activities.gaming:
                resolve();
                break;

            case activities.nothing:
                resolve();
                break;

            default:
                resolve();
                break;
        }
    });
}
function interestMatching(datetime, bookings) {
    return new Promise((resolve, reject) => {
        let matchedInterests = {};
        bookings.forEach((booking, b) => {
            if (b === 0) {
                for (var category in booking.passenger.interests) {
                    if (booking.passenger.interests.hasOwnProperty(category)) {
                        matchedInterests[category] = [];
                    }
                }
            }
            for (var category in booking.passenger.interests) {
                if (booking.passenger.interests.hasOwnProperty(category)) {
                    booking.passenger.interests[category].forEach((element) => {
                        if (bookings[b + 1] !== undefined) {
                            if (bookings[b + 1].passenger.interests[category].indexOf(element) !== -1) {
                                matchedInterests[category].push(element);
                                matchedInterests[category] = Array.from(new Set(matchedInterests[category]));
                            }
                        }
                    });
                }
            }
        });
        BookingModel.update(
            { datetime: datetime },
            { interests: matchedInterests },
            { multi: true },
            (err) => {
                if (err) {
                    console.error('interestMatching error', err);
                    reject(err);
                }
                prepareInterests(datetime).then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                })
            }
        )
    });
}
function prepareInterests(datetime) {
    return new Promise((resolve, reject) => {
        BookingModel.find(
            { datetime: datetime, booked_out: true },
            (err, bookings) => {
                if (err) {
                    console.error('prepareInterests', err);
                    reject(err);
                }
                if (bookings instanceof Array && bookings.length === 2) {
                    if (checkInstagramMatching(bookings)) {
                        resolve(emotionCtrl.matchInstagramInterests(datetime, getProfiles(bookings), bookings));
                        // resolve(emotionCtrl.instagramMatching(datetime, getProfiles(bookings)));
                    } else {
                        resolve();
                    }
                } else {
                    console.error('prepareInterests error: got no bookings', err);
                    reject({ message: 'Timeslot is not fully booked.' });
                }
            }
        );
    });
}
function getProfiles(bookings) {
    let profiles = [];
    bookings.forEach((booking) => {
        profiles.push(booking.passenger.instagram_profile);
    });
    return profiles;
}
function getEmotions(bookings) {
    let emotions = [];
    bookings.forEach((booking) => {
        emotions.push(booking.passenger.emotion);
    });
    return emotions;
}
function checkInstagramMatching(bookings) {
    bookings.forEach((booking) => {
        if (!booking.passenger.instagram_profile) {
            return false;
        }
    });
    return true;
}
