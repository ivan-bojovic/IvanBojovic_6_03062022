const multer = require('multer');

// Vérification du format des images ajoutées et modification de leur nom lors de la sauvegarde.
const  MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = (file.originalname.split('.')[file.originalname.split('.'). length -1]);
        const extension =  MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' +  extension);
    }
});

module.exports = multer({ storage}).single('image');