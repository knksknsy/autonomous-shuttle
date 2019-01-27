// Do not commit and push this file into gitlab! Every developer should keed their private copy of this file.
// This file contains your private api keys for the following services:
module.exports = {
    // https://cloudinary.com/
    cloudinary: {
        upload_preset: '<upload_preset>'
    },
    // https://www.kairos.com/
    kairos: {
        app_id: '<app_id>',
        app_key: '<app_key>'
    },
    // https://cloud.google.com/vision/
    vision: {
        key: '<key>'
    },
    // https://www.ibm.com/watson/services/text-to-speech/
    watson: {
        tts_id: '<tts_id>',
        tts_key: '<tts_key>',
        tts_voice: 'de-DE_BirgitVoice'
        // tts_voice: 'de-DE_DieterVoice'
    }
}
