/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/

var request_promise = require('request-promise');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf').sync;

var mongoose = require('mongoose');
var BookingModel = mongoose.model('Booking');

var instagram_images_path = require('../config/path.config').instagram_images.path;
const emotions = require('../models/utils/data.model').emotions;
const emotionsEnum = require('../models/utils/data.model').emotionsEnum;
const activityMatrix = require('../models/utils/data.model').activityMatrix;

const cloudinaryConfig = require('../config/api.config').cloudinary;
const kairosConfig = require('../config/api.config').kairos;
const visionConfig = require('../config/api.config').vision;

module.exports.analyseEmotion = function (booking) {
    return new Promise((resolve, reject) => {
        let cloudinaryOptions = {
            url: `https://api.cloudinary.com/v1_1/shuttlecar/image/upload`,
            //url: `https://api.cloudinary.com/v1_1/autonomous-shuttle/image/upload`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                file: booking.passenger.image,
                upload_preset: cloudinaryConfig.upload_preset
            }
        };
        // cloudinaryOptions.body.file = booking.passenger.image;
        cloudinaryOptions.body = JSON.stringify(cloudinaryOptions.body);
        request_promise(cloudinaryOptions)
            .then((cloudinaryBody) => {
                console.log('cloudinary request finished.');
                cloudinaryBody = JSON.parse(cloudinaryBody);
                let kairosOptions = {
                    url: `https://api.kairos.com/v2/media?source=${cloudinaryBody.secure_url}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'app_id': kairosConfig.app_id,
                        'app_key': kairosConfig.app_key
                    },
                    body: {
                        image: cloudinaryBody.secure_url
                    }
                };
                // kairosOptions.url = `https://api.kairos.com/v2/media?source=${cloudinaryBody.secure_url}`;
                // kairosOptions.body.image = cloudinaryBody.secure_url;
                kairosOptions.body = JSON.stringify(kairosOptions.body);
                return request_promise(kairosOptions);
            })
            .then((kairosBody) => {
                console.log('kairos request finished.');
                let emotion;
                kairosBody = JSON.parse(kairosBody);
                // emotion recognized
                if (kairosBody.frames && kairosBody.frames[0].people[0] && kairosBody.frames[0].people[0].emotions) {
                    emotion = kairosBody.frames[0].people[0].emotions;
                    if (isEmotionNeutral(emotion)) {
                        emotion = emotions.neutral;
                    } else {
                        emotion = evaluateKairosEmotion(emotion);
                    }
                } else {
                    emotion = emotions.neutral;
                }
                BookingModel.findOneAndUpdate(
                    {
                        datetime: booking.datetime,
                        station: booking.station,
                        booked_out: true
                    },
                    { 'passenger.emotion': emotion },
                    { new: true },
                    (err, doc) => {
                        if (err) {
                            console.error('analyseEmotion findOneAndUpdate error', err);
                            reject(err);
                        }
                        resolve(booking);
                    }
                );
            })
            .catch((err) => {
                console.error('analyseEmotion request_promise error', err);
                reject(err);
            });
    });
}
/**
 * Assess the activity of the passengers' emotions emotions
 * 
 * @param {any} emotions Array of the passengers' emotions
 * @returns 
 */
module.exports.assessActivity = function (datetime, emotions) {
    return new Promise((resolve, reject) => {
        let activity = getActivityFromEmotionMatrix(emotions);

        BookingModel.update(
            { datetime: datetime },
            { activity: activity },
            { multi: true },
            (err) => {
                if (err) {
                    console.error('assessActivity error', err);
                    reject(err);
                }
                resolve(activity);
            }
        );
    });
}
module.exports.instagramInterests = function (profile, datetime) {
    return new Promise((resolve, reject) => {
        let instagram_path = `${instagram_images_path}${profile}`;
        const args = [
            `${profile}`,
            '--maximum', '10',
            '--media-types', 'image',
            '--destination', `${instagram_path}`,
            '--interactive'
        ];
        const proc = spawn(`/usr/src/app/instagram-scraper/venv/bin/instagram-scraper`, args, { stdio: 'pipe', encoding: 'utf-8' });
        proc.stdout.on('data', (data) => {
            console.log(`stdout on data: ${data}`);
            if (data.indexOf('(I)gnore') !== -1) {
                proc.stdin.setDefaultEncoding('utf-8');
                proc.stdin.write('I\n');
                proc.stdin.end();
            }
        });
        proc.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            let files = fs.readdirSync(instagram_path);
            if (files && files.length) {
                processInstagramScraper(profile, datetime)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    });
}
function processInstagramScraper(profile, datetime) {
    return new Promise((resolve, reject) => {
        let instagramImages = [];
        let payload = [];
        let visionOptions = [];

        let instagram_path = `${instagram_images_path}${profile}`;

        // Covert the image data to a Buffer and base64 encode it.
        let files;
        try {
            files = fs.readdirSync(instagram_path);
        } catch (err) {
            console.error('instagramMatching readdirSync error', err);
            reject(err);
        }

        files.forEach((file) => {
            // don't push files ending with '.part'
            if (path.extname(file) !== ".part") {
                instagramImages.push(new Buffer(fs.readFileSync(`${instagram_path}/${file}`)).toString("base64"));
            }
        });

        instagramImages.forEach((image) => {
            let body = {
                image: {
                    content: image
                },
                features: [{
                    type: 'LABEL_DETECTION',
                    maxResults: 3
                }]
            };
            payload.push(body);
        });
        let body = { requests: payload };
        // visionOptions.body = JSON.stringify(body);

        const visionOption = {
            url: `https://vision.googleapis.com/v1/images:annotate?key=${visionConfig.key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };
        getVisionLabels(datetime, profile, visionOption)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.error('instagramInterests getVisionLabels error', err);
                reject(err);
            });
    });
}
module.exports.matchInstagramInterests = function (datetime, profiles, bookings) {
    return new Promise((resolve, reject) => {
        console.log('matchInstagramInterests() called');
        interests = {};
        bookings.forEach((booking) => {
            interests[booking.passenger.instagram_profile] = booking.passenger.instagram_interests;
        });
        let matchedInterests = [];
        profiles.forEach((profile) => {
            interests[profile].forEach((interest) => {
                // todo: persist instagram_interests
                for (var matchee in interests) {
                    if (interests.hasOwnProperty(matchee)) {
                        if (matchee != profile) {
                            if (interests[matchee].indexOf(interest) !== -1) {
                                matchedInterests.push(interest);
                            }
                        }
                    }
                }
            });
        });
        matchedInterests = Array.from(new Set(matchedInterests));
        console.log('Matched interests: ', JSON.stringify(matchedInterests, null, 4));
        BookingModel.update(
            { datetime: datetime },
            { instagram_interests: matchedInterests },
            { multi: true },
            (err, bookings) => {
                if (err) {
                    console.error('instagramMatching BookingModel update error', err);
                    reject(err);
                }
                resolve();
            }
        );
    });
}
function getVisionLabels(datetime, profile, option) {
    return new Promise((resolve, reject) => {
        instagramInterests = [];
        request_promise(option)
            .then((labels) => {
                console.log('vision request finished.');
                try {
                    labels = JSON.parse(labels);
                } catch (err) {
                    console.error('instagramMatching request_promise parse error', err);
                    reject(err);
                }
                if (!labels.responses) {
                    reject({ message: 'Got invalid response from Google Vision.' });
                }
                return processAndSaveLabelResponse(datetime, profile, labels)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        console.error('processAndSaveLabelResponse error', err);
                        reject(err);
                    });
            });
    });
}
function processAndSaveLabelResponse(datetime, profile, response) {
    return new Promise((resolve, reject) => {
        // // delete locally saved instagram images
        // let instagram_path = `${instagram_images_path}${profile}`;
        // rimraf(instagram_path);
        // console.log(`${profile}'s instagram images successfully deleted.`);

        let labelsArray = [];
        response.responses.forEach((labels) => {
            labels.labelAnnotations.forEach((label) => {
                labelsArray.push(label.description);
            });
        });
        labelsArray = Array.from(new Set(labelsArray));

        BookingModel.update(
            {
                datetime: datetime,
                'passenger.instagram_profile': profile
            },
            { 'passenger.instagram_interests': labelsArray },
            { new: true },
            (err, booking) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
    });
}
function getActivityFromEmotionMatrix(emotions) {
    let emotionP1 = emotions[0];
    let emotionP2 = emotions[1];
    emotionP1 = emotionsEnum[emotionP1];
    emotionP2 = emotionsEnum[emotionP2];
    return activityMatrix[emotionP1][emotionP2];
}
function evaluateKairosEmotion(emotion) {
    let result;
    let emotionsArray = [];
    let maxValue;
    for (let property in emotion) {
        if (emotion.hasOwnProperty(property)) {
            emotionsArray.push(emotion[property]);
        }
    }
    maxValue = emotionsArray.reduce((a, b) => {
        return Math.max(a, b);
    });
    for (let property in emotion) {
        if (emotion.hasOwnProperty(property)) {
            if (emotion[property] === maxValue) {
                result = property;
            }
        }
    }
    return result;
}
function isEmotionNeutral(emotion) {
    for (let property in emotion) {
        if (emotion.hasOwnProperty(property)) {
            if (emotion[property] !== 0) {
                return false;
            }
        }
    }
    return true;
}
