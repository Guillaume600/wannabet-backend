const moment = require('moment')

const isMatchCompleted = (match) => {
    // Durée d'un match (105min) en ms
    const matchDuration = 6300000
    // Date du match en format timestamp
    const dateMatch = moment.utc(match.date).valueOf()
    // Fin du match
    const endMatch = dateMatch + matchDuration
    // Date du jour
    const dateDay = moment.utc().valueOf()

    // Affichage pour vérifier les valeurs
    // console.log('Match Date (UTC):', moment.utc(match.date).format());
    // console.log('Current Date (UTC):', moment.utc().format());
    // console.log('Match End Date (UTC):', moment.utc(endMatch).format()); 

    if (dateDay < dateMatch) {
        // Match non commençé
        return 'Non commençé'
    } else if (dateDay > endMatch) {
        // Match terminé
        return 'Terminé'
    } else {
        // Match en cours
        return 'En cours'
    }
}

module.exports = isMatchCompleted