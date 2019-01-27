/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookingSchema = Schema({
    // _id: { type: String, required: true, unique: true },
    datetime: Number,
    station: String,
    passenger: {
        // _id: { type: String, required: true },
        name: String,
        instagram_profile: String,
        instagram_interests: [String],
        interests: Schema.Types.Mixed,
        image: String,
        emotion: String
    },
    // passengers: [{ type: Schema.Types.ObjectId, ref: 'Passenger' }],
    instagram_interests: [String], // matched interests from instagram_images & instagram_interests
    interests: Schema.Types.Mixed,
    booked_out: Boolean,
    activity: String
});

mongoose.model('Booking', BookingSchema);
