var express = require('express');
var router = express.Router();
const checkBody = require('../modules/checkBody.js')
const bcrypt = require('bcrypt')
const {uuid} = require('uuidv4')
const User = require('../models/User')
const nodemailer = require('nodemailer');

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
router.put('/update/:token', async (req,res) => {
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
        res.json({result: true, message: `Profil mis a jour avec succès !`})
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

//Première étape réinitialisation mdp : envoie code par mail
router.post('/forgotPassword', (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Adresse email requise' });
    }
  
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
  //génération code à 6 chiffres, valable uniquement une heure
        const resetCode = Math.floor(100000 + Math.random() * 900000); 
        const resetCodeExpiration = Date.now() + 3600000; 
  //on a ajouté 2 champs dans l'objet user, obligation de les stocker pour la vérification
        user.resetCode = resetCode;
        user.resetCodeExpiration = resetCodeExpiration;
  
        return user.save().then(() => {
          //méthode nodemailer (gmail car pas d'adresse à domaine propre)
          const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'wannabet.lacapsule@gmail.com',
              pass: 'mnssqmqpsqohpxwv',
            },
            encoding: 'utf-8',
          });
  
          const mailOptions = {
            to: user.email,
            from: 'wannabet.lacapsule@gmail.com',
            subject: 'Votre nouveau mot de passe WannaBet',
            html: `
              Bonjour,<br><br>
              Voici votre code de réinitialisation : <b>${resetCode}</b><br>
              Ce code est valable pendant 1 heure.<br><br>
              Cordialement,<br>
              L'équipe Wannabet
            `,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
            },
          };
  
          return transporter.sendMail(mailOptions);
        });
      })
      .then(() => {
        res.status(200).json({ message: 'Un email avec un code de réinitialisation a été envoyé' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue' });
      });
  });
  
  //Vérification du code envoyé par mail
  router.post("/verifyResetCode", (req, res) => {
    //Cette fois on intègre le nouveau champ resetCode
    const { email, resetCode } = req.body;
  
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ error: "Utilisateur non trouvé" });
        }
        //Code nécessaire pour poursuivre
        if (!user.resetCode) {
          return res.status(400).json({ error: "Code de réinitialisation manquant" });
        }
        //Et maintenant on s'assure que le code envoyé et saisi correspond à celui de l'objet user
        if (user.resetCode !== resetCode) {
          return res.status(400).json({ error: "Code de réinitialisation invalide" });
        }
  
        return res.json({ message: "Code validé" });
      })
      .catch((err) => {
        return res.status(500).json({ error: "Erreur serveur" });
      });
  });
  
  //mise à jour mot passe
  router.post('/updatePassword', (req, res) => {
    const { newPassword, resetEmail } = req.body; 
  
    if (!newPassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe est requis' });
    }
  
    User.findOne({ email: resetEmail })  
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        //On n'oublie surtout pas de hasher le nouveau mdp
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
          }
          //Une fois le nouveau mdp établi, on supprime les champs resetCode et Expiration en cas de nouvel oubli de mdp 
          user.password = hashedPassword; 
          user.resetCode = undefined; 
          user.resetCodeExpiration = undefined; 
  
          user.save()
            .then(() => {
              res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
            })
            .catch((error) => {
              res.status(500).json({ error: 'Erreur lors de la sauvegarde du mot de passe' });
            });
        });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Une erreur est survenue' });
      });
  });
  

module.exports = router;
