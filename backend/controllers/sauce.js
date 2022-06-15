const Sauce = require('../models/Sauce');
const fs = require('fs');

// Création des sauces.
exports.createSauce = (req,res,next) => {
    const sauceObject = JSON.parse(req.body.sauce)
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
    if(req.file){
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
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