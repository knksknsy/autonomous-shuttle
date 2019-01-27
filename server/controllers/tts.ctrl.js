const watsonConfig = require('../config/api.config').watson;
const watson = require('watson-developer-cloud/text-to-speech/v1');

module.exports.synthesize = function (message) {
    return new Promise((resolve, reject) => {
        const text_to_speech = new watson({
            username: watsonConfig.tts_id,
            password: watsonConfig.tts_key,
            version: 'v1'
        });
        const params = {
            text: message,
            voice: watsonConfig.tts_voice,
            accept: 'audio/ogg;codec=opus'
        };
        var stream = text_to_speech.synthesize(params, (err, audio) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            let base64 = new Buffer(audio).toString('base64');
            base64 = 'data:audio/ogg;base64,' + base64;
            resolve({ stream: base64 });
        });
    });
}
