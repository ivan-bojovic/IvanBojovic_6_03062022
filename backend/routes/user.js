const express = require('express');
const router = express.Router();
const bouncer = require ("express-bouncer")(500, 2000, 10);

const userCtrl = require('../controllers/user');

//Routes pour les utilisateurs
router.post('/signup', userCtrl.signup);
router.post('/login', bouncer.block, userCtrl.login);

module.exports = router;