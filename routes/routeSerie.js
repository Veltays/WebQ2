import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

/**
 * @route GET /serie/tendance
 * @group Série - Tendances
 * @returns {object} 200 - Séries tendances de la semaine
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/tendance', async (_, res) => {
  try {
    const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=fr-FR`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erreur /tendance :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/:id
 * @group Série - Détails
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Détails de la série
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${req.params.id}?api_key=${API_KEY}&language=fr-FR`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /tv/${req.params.id} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/:id/images
 * @group Série - Images
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Images liées à la série
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id/images', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${req.params.id}/images?api_key=${API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /tv/${req.params.id}/images :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/:id/cast
 * @group Série - Casting
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Distribution (cast) de la série
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/:id/cast', async (req, res) => {
  try {
    const url = `${BASE_URL}/tv/${req.params.id}/credits?api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDB : ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /tv/${req.params.id}/cast :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/recherche/:query
 * @group Série - Recherche
 * @param {string} query.path.required - Texte recherché (ex: breaking+bad)
 * @returns {object} 200 - Résultats de la recherche
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/recherche/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const encodedQuery = encodeURIComponent(query);
    const tmdbUrl = `${BASE_URL}/search/tv?query=${encodedQuery}&api_key=${API_KEY}&sort_by=popularity.desc`;
    const response = await fetch(tmdbUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erreur lors de la recherche TMDb :", error);
    res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
});

/**
 * @route GET /serie/trailer/:id
 * @group Série - Vidéos
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Vidéos liées à la série (bande-annonces, etc.)
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/trailer/:id', async (req, res) => {
  try {
    const url = `${BASE_URL}/tv/${req.params.id}/videos?api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDB : ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /tv/${req.params.id}/video :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/NbSeason/:id
 * @group Série - Infos
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Informations incluant le nombre de saisons
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/NbSeason/:id', async (req, res) => {
  const { id } = req.params;
  const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US&append_to_response=episode_groups`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDB : ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /NbSeason/${id} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/getAllSeason/:season/:id
 * @group Série - Saison
 * @param {number} season.path.required - Numéro de la saison
 * @param {number} id.path.required - ID de la série
 * @returns {object} 200 - Détails de la saison
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/getAllSeason/:season/:id', async (req, res) => {
  const { season, id } = req.params;
  const url = `${BASE_URL}/tv/${id}/season/${season}?api_key=${API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDB : ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /getAllSeason/${season}/${id} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie/episode/:id/:season/:episode
 * @group Série - Épisode
 * @param {number} id.path.required - ID de la série
 * @param {number} season.path.required - Numéro de la saison
 * @param {number} episode.path.required - Numéro de l'épisode
 * @returns {object} 200 - Détails de l’épisode (inclut la durée)
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/episode/:id/:season/:episode', async (req, res) => {
  const { id, season, episode } = req.params;
  const url = `${BASE_URL}/tv/${id}/season/${season}/episode/${episode}?api_key=${API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDb : ${response.status}`);
    const data = await response.json();
    res.json({ data });
  } catch (error) {
    console.error(`Erreur /episode/${id}/${season}/${episode} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /serie?genre=:id
 * @group Série - Par genre
 * @param {number} genre.query.required - ID du genre (ex: 10765 pour Sci-Fi)
 * @returns {object} 200 - Séries correspondant au genre
 * @returns {Error} 400 - Genre non fourni
 * @returns {Error} 500 - Erreur serveur
 */
router.get('/', async (req, res) => {
  const { genre } = req.query;
  if (!genre) return res.status(400).json({ error: 'Genre manquant' });

  try {
    const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genre}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API TMDB : ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Erreur /serie?genre=${genre} :`, error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
