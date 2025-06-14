import multer from 'multer';
import path from 'path';
import fs from 'fs';



/**
 * Middleware de gestion des fichiers uploadés avec multer
 * @module upload
 * @description
 * Configure le stockage temporaire des fichiers dans `public/img/temp`, 
 * accepte uniquement les images (jpeg, jpg, png, gif, webp), 
 * et limite la taille des fichiers à 5 Mo.
 * 
 * Utilisation typique :
 * ```js
 * import upload from './middlewares/upload.js';
 * app.post('/upload', upload.single('image'), (req, res) => { ... });
 * ```
 * 
 * @property {function} storage - Configuration du stockage temporaire
 * @property {function} fileFilter - Fonction de filtrage des fichiers acceptés
 * @property {object} limits - Limites d'upload (taille max : 5 Mo)
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Utiliser un dossier temporaire d'abord
    const tempFolder = path.join('public', 'img', 'temp');   // Dossier temporaire pour les uploads

    if (!fs.existsSync(tempFolder)) 
      {     // Vérifier si le dossier existe (fs = file system)
      fs.mkdirSync(tempFolder, { recursive: true });  // Créer le dossier s'il n'existe pas pq 
      //  recursive: true permet de créer tous les dossiers parents nécessaires
      // si ya pas img temp, il va les créers
    }


    console.log('Storage destination:', storage.destination);  // Log pour vérifier la destination de stockage
    cb(null, tempFolder); // Spécifier le dossier de destination pour les fichiers uploadés -> on sort du middleware multer
    // on repasse la main à multer pour qu'il puisse continuer le traitement du fichier
    // prochaine étape : le nom du fichier
  },



  filename: (req, file, cb) => {   // Générer un nom de fichier unique
    const ext = path.extname(file.originalname);   // Obtenir l'extension du fichier
    const name = Date.now() + '-' + file.fieldname + ext;  // Créer un nom de fichier unique basé sur le timestamp et le nom du champ pour éviter les collisions
    // file.fieldname correspond au nom du champ dans le formulaire (par exemple 'image' si c'est un champ d'upload d'image)
    cb(null, name);   // Spécifier le nom du fichier final
  }
});


// Validation des fichiers     
const fileFilter = (req, file, cb) =>    
  {   
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];  // les diffférent typeAutoriser
  
  if (allowedTypes.includes(file.mimetype)) 
    {    // Vérifier si le type MIME du fichier est autorisé (donc dcp forcement une image (JPEG, JPG, PNG, GIF, WEBP))
    cb(null, true);  // Appeler le callback avec null pour l'erreur et true pour indiquer que le fichier est accepté
  }
   else
    {
    cb(new Error('Type de fichier non autorisé. Seuls les images sont acceptées.'), false);  // Appeler le callback avec une erreur si le type de fichier n'est pas autorisé
  }
};

console.log('Multer configuration loaded'); // Log pour vérifier que la configuration de multer est chargée
console.log('File filter set to allow:', fileFilter.allowedTypes || 'all types'); // Log pour vérifier les types de fichiers autorisés

const upload = multer({    // Créer une instance de multer avec la configuration définie
  storage,  // Spécifier le stockage défini précédemment
  fileFilter,    // Spécifier la fonction de filtrage des fichiers
  limits: {   // Limites d'upload
    fileSize: 5 * 1024 * 1024 // 5MB max  
  }
});

export default upload;