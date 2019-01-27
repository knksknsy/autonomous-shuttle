/**
*  Copyright (C) 2017
*
*  Kaan K.
*
*  MIT License
*/
const express = require('express');
const router = express.Router();

const ttsCtrl = require('../../controllers/tts.ctrl');

router.post('/', (req, res, next) => {
    if (!req.body.message) {
        return res.sendStatus(500).json({ 'message': 'Body invalid.' });
    }
    ttsCtrl.synthesize(req.body.message).then((stream) => {
        return res.send(stream);
    });
});

module.exports = router;
