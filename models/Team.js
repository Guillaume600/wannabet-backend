const mongoose = require('mongoose')

const TeamSchema = mongoose.Schema({
    teamId: {type: Number, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    logo: {type: String, required: true, unique: true},
    bestPlayer: {
        name: {type: String},
        goals: {type: Number}
    },
    bestAssister: {
        name: {type: String},
        assists: {type: Number}
    },
    bestRatedPlayer: {
        name: {type: String},
        note: {type: Number}
    },
    lastFixtures: {type: Array, required: true}
})

module.exports = mongoose.model('teams', TeamSchema)