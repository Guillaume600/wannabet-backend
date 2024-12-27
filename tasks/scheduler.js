const cron = require('node-cron')

// URL de la route
const url = `http://${process.env.SERVER_IP}:3000/matchs/updateStatus`

const task = () => {
    // Lancement de la route au demarrage du serveur
    console.log(`${new Date().toLocaleString()}, mise a jour des matchs...`)
    fetch(url)
    // Planification de l'execution de la route toutes les 10min
    cron.schedule('*/1 * * * *', async () => {
        console.log(`${new Date().toLocaleString()}, mise a jour des matchs...`)
        try {
            await fetch(url)
        } catch (err) {
            console.log(`Erreur : ${err.message}`)
        }
    })
} 

module.exports = task