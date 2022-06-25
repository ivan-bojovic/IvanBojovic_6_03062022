const Sauce = require('../models/Sauce');
const fs = require('fs');
const { log } = require('console');

// Création des sauces.
exports.createSauce = (req,res,next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    if (sauceObject.heat <0 && sauceObject.heat>10){
        return res.status(400).json({
            message: "le heat de sauce doit être entre 0 et 10"
        })
    }  
    if (sauceObject.name === '' || sauceObject.manufacturer === '' || sauceObject.description === '' || sauceObject.mainPepper === '' || sauceObject.imageUrl === '' || sauceObject.heat === '' ){
        return res.status(400).json({
            message: "tous les champs doivent etre remplis"
        })
    }  
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré.'}))
    .catch(error => res.status(400).json({ error }));
};

// Modifications des sauces.
exports.modifySauce = (req,res,next) => {
    const sauceObject = req.file ? {...JSON.parse(req.body.sauce),imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`}:{...req.body};

    if (sauceObject.heat <0 && sauceObject.heat>10){
        return res.status(400).json({
            message: "le heat de sauce doit être entre 0 et 10"
        })
    }  
    if (sauceObject.name === '' || sauceObject.manufacturer === '' || sauceObject.description === '' || sauceObject.mainPepper === '' || sauceObject.imageUrl === '' || sauceObject.heat === ''  ){
        return res.status(400).json({
            message: "tous le champs doivent etre remplis"
        })
    }  

    if(req.file){
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.userId) {
                return res.status(400).json ({
                    message: 'User ID Not Valid'
                })
            }
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id:req.params.id})
                .then(() => res.status(200).json({ message: 'Element mise à jour..'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
    } else{
        Sauce.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Sauce modifié.'}))
        .catch(error => res.status(400).json({ error }));
    }
};

// Suppression des sauces.
exports.deleteSauce = (req,res,next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        if (sauce.userId !== req.userId) {
            return res.status(400).json ({
                message: 'User ID Not Valid'
            })
        }
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimé.'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};

// Renvoi la sauce avec l'ID.
exports.getOneSauce = (req,res,next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

// Renvoi tableau de sauces.
exports.getAllSauce = (req,res,next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

// Gestion des likes.
exports.userLikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (req.body.like === -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)){
                    sauce.dislikes++
                    sauce.usersDisliked.push(req.body.userId)
                    sauce.save()
                }
            }
            else if (req.body.like === 1) {
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes++
                    sauce.usersLiked.push(req.body.userId)
                    sauce.save()
                }
            }
            else if (req.body.like === 0) {
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1)
                    sauce.dislikes--
                }
                else if (sauce.usersLiked.includes(req.body.userId)) {
                    sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1)
                    sauce.likes--
                }
                sauce.save()
            }
            else {
                res.status(400).json({ error: 'Erreur!' })
                return
            }
            res.status(200).json(sauce)
        })
        .catch((error) => res.status(404).json({ error: error }))
}