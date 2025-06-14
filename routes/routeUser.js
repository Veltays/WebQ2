import express from 'express';  // Sert a créer des routes
import jwt from 'jsonwebtoken'; // Sert a créer des tokens JWT
import fs from 'fs'; // Sert a manipuler les fichiers
import path from 'path'; // Sert a manipuler les chemins de fichiers

// Importer les services nécessaires
import UserService from '../services/userService.js';
import ListeService from '../services/listeService.js';
import FilmService from '../services/filmService.js';
import SerieService from '../services/serieService.js';
import upload from '../middlewares/upload.js';

const router = express.Router();


// Clé secrète JWT
const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';




/**
 * Middleware de vérification du token JWT
 * 
 * @function verifyToken
 * @summary Vérifie la présence et la validité du token JWT dans l'en-tête Authorization
 * @param {object} req - Objet de requête Express (doit contenir un header Authorization: Bearer <token>)
 * @param {object} res - Objet de réponse Express
 * @param {function} next - Fonction next pour continuer la chaîne de middlewares
 * @returns {object} 403 - Si aucun token n’est fourni
 * @returns {object} 401 - Si le token est invalide
 */
function verifyToken(req, res, next) {
  //console.log("Vérification du token JWT");
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Récupère le token depuis l'en-tête Authorization

  //console.log("Token reçu :", token);


  if (!token) {
    console.log("Erreur Token requis");
    return res.status(403).json({ message: "Token requis" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide" });
    }
    req.user = decoded; // Décoder le token et ajouter les infos de l'utilisateur dans la requête
    next();
  });
}


/**
 * @route POST /inscription
 * @group Utilisateur - Authentification
 * @summary Inscription d'un nouvel utilisateur
 * @param {object} req.body - Les données de l'utilisateur (pseudo, email, motDePasse, etc.)
 * @returns {object} 201 - Utilisateur créé avec succès
 * @returns {Error} 500 - Erreur lors de la création de l'utilisateur
 */
router.post('/inscription', async (req, res) => {
  console.log("Inscription d'un nouvel utilisateur");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);
  try {
    await UserService.register(req.body);
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});



/**
 * @route POST /connexion
 * @group Utilisateur - Authentification
 * @summary Connexion d'un utilisateur
 * @param {object} req.body - Identifiant et mot de passe
 * @returns {object} 200 - Connexion réussie + cookie JWT
 * @returns {Error} 500 - Erreur lors de la connexion
 */
router.post('/connexion', async (req, res) => {
  console.log("Connexion d'un utilisateur");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);
  try {
    const { identifiant, motDePasse } = req.body;

    const token = await UserService.login(identifiant, motDePasse);

    res.cookie('token', token, {
      httpOnly: false,  // Permet l'accès au cookie depuis le client --->  Donc pouvoir le lire avec JavaScript 
      secure: false, // Doit être true en production avec HTTPS   --> false pour le développement local 
    });

    res.status(200).json({ message: "Connexion réussie" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
});


/**
 * @route GET /deconnexion
 * @group Utilisateur - Authentification
 * @summary Déconnexion de l'utilisateur (suppression du cookie)
 * @returns {object} 200 - Déconnexion réussie
 */
router.get('/deconnexion', (req, res) => {
  console.log("Déconnexion de l'utilisateur");
  res.clearCookie('token');
  res.status(200).json({ message: "Déconnexion réussie" });
});


/**
 * @route GET /DataUtilisateur
 * @group Utilisateur - Données
 * @summary Récupération des données utilisateur connectées
 * @returns {object} 200 - Données utilisateur
 * @returns {Error} 401 - Token invalide ou manquant
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/DataUtilisateur', verifyToken, async (req, res) => {
  console.log("Récupération des données utilisateur");
  console.log("Utilisateur connecté :", req.user);

  const userPseudo = req.user.pseudo;

  try {
    const user = await UserService.getUserData(userPseudo);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route POST /creerListe
 * @group Liste - Gestion
 * @summary Crée une nouvelle liste pour l'utilisateur connecté
 * @param {object} req.body - Contient le nom de la liste
 * @returns {object} 201 - Liste créée
 * @returns {Error} 500 - Erreur lors de la création de la liste
 */
router.post('/creerListe', verifyToken, async (req, res) => {
  console.log("Création d'une nouvelle liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);


  const userPseudo = req.user.pseudo;
  const { name } = req.body;

  try {
    await ListeService.creerListe(userPseudo, name);
    res.status(201).json({ message: "Liste créée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la liste" });
  }
});



/**
 * @route GET /AllUserList
 * @group Liste - Gestion
 * @summary Récupère toutes les listes de l'utilisateur connecté
 * @returns {object} 200 - Toutes les listes
 * @returns {Error} 500 - Erreur lors de la récupération
 */
router.get('/AllUserList', verifyToken, async (req, res) => {
  console.log("Récupération de toutes les listes de l'utilisateur");
  console.log("Utilisateur connecté :", req.user);


  const userPseudo = req.user.pseudo;

  try {
    const listes = await ListeService.getAllUserList(userPseudo);
    res.status(200).json(listes);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});



/**
 * @route POST /ajouterFilmAListe
 * @group Liste - Gestion des listes de films
 * @summary Ajoute un film à une liste existante de l'utilisateur
 * @param {string} body.filmid.required - ID du film à ajouter
 * @param {string} body.listeid.required - ID de la liste cible
 * @returns {object} 201 - Film ajouté avec succès
 * @returns {Error} 500 - Erreur lors de l'ajout du film
 */
router.post('/ajouterFilmAListe', verifyToken, async (req, res) => {
  console.log("Ajout d'un film à une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);


  const { filmid, listeid } = req.body;
  const userPseudo = req.user.pseudo;

  try {
    await FilmService.ajouterFilmAListe(filmid, listeid);
    res.status(201).json({ message: "Film ajouté à la liste avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du film à la liste" });
  }
});



/**
 * @route POST /ajouterSerieAListe
 * @group Liste - Gestion des listes de séries
 * @summary Ajoute une série à une liste existante de l'utilisateur
 * @param {string} body.serieid.required - ID de la série à ajouter
 * @param {string} body.listeid.required - ID de la liste cible
 * @returns {object} 201 - Série ajoutée avec succès
 * @returns {Error} 500 - Erreur lors de l'ajout de la série
 */
router.post('/ajouterSerieAListe', verifyToken, async (req, res) => {
  console.log("Ajout d'une série à une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);
  const { serieid, listeid } = req.body;


  try {
    await SerieService.ajouterSerieAListe(serieid, listeid);
    res.status(201).json({ message: "Série ajoutée à la liste avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la série à la liste." });
  }
});



/**
 * @route POST /ajouterEpisodeAListe
 * @group Liste - Gestion des listes de séries
 * @summary Ajoute un épisode d'une série à une liste
 * @param {object} body.required - Corps contenant les données de l'épisode à ajouter (structure libre)
 * @returns {object} 201 - Épisode ajouté avec succès
 * @returns {Error} 500 - Erreur lors de l'ajout de l'épisode
 */
router.post('/ajouterEpisodeAListe', verifyToken, async (req, res) => {
  console.log("Ajout d'un épisode à une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  try {
    await SerieService.ajouterEpisodeAListe(req.body);
    res.status(201).json({ message: "Épisode ajouté à la liste avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


/**
 * @route POST /supprimerFilmDeListe
 * @group Liste - Gestion des listes de films
 * @summary Supprime un film d'une liste
 * @param {string} body.filmid.required - ID du film à supprimer
 * @param {string} body.listeid.required - ID de la liste cible
 * @returns {object} 200 - Film supprimé avec succès
 * @returns {Error} 500 - Erreur lors de la suppression du film
 */
router.post('/supprimerFilmDeListe', verifyToken, async (req, res) => {
  console.log("Suppression d'un film d'une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const { filmid, listeid } = req.body;
  const userPseudo = req.user.pseudo;

  console.log(`Suppression du film ${filmid} de la liste ${listeid} par ${userPseudo}`);

  try {
    await FilmService.supprimerFilmDeListe(filmid, listeid);
    res.status(200).json({ message: "Film supprimé de la liste avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du film de la liste" });
  }
});



/**
 * @route POST /supprimerSerieDeListe
 * @group Liste - Gestion des listes de séries
 * @summary Supprime un épisode d'une série d'une liste
 * @param {string} body.serieid.required - ID de la série
 * @param {string} body.listeid.required - ID de la liste
 * @param {number} body.Saison.required - Numéro de la saison
 * @param {number} body.Episode.required - Numéro de l’épisode
 * @returns {object} 200 - Épisode supprimé avec succès
 * @returns {Error} 500 - Erreur lors de la suppression de l’épisode
 */
router.post('/supprimerSerieDeListe', verifyToken, async (req, res) => {
  console.log("Suppression d'une série d'une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const userPseudo = req.user.pseudo;
  const { serieid, listeid, Saison, Episode } = req.body;

  try {
    await SerieService.supprimerEpisodeDeListe({ serieid, listeid, Saison, Episode });
    res.status(200).json({ message: "Épisode supprimé de la liste avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'épisode de la liste" });
  }
});



/**
 * @route POST /supprimerListe
 * @group Liste - Gestion des listes
 * @summary Supprime une liste d’un utilisateur
 * @param {string} body.listeid.required - ID de la liste à supprimer
 * @returns {object} 200 - Liste supprimée avec succès
 * @returns {Error} 500 - Erreur lors de la suppression de la liste
 */

router.post('/supprimerListe', verifyToken, async (req, res) => {
  console.log("Suppression d'une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const pseudo = req.user.pseudo;
  const { listeid } = req.body;

  try {
    await ListeService.supprimerListe(listeid, pseudo);
    res.status(200).json({ message: "Liste supprimée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
});


/**
 * @route POST /updateUserData
 * @group Utilisateur - Gestion du profil
 * @summary Met à jour les informations du profil utilisateur
 * @param {string} body.newPseudo.required - Nouveau pseudo de l'utilisateur
 * @param {string} body.newBanniere.required - Nouvelle URL de bannière
 * @param {string} body.newPhotodeprofil.required - Nouvelle URL de photo de profil
 * @returns {object} 200 - Données utilisateur mises à jour avec succès
 * @returns {Error} 500 - Erreur lors de la mise à jour
 */

router.post('/updateUserData', verifyToken, async (req, res) => {
  console.log("Mise à jour des données utilisateur");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const userPseudo = req.user.pseudo;
  const { newPseudo, newBanniere, newPhotodeprofil } = req.body;

  try {
    const token = await UserService.updateUserData(userPseudo, {
      newPseudo,
      newBanniere,
      newPhotodeprofil,
    });

    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
    });

    res.status(200).json({ message: "Données utilisateur mises à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route POST /updateRankFilm
 * @group Liste - Gestion des rangs
 * @summary Met à jour le rang d’un film dans une liste
 * @param {string} body.filmid.required - ID du film concerné
 * @param {string} body.listeid.required - ID de la liste concernée
 * @param {string} body.rank.required - Rang attribué (A/B/C/D/F)
 * @param {number} body.placeRank.required - Position du film dans ce rang
 * @returns {object} 200 - Rang mis à jour avec succès
 * @returns {Error} 500 - Erreur lors de la mise à jour
 */

router.post('/updateRankFilm', verifyToken, async (req, res) => {
  console.log("Mise à jour du rang d'un film");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const userPseudo = req.user.pseudo;
  const { filmid, listeid, rank, placeRank } = req.body;

  try {
    await FilmService.updateFilmRank(filmid, listeid, rank, placeRank);
    res.status(200).json({ message: "Rang mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});



/**
 * @route POST /updateRankSerie
 * @group Liste - Gestion des rangs
 * @summary Met à jour le rang d’une série dans une liste
 * @param {string} body.serieid.required - ID de la série concernée
 * @param {string} body.listeid.required - ID de la liste concernée
 * @param {string} body.rank.required - Rang attribué (A/B/C/D/F)
 * @param {number} body.placeRank.required - Position de la série dans ce rang
 * @returns {object} 200 - Rang mis à jour avec succès
 * @returns {Error} 500 - Erreur lors de la mise à jour
 */
router.post('/updateRankSerie', verifyToken, async (req, res) => {
  console.log("Mise à jour du rang d'une série");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const { serieid, listeid, rank, placeRank } = req.body;
  const userPseudo = req.user.pseudo;

  try {
    await SerieService.updateSerieRank(serieid, listeid, rank, placeRank);
    res.status(200).json({ message: "Rang de la série mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route POST /updateList
 * @group Liste - Gestion des listes
 * @summary Met à jour le nom d’une liste
 * @param {string} body.listeid.required - ID de la liste à modifier
 * @param {string} body.newName.required - Nouveau nom de la liste
 * @returns {object} 200 - Nom mis à jour avec succès
 * @returns {Error} 500 - Erreur lors de la mise à jour
 */

router.post('/updateList', verifyToken, async (req, res) => {
  console.log("Mise à jour du nom d'une liste");
  console.log("Données reçues :", req.body);
  console.log("Utilisateur connecté :", req.user);

  const { listeid, newName } = req.body;

  try {
    await ListeService.updateListeName(listeid, newName);
    res.status(200).json({ message: "Nom de la liste mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route GET /getFilmFromList
 * @group Liste - Contenu des listes
 * @summary Récupère tous les films d’une liste
 * @param {string} query.listeid.required - ID de la liste concernée
 * @returns {object} 200 - Liste des films
 * @returns {Error} 500 - Erreur lors de la récupération
 */
router.get('/getFilmFromList', verifyToken, async (req, res) => {
  console.log("Récupération des films d'une liste");
  console.log("Paramètres de la requête :", req.query);
  console.log("Utilisateur connecté :", req.user);

  const { listeid } = req.query;

  try {
    const films = await FilmService.getFilmsFromListe(listeid);
    res.status(200).json(films);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});



/**
 * @route GET /getSerieFromList
 * @group Liste - Contenu des listes
 * @summary Récupère toutes les séries d’une liste
 * @param {string} query.listeid.required - ID de la liste concernée
 * @returns {object} 200 - Liste des séries
 * @returns {Error} 500 - Erreur lors de la récupération
 */
router.get('/getSerieFromList', verifyToken, async (req, res) => {
  console.log("Récupération des séries d'une liste");
  console.log("Paramètres de la requête :", req.query);
  console.log("Utilisateur connecté :", req.user);
  const { listeid } = req.query;

  try {
    const series = await SerieService.getSeriesFromListe(listeid);
    res.status(200).json(series);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route GET /getListName/{id}
 * @group Liste - Gestion des listes
 * @summary Récupère le nom d’une liste à partir de son ID
 * @param {string} id.path.required - ID de la liste
 * @returns {object} 200 - Nom de la liste
 * @returns {Error} 500 - Erreur lors de la récupération
 */
router.get('/getListName/:id', async (req, res) => {
  console.log("Récupération du nom d'une liste");
  const listeid = req.params.id;

  try{
    const listeName = await ListeService.getListName(listeid);
    res.status(200).json(listeName);  

  }
  catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});


/**
 * @route GET /getEpisodeFromList
 * @group Liste - Contenu des listes
 * @summary Récupère tous les épisodes d’une liste
 * @param {string} query.listeid.required - ID de la liste concernée
 * @returns {object} 200 - Liste des épisodes
 * @returns {Error} 500 - Erreur lors de la récupération
 */

router.get('/getEpisodeFromList', verifyToken, async (req, res) => {
  console.log("Récupération de tous les épisodes d'une liste");
  console.log("Paramètres de la requête :", req.query);
  console.log("Utilisateur connecté :", req.user);
  const { listeid } = req.query;
  try {
    const episodes = await SerieService.getAllEpisodesFromListe(listeid);
    res.status(200).json(episodes);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

/**
 * @route POST /uploadImage
 * @group Utilisateur - Upload d'image
 * @summary Upload une image (photo de profil ou bannière) pour l’utilisateur connecté
 * @param {file} image.formData.required - Fichier image à uploader
 * @param {string} type.formData.required - Type de l'image ('profil' ou 'banniere')
 * @returns {object} 200 - URL du fichier uploadé
 * @returns {Error} 400 - Fichier ou type manquant
 * @returns {Error} 500 - Erreur serveur lors de l'upload
 */
router.post('/uploadImage', verifyToken, upload.single('image'), (req, res) => {   // 'image' est le nom du champ dans le formulaire
  console.log('📁 Fichier reçu:', req.file);
  console.log('📋 Body reçu:', req.body);
  console.log('🔑 User:', req.user);
  try {
    if (!req.file) {
      console.error('Aucun fichier reçu');
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const type = req.body.type;
    if (!type) {
      console.error('Aucun fichier reçu');
      return res.status(400).json({ message: 'Type non spécifié' });
    }

    // Créer le dossier final
    const finalFolder = path.join('public', 'img', type);
    if (!fs.existsSync(finalFolder)) {
      console.log(`Création du dossier: ${finalFolder}`);
      fs.mkdirSync(finalFolder, { recursive: true });
    }

    // Déplacer le fichier du dossier temp vers le dossier final
    const tempPath = req.file.path;
    const finalPath = path.join(finalFolder, req.file.filename);
    
    console.log(`Déplacement du fichier de ${tempPath} vers ${finalPath}`);
    fs.renameSync(tempPath, finalPath);

    // Construire l'URL du fichier
    const url = `/img/${type}/${req.file.filename}`;
    console.log(`URL du fichier: ${url}`);

    // Répondre avec l'URL du fichier
    res.status(200).json({
      message: 'Fichier uploadé avec succès',
      url
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    
    // Nettoyer le fichier temporaire en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload du fichier' 
    });
  }
});







export default router;