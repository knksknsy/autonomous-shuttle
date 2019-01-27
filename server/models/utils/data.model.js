const a = { quiz: 'quiz', conversation: 'conversation', gaming: 'gaming', nothing: 'nothing' };

module.exports = {
    stations: ['HdM', 'Pavillon'],
    interests: { animals: [], technologies: [], movies: [], vacations: [], sports: [] },
    activities: { quiz: 'quiz', conversation: 'conversation', gaming: 'gaming', nothing: 'nothing' },
    emotions: { fear: 'fear', joy: 'joy', surprise: 'surprise', sadness: 'sadness', anger: 'anger', disgust: 'disgust', neutral: 'neutral' },
    emotionsEnum: { fear: 0, joy: 1, surprise: 2, sadness: 3, anger: 4, disgust: 5, neutral: 6 },
    activityMatrix: [
        [a.quiz, a.quiz, a.nothing, a.conversation, a.gaming, a.conversation, a.quiz],
        [a.nothing, a.quiz, a.nothing, a.quiz, a.quiz, a.quiz, a.conversation],
        [a.nothing, a.nothing, a.nothing, a.nothing, a.nothing, a.conversation, a.nothing],
        [a.nothing, a.nothing, a.nothing, a.conversation, a.conversation, a.conversation, a.conversation],
        [a.nothing, a.nothing, a.nothing, a.nothing, a.gaming, a.gaming, a.gaming],
        [a.nothing, a.nothing, a.nothing, a.nothing, a.nothing, a.conversation, a.quiz],
        [a.nothing, a.nothing, a.nothing, a.nothing, a.nothing, a.nothing, a.quiz]
        // [ a.quiz,           null,           null,           null,           null,       null,   null    ],
        // [ a.quiz,           a.conversation, null,           null,           null,       null,   null    ],
        // [ a.gaming,         a.gaming,       a.gaming,       null,           null,       null,   null    ],
        // [ a.conversation,   a.conversation, a.conversation, a.conversation, null,       null,   null    ],
        // [ a.nothing,        a.conversation, a.nothing,      a.nothing,      a.nothing,  null,   null    ],
        // [ a.conversation,   a.quiz,         a.quiz,         a.quiz,         a.nothing,  a.quiz, null    ],
        // [ a.quiz,           a.conversation, a.gaming,       a.conversation, a.nothing,  a.quiz, a.quiz  ],
    ]
}