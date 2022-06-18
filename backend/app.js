// Importation express.
const express = require('express');

// Importation mongoose.
const mongoose = require('mongoose');

// DOTENV pour gérer les variables d'environnements.
require('dotenv').config();

// Importation helmet
const helmet = require("helmet"); //Sécurisation des en-tete

// Importation router sauce.
const sauceRoutes = require('./routes/sauce');
// Importation router user.
const userRoutes = require('./routes/user')


// Accès au chemin du système de fichier.
const path = require('path');

const app = express();

// Connexion à la base de données

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n8duq.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  //Securité OWASP
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());
app.disabled("x-powered-by");

app.use (express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
 //afichage des images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

// Exportation du fichier APP.JS.
module.exports = app;