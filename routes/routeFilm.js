import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

/**
 * @route GET /film/tendance
 * @group Film - Tendances
 * @returns {object} 200 - Liste des films tendances de la semaine
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/tendance', async (_, res) => {
  try {
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=fr-FR`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erreur /tendance :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /film/:id
 * @group Film - Détails
 * @param {number} id.path.required - ID du film TMDb
 * @returns {object} 200 - Détails du film
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${req.params.id}?api_key=${API_KEY}&language=fr-FR`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /film/${req.params.id} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /film/:id/images
 * @group Film - Images
 * @param {number} id.path.required - ID du film TMDb
 * @returns {object} 200 - Images du film (affiches, backdrops)
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id/images', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${req.params.id}/images?api_key=${API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /film/${req.params.id}/images :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /film/:id/cast
 * @group Film - Casting
 * @param {number} id.path.required - ID du film TMDb
 * @returns {object} 200 - Liste des acteurs et de l'équipe technique
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id/cast', async (req, res) => {
  try {
    const url = `${BASE_URL}/movie/${req.params.id}/credits?api_key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur API TMDB : ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /film/${req.params.id}/cast :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /film/recherche/:query
 * @group Film - Recherche
 * @param {string} query.path.required - Terme de recherche (ex: avengers+endgame)
 * @returns {object} 200 - Résultats de la recherche TMDb
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/recherche/:query', async (req, res) => {
  const { query } = req.params;

  try {
    const encodedQuery = encodeURIComponent(query);
    const tmdbUrl = `${BASE_URL}/search/movie?query=${encodedQuery}&api_key=${API_KEY}&sort_by=popularity.desc`;

    const response = await fetch(tmdbUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erreur lors de la recherche TMDb :", error);
    res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
});



/**
 * @route GET /film/trailer/:id
 * @group Film - Bande-annonce
 * @param {number} id.path.required - ID du film TMDb
 * @returns {object} 200 - Vidéos liées au film (ex: bande-annonce)
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/trailer/:id', async (req, res) => {
  try {
    const url = `${BASE_URL}/movie/${req.params.id}/videos?api_key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur API TMDB : ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /film/${req.params.id}/video :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




/**
 * @route GET /film?genre=:id
 * @group Film - Par genre
 * @param {number} genre.query.required - ID du genre (ex: 12 pour aventure)
 * @returns {object} 200 - Liste des films du genre
 * @returns {Error} 400 - Genre non fourni
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/', async (req, res) => {
  const { genre } = req.query;
  if (!genre) return res.status(400).json({ error: 'Genre manquant' });

  try {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur API TMDB : ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /film?genre=${genre} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
