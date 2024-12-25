const express = require('express')
const router = express.Router()
const checkBody = require('../modules/checkBody')
const Match = require('../models/Match')
const isMatchCompleted = require('../modules/isMatchCompleted')
const validateBet = require('../modules/validateBet')

// Créer un nouveau match
router.post('/new', async (req,res) => {
    if(!checkBody(req.body, ['teamHome', 'teamAway', 'date', 'odds', 'round', 'status'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {teamHome, teamAway, date, odds, round, status} = req.body
    try {
        // Verifier l'existence du match
        const match = await Match.findOne({teamHome, teamAway, date})
        if (match) {
            return res.json({result: false, error: 'Le match éxiste déja.'})
        } 
        // Création d'un nouveau match
        let newMatch = new Match({
            teamHome,
            teamAway,
            date,
            odds,
            round,
            status
        })
        newMatch = await newMatch.save()
        res.json({result: true, message: `Match ${newMatch._id} ajouté avec succés.`})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Récupérer les matchs par semaine (round)
router.get('/get/:round', async (req,res) => {
    const {round} = req.params
    try {
        const matches = await Match.find({round}).sort({date: 1})
        res.json({matches})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Mettre à jour le score d'un match
router.put('/update/:matchId', async (req,res) => {
    if(!checkBody(req.body, ['scoreHome', 'scoreAway'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {matchId} = req.params
    const {scoreHome, scoreAway} = req.body
    try {
        const match = await Match.findById(matchId)
        if (!match) {
            return res.json({reulst: false, error: 'Match introuvable.'})
        }
        match.score.home = scoreHome
        match.score.away = scoreAway
        await match.save()
        res.json({result: true, message: 'Score mis à jour avec succés.'})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Mise a jour du status des matchs
router.get('/updateStatus', async (req,res) => {
    try {
        const matches = await Match.find()
        for (let match of matches) {
            const matchStatus = isMatchCompleted(match)

            // Si le match est terminé on lui attribue un score aléatoire (a changer our l'API plus tard)
            if (matchStatus === 'Terminé') {
                // const home = Math.floor(Math.random() * 5)
                // const away = Math.floor(Math.random() * 5)
                match.score.home = 3
                match.score.away = 0
                // Calcul des gains
                await validateBet(match)
            }

            match.status = matchStatus
            await match.save()
        }
        res.json({matches})
    } catch (err) {
        res.json({error: err.message})
    }
})

module.exports = router