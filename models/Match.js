const mongoose = require('mongoose')

const MatchSchema = mongoose.Schema({
    teamHome: {
        name: {type: String, required: true},
        logo: {type: String, required: true},
    },
    teamAway: {
        name: {type: String, required: true},
        logo: {type: String, required: true},
    },
    date: {type: Date, required: true},
    score: {
         home: {type: Number, default: null},
        away: {type: Number, default: null},
    },
    odds: {
        home: {type: Number, required: true},
        away: {type: Number, required: true},
        draw: {type: Number, required: true}
    },
    round: {type: Number, required: true},
    status: {type: String, required: true}
})

module.exports = mongoose.model('matchs', MatchSchema)