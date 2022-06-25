const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const emailValidator= require('email-validator');

// Création d'un mot de passe fort.
var passwordValidator = require('password-validator');

// Create a schema.
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)                                    
.is().max(100)                                  
.has().uppercase()                              
.has().lowercase()                              
.has().digits(2)                                
.has().not().spaces()                          
.is().not().oneOf(['Passw0rd', 'Password123']);

// Inscription de l'utilisateur et cryptage du password.
exports.signup = (req,res,next) => {
    if(!emailValidator.validate(req.body.email) || !passwordSchema.validate(req.body.password)) {
        return res.status(400).json({message:'Verifiez le format de votre addresse e-mail ou votre mot de passe'});
    }else if (emailValidator.validate(req.body.email) || passwordSchema.validate(req.body.password)) {
    
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur enregistré.'}))
            .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};
};

exports.login = (req,res,next) => {
    console.log('login');
    User.findOne({ email: req.body.email })
    .then(user => {
        if(!user){
            return res.status(401).json({ error: 'Utilisateur non trouvé.'})
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid){
                return res.status(401).json({ error: 'Mot de passe incorrect.'})
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id},
                    process.env.JWTTOKEN,
                    { expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({ error}));
    })
    .catch(error => res.status(500).json({ error}));
};