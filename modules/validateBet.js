const User = require('../models/User')

const validateBet = async (match) => {
    const {_id, score} = match
    // Récupére tout les utilsiateurs avec un pari en cours pour le match
    const users = await User.find({'bets.matchId': _id, 'bets.status': 'En cours'})
    for(let user of users) {
        // Trouver le bon pari
        const bet = user.bets.find(bet => bet.matchId.toString() === _id.toString() && bet.status == 'En cours')
        if (bet) {
            // Compteurs de points et de gains
            let points = 0
            let winnings = 0
            let winner
            // Determiner le gagnant
            if (score.home === score.away) {
                winner = 'draw'
            }
            else if (score.home > score.away) {
                winner = 'home'
            } else {
                winner = 'away'
            }
            // Cas de prediction juste (+3 points/gains = mise * cote gagnante)
            if (bet.predictedScore.home === score.home && bet.predictedScore.away === score.away) {
                points = 3
                if (winner === 'draw') {winnings = bet.stake * match.odds.draw}
                if (winner === 'home') {winnings = bet.stake * match.odds.home}
                if (winner === 'away') {winnings = bet.stake * match.odds.away}
            }
            // Cas de prédiction correcte (+1 point/gains = mise * 50% cote gagnante)
            else if (bet.predictedScore.home > bet.predictedScore.away && score.home > score.away || bet.predictedScore.home < bet.predictedScore.away && score.home < score.away) {
                points = 1
                if (winner === 'home') {winnings = bet.stake * match.odds.home / 2}
                if (winner === 'away') {winnings = bet.stake * match.odds.away / 2}
            } 
            // Prediction fausse, pas de gains

            // Mettre a jour le bet de l'utilisateur
            bet.status = winnings > 0 ? 'Gagné' : 'Perdu'
            bet.winnings = winnings
            user.points += points
            user.coins += winnings
            await user.save()
        }
    }
}

module.exports = validateBet