const mongoose = require('mongoose')

const BetSchema = mongoose.Schema({
    matchId: {type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true},
    predictedScore: {
        home: {type: Number, required: true},
        away: {type: Number, required: true},
    },
    stake: {type: Number, required: true},
    status: {type: String, enum: ['En cours', 'Gagné', 'Perdu'], default: 'En cours'},
    winnings: {type: Number, default: null} // gains calculés
})

const UserSchema = mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String, default: null},
    coins: {type: Number, default: 1000},
    points: {type: Number, default: 0},
    avatar: {type: String, default: '/public/images/Wannabet_Logo.png'},
    bets: [BetSchema]
})

module.exports = mongoose.model('users', UserSchema)