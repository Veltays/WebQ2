import pool from '../db.js';
import Db from './dbAbstract.js';

/**
 * Classe responsable de la récupération des données depuis la base de données PostgreSQL.
 * Hérite de Db pour gérer plusieurs types de ressources (utilisateur, film, série...).
 */
class DbFetcher extends Db {
  // 🧑 Utilisateur

  /**
   * Vérifie si un utilisateur existe par pseudo ou email.
   * @param {string} pseudo - Le pseudo de l'utilisateur.
   * @param {string} email - L'email de l'utilisateur.
   * @returns {Promise<boolean>}
   */
  async userExistsByPseudoOrEmail(pseudo, email) {
    const result = await pool.query(
      'SELECT 1 FROM UTILISATEUR WHERE pseudo = $1 OR email = $2',
      [pseudo, email]
    );
    return result.rowCount > 0;
  }

  /**
   * Récupère un utilisateur par pseudo ou email.
   * @param {string} identifiant - Pseudo ou email.
   * @returns {Promise<Object>}
   */
  async getUserByPseudoOrEmail(identifiant) {
    const result = await pool.query(
      `SELECT * FROM UTILISATEUR WHERE pseudo = $1 OR email = $1`,
      [identifiant]
    );
    return result.rows[0];
  }

  /**
   * Récupère les données complètes d'un utilisateur à partir de son pseudo.
   * @param {string} pseudo
   * @returns {Promise<Object>}
   */
  async getUserDataByPseudo(pseudo) {
    const result = await pool.query(
      `SELECT 
        pseudo, nom, prenom, datenaissance, age, email,
        nombreheurevisionnerserie, nombreheurevisionnerfilm,
        nombreheurevisionnetotal, banniere, photodeprofil
       FROM UTILISATEUR WHERE pseudo = $1`,
      [pseudo]
    );
    return result.rows[0];
  }

  /**
   * Vérifie si un pseudo est déjà utilisé par un autre utilisateur.
   * @param {string} newPseudo
   * @param {string} currentPseudo
   * @returns {Promise<boolean>}
   */
  async isPseudoTaken(newPseudo, currentPseudo) {
    const result = await pool.query(
      `SELECT 1 FROM UTILISATEUR WHERE pseudo = $1 AND pseudo != $2`,
      [newPseudo, currentPseudo]
    );
    return result.rowCount > 0;
  }

  // 📋 Liste

  /**
   * Récupère une liste par son ID.
   * @param {number} idliste
   * @returns {Promise<Object>}
   */
  async getListeById(idliste) {
    const result = await pool.query(`SELECT * FROM LISTE WHERE idliste = $1`, [idliste]);
    return result.rows[0];
  }

  /**
   * Récupère une liste par ID et pseudo de l'utilisateur.
   * @param {number} idliste
   * @param {string} pseudo
   * @returns {Promise<Object>}
   */
  async getListeByIdAndUser(idliste, pseudo) {
    const result = await pool.query(
      `SELECT * FROM LISTE WHERE idliste = $1 AND pseudo_utilisateur = $2`,
      [idliste, pseudo]
    );
    return result.rows[0];
  }

  /**
   * Récupère toutes les listes d’un utilisateur par pseudo.
   * @param {string} pseudo
   * @returns {Promise<Object[]>}
   */
  async getListesByUserPseudo(pseudo) {
    const result = await pool.query(
      `SELECT * FROM LISTE WHERE pseudo_utilisateur = $1`,
      [pseudo]
    );
    return result.rows;
  }

  // 🎬 Films

  /**
   * Vérifie si un film existe en base.
   * @param {number} idfilm
   * @returns {Promise<boolean>}
   */
  async filmExists(idfilm) {
    const result = await pool.query(`SELECT 1 FROM FILM WHERE idfilm = $1`, [idfilm]);
    return result.rowCount > 0;
  }

  /**
   * Vérifie si un film est lié à une liste.
   * @param {number} idfilm
   * @param {number} idliste
   * @returns {Promise<boolean>}
   */
  async filmInList(idfilm, idliste) {
    const result = await pool.query(
      `SELECT 1 FROM CONTIENTFILM WHERE idfilm = $1 AND idliste = $2`,
      [idfilm, idliste]
    );
    return result.rowCount > 0;
  }

  /**
   * Récupère tous les films d’une liste.
   * @param {number} idliste
   * @returns {Promise<Object[]>}
   */
  async getFilmsFromListe(idliste) {
    const result = await pool.query(
      `SELECT idfilm, ranks, placerank FROM CONTIENTFILM WHERE idliste = $1`,
      [idliste]
    );
    return result.rows;
  }

  // 📺 Séries

  /**
   * Vérifie si une série existe en base.
   * @param {number} idserie
   * @returns {Promise<boolean>}
   */
  async serieExists(idserie) {
    const result = await pool.query(`SELECT 1 FROM SERIE WHERE idserie = $1`, [idserie]);
    return result.rowCount > 0;
  }

  /**
   * Vérifie si une série est liée à une liste.
   * @param {number} idserie
   * @param {number} idliste
   * @returns {Promise<boolean>}
   */
  async serieInList(idserie, idliste) {
    const result = await pool.query(
      `SELECT 1 FROM CONTIENTSERIE WHERE idserie = $1 AND idliste = $2`,
      [idserie, idliste]
    );
    return result.rowCount > 0;
  }

  /**
   * Vérifie si une série a encore des épisodes liés à une liste.
   * @param {number} idserie
   * @param {number} idliste
   * @returns {Promise<boolean>}
   */
  async serieStillHasEpisodes(idserie, idliste) {
    const result = await pool.query(
      `SELECT 1 FROM EPISODEVU WHERE idliste = $1 AND idserie = $2`,
      [idliste, idserie]
    );
    return result.rowCount > 0;
  }

  /**
   * Récupère toutes les séries d’une liste.
   * @param {number} idliste
   * @returns {Promise<Object[]>}
   */
  async getSeriesFromListe(idliste) {
    const result = await pool.query(
      `SELECT idserie, ranks, placerank FROM CONTIENTSERIE WHERE idliste = $1`,
      [idliste]
    );
    return result.rows;
  }

  // 🎞️ Épisodes

  /**
   * Vérifie si un épisode existe.
   * @param {number} idserie
   * @param {number} saison
   * @param {number} episode
   * @returns {Promise<boolean>}
   */
  async episodeExists(idserie, saison, episode) {
    const result = await pool.query(
      `SELECT 1 FROM EPISODE WHERE idserie = $1 AND saison = $2 AND episode = $3`,
      [idserie, saison, episode]
    );
    return result.rowCount > 0;
  }

  /**
   * Vérifie si un épisode est lié à une liste.
   * @param {number} idserie
   * @param {number} saison
   * @param {number} episode
   * @param {number} idliste
   * @returns {Promise<boolean>}
   */
  async episodeInList(idserie, saison, episode, idliste) {
    const result = await pool.query(
      `SELECT 1 FROM EPISODEVU WHERE idserie = $1 AND saison = $2 AND episode = $3 AND idliste = $4`,
      [idserie, saison, episode, idliste]
    );
    return result.rowCount > 0;
  }

  // 📧 Google

  /**
   * Récupère un utilisateur à partir de son email.
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async getUserByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM UTILISATEUR WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Récupère tous les épisodes d’une liste.
   * @param {number} idliste
   * @returns {Promise<Object[]>}
   */
  async getAllEpisodesFromListe(idliste) {
    const result = await pool.query(
      `SELECT idserie, saison, episode FROM EPISODEVU WHERE idliste = $1`,
      [idliste]
    );
    return result.rows;
  }
}

export default DbFetcher;
