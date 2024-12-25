const express = require('express')
const router = express.Router()
const checkBody = require('../modules/checkBody')
const User = require('../models/User')
const Match = require('../models/Match')

// Créer un nouveau pari pour un utilisateur
router.post('/new', async (req,res) => {
    if(!checkBody(req.body, ['token', 'matchId', 'predictedScore', 'stake'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {token, matchId, predictedScore, stake} = req.body
    try {
        // Vérifier l'ustilisateur
        const user = await User.findOne({token})
        if (!user) {
            return res.json({result: false, error: 'Utilisateur introuvable.'})
        }
        // Vérifier le match
        const match = await Match.findById(matchId)
        if (!match) {
            return res.json({result: false, error: 'Match introuvable.'})
        }
        if (match.status != "Non commençé") {
          return res.json({result: false, error: 'Impossible de créer un pari sur un match terminé ou en cours.'})
        }
        // Vérifier l'existance du bet
        const bet = user.bets.find(bet => bet.matchId.toString() === matchId)
        if (bet) {
            return res.json({result: false, error: 'Un pari est déja enregistré pour ce match.'})
        }
        // Créer le bet
        const newBet = {
            matchId,
            predictedScore,
            stake
        }
        user.bets.push(newBet)
        user.coins -= stake
        await user.save()
        res.json({result: true, bet: newBet})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Modifier un pari existant
router.put('/update', async (req,res) => {
    if(!checkBody(req.body, ['token', 'matchId', 'predictedScore', 'stake'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {token, matchId, predictedScore, stake} = req.body
    try {
      // Vérifier l'utilisateur
      const user = await User.findOne({token})
      if (!user) {
        return res.json({result: false, error: 'Utilisateur introuvable.'})
      }
      // Vérifier le match
      const match = await Match.findById(matchId)
      if (!match) {
        return res.json({result: false, error: 'Match introuvable.'})
      }
      // Vérifier le pari
      const bet = user.bets.find(bet => bet.matchId.toString() === matchId)
      if (!bet) {
        return res.json({result: false, error: 'Pari introuvable pour ce match.'})
      }
      // Modifier le pari
      if (predictedScore.home !== undefined) {
        bet.predictedScore.home = predictedScore.home
      }
      if (predictedScore.away !== undefined) {
        bet.predictedScore.away = predictedScore.away
      }
      if (stake !== undefined) {
        bet.stake = stake
      }
      await user.save()
      res.json({result:true, message: 'Pari modifié avec succés !', bet})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Supression d'un pari existant
router.delete('/delete', async (req,res) => {
    if(!checkBody(req.body, ['token', 'matchId'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {token, matchId} = req.body
    try {
      // Vérifier l'utilisateur
      const user = await User.findOne({token})
      if (!user) {
        return res.json({result: false, error: 'Utilisateur introuvable.'})
      }
      // Vérifier le match
      const match = await Match.findById(matchId)
      if (!match) {
        return res.json({result: false, error: 'Match introuvable.'})
      }
      // Vérifier le pari
      const bet = user.bets.find(bet => bet.matchId.toString() === matchId)
      if (!bet) {
        return res.json({result: false, error: 'Pari introuvable pour ce match.'})
      }
      // Supprimer le bet
      const newbets = user.bets.filter(bet => bet.matchId.toString() !== matchId)
      user.bets = newbets
      await user.save()
      res.json({result: true, message: 'Pari supprimé avec succés'})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Récupérer un pari d'un utilisateur via le matchId
router.post('/getBet', async (req,res) => {
  if(!checkBody(req.body, ['token', 'matchId'])) {
    return res.json({result: false, error: 'Champs manquants ou vides.'})
}
  const {token, matchId} = res.body
  try {

    // Trouver l'utilisateur
    const user = await User.findOne({token})
    if (!user) {
      return res.json({result: false, error: 'Utilisateur introuvable.'})
    } 
    // Trouver le pari correspondant au matchId
    const bet = user.bets.find(bet => bet.matchId.toString() === matchId.toString())
    if (!bet) {
      return res.json({result: false, error: 'Pas de pari trouvé pour ce match.'})
    }
    res.json({result:true, bet})
  } catch (err) {
    res.json({error: err.message})
  }
})

module.exports = router