var express = require('express');
var router = express.Router();
const checkBody = require('../modules/checkBody.js')
const bcrypt = require('bcrypt')
const {uuid} = require('uuidv4')
const User = require('../models/User')

// Inscrire un nouvel utilisateur
router.post('/signup', async (req,res) => {
    if(!checkBody(req.body, ['username', 'email', 'password'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {email, username, password, avatar} = req.body
    try {
        // Vérification de l'existence de l'email en BDD
        const user = await User.findOne({email})
        if (user) {
            return res.json({result: false, error: "L'utilisateur éxiste déja."})
        }
        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)
        // Création du nouvel user
        let newUser = new User({
            username,
            email,
            password: hashedPassword,
            avatar, // Si undefined, Mongoose replacera par la valeur par defaut
            token: uuid()
        })
        await newUser.save()
        newUser = await User.findOne({email})
        res.json({result: true, username: newUser.username, email: newUser.email, token: newUser.token})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Connexion d'un utilisateur
router.post('/signin', async (req,res) => {
    if(!checkBody(req.body, ['email', 'password'])) {
        return res.json({result: false, error: 'Champs manquants ou vides.'})
    }
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if (!user) {
            return res.json({result: false, error: 'Email ou mot de passe incorrect.'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.json({result: false, error: 'Email ou mot de passe incorrect.'})
        }
        res.json({result: true, token: user.token, username: user.username, email: user.email, coins: user.coins, avatar: user.avatar})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Mise a jour d'un user via son token
router.post('/update/:token', async (req,res) => {
    const {token} = req.params
    const {email, username, avatar} = req.body
    try {
        const user = await User.findOne({token})
        if(!user) {
            return res.json({result: false, error: 'Utilisateur introuvable.'})
        }
        if (email) {user.email = email}
        if (username) {user.username = username}
        if (avatar) {user.avatar = avatar}
        await user.save()
        res.json({result: true, message: `Profil mis a jour avec succés !`})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Récupération d'un profil utilsiateur via son token
router.get('/getProfile/:token', async (req,res) => {
    const {token} = req.params
    try {
        const user = await User.findOne({token})
        if(!user) {
            return res.json({result: false, error: 'Utilisateur introuvable.'})
        }
        res.json({result: true, username: user.username, email: user.email})
    } catch (err) {
        res.json({error: err.message})
    }
})

// Récupération des utilisateurs triés par points
router.get('/byPoints', async (req,res) => {
    try {
        const users = await User.find().sort({points: -1}) 
        res.json({users})
    } catch (err) {
        res.json({error: err.message})
    }
})

module.exports = router;
