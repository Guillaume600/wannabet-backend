const express = require('express')
const router = express.Router()
const checkBody = require('../modules/checkBody')
const Team = require('../models/Team')

// Créer une nouvelle équipe
router.post('/new', async (req,res) => {
    if (!checkBody(req.body, ['teamId', 'name', 'logo', 'bestPlayer', 'bestAssister', 'bestRatedPlayer', 'lastFixtures'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    try {
        const {teamId, name, logo, bestPlayer, bestAssister, bestRatedPlayer, lastFixtures} = req.body
        // Vérification de doublon
        const team = await Team.findOne({teamId})
        if (team) {
            return res.json({result: false, error: "l'équipe éxiste déja."})
        }
        // Création de la nouvelle équipe
        const newTeam = new Team({
            teamId,
            name,
            logo,
            bestPlayer,
            bestAssister,
            bestRatedPlayer,
            lastFixtures
        })
        await newTeam.save()
        res.json({result: true, message: `Equipe ${newTeam.teamId} créée !`})
    } catch (err) {
        res.json({result: false, error: err.message})
    }
})

// Modifier une équipe
router.put('/update/:teamId', async (req,res) => {
    const {teamId} = req.params
    const {bestPlayer, name, logo, bestAssister, bestRatedPlayer, lastFixtures} = req.body
    try {
        // Trouver l'équipe
        const team = await Team.findOne({teamId})
        if (!team) {
            return res.json({result: false, error: "Pas d'équipe trouvée pour cet ID."})
        }
        if (name) {team.name = name}
        if (logo) {team.logo = logo}
        if (bestPlayer) {team.bestPlayer = bestPlayer}
        if (bestAssister) {team.bestAssister = bestAssister}
        if (bestRatedPlayer) {team.bestRatedPlayer = bestRatedPlayer}
        if (lastFixtures) {team.bestPlayer = lastFixtures}
        await team.save()
        res.json({result: true, message: 'Mise à jour éffectuée.'})
    } catch (err) {
        res.json({result: false, error: err.message})
    }
})

// Récupérer les informations d'une équipe
router.get('/get/:teamId', async (req,res) => {
    try {
        const {teamId} = req.params
        const team = await Team.findOne({teamId})
        if (!team) {
            return res.json({result: false, error: "Pas d'équipe trouvée pour cet ID."})
        }
        res.json({result: true, team})
    } catch (err) {
        res.json({result: false, error: err.message})
    }
})

module.exports = router