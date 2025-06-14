import pool from '../db.js';
import Db from './dbAbstract.js';

/**
 * Classe responsable des opérations d'écriture dans la base de données PostgreSQL.
 * Gère les utilisateurs, listes, films, séries et épisodes.
 * Hérite de la classe Db.
 */
class DbSetter extends Db {
  // 🧑 Utilisateur

  /**
   * Insère un nouvel utilisateur avec mot de passe hashé.
   * @param {Object} user - Données de l'utilisateur.
   * @param {string} user.nom
   * @param {string} user.prenom
   * @param {string} user.pseudo
   * @param {string|null} user.dateNaissance
   * @param {number|null} user.age
   * @param {string} user.email
   * @param {string} user.hashedPassword
   * @returns {Promise<void>}
   */
  async insertUser({ nom, prenom, pseudo, dateNaissance, age, email, hashedPassword }) {
    await pool.query(
      `INSERT INTO UTILISATEUR (nom, prenom, pseudo, datenaissance, age, email, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nom, prenom, pseudo, dateNaissance, age, email, hashedPassword]
    );
  }

  /**
   * Met à jour les données d’un utilisateur (pseudo, photo, bannière).
   * @param {Object} data
   * @param {string} data.currentPseudo
   * @param {string} data.newPseudo
   * @param {string} data.banniere
   * @param {string} data.photodeprofil
   * @returns {Promise<void>}
   */
  async updateUserData({ currentPseudo, newPseudo, banniere, photodeprofil }) {
    await pool.query(
      `UPDATE UTILISATEUR 
       SET pseudo = $1, banniere = $2, photodeprofil = $3 
       WHERE pseudo = $4`,
      [newPseudo, banniere, photodeprofil, currentPseudo]
    );
  }

  /**
   * Insère un utilisateur via Google (sans mot de passe).
   * @param {Object} user - Données de l'utilisateur.
   * @param {string} user.nom
   * @param {string} user.prenom
   * @param {string} user.pseudo
   * @param {string|null} user.dateNaissance
   * @param {number|null} user.age
   * @param {string} user.email
   * @param {string|null} user.photodeprofil
   * @param {string|null} user.banniere
   * @returns {Promise<void>}
   */
  async insertUserFromGoogle({ nom, prenom, pseudo, dateNaissance, age, email, photodeprofil, banniere }) {
    const query = `
      INSERT INTO UTILISATEUR (nom, prenom, pseudo, datenaissance, age, email, photodeprofil, banniere)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await pool.query(query, [nom, prenom, pseudo, dateNaissance, age, email, photodeprofil, banniere]);
  }

  // 📋 Listes

  /**
   * Crée les listes par défaut "A Regarder" et "Vu" pour un utilisateur.
   * @param {string} pseudo
   * @returns {Promise<void>}
   */
  async insertDefaultLists(pseudo) {
    await pool.query(
      `INSERT INTO LISTE (nomliste, pseudo_utilisateur) VALUES 
       ('A Regarder', $1), ('Vu', $1)`,
      [pseudo]
    );
  }

  /**
   * Crée une nouvelle liste personnalisée pour un utilisateur.
   * @param {string} nomListe
   * @param {string} pseudo
   * @returns {Promise<void>}
   */
  async insertListe(nomListe, pseudo) {
    await pool.query(
      `INSERT INTO LISTE (nomliste, pseudo_utilisateur) VALUES ($1, $2)`,
      [nomListe, pseudo]
    );
  }

  /**
   * Met à jour le nom d'une liste.
   * @param {number} listeid
   * @param {string} newName
   * @returns {Promise<void>}
   */
  async updateListeName(listeid, newName) {
    await pool.query(
      `UPDATE LISTE SET nomliste = $1 WHERE idliste = $2`,
      [newName, listeid]
    );
  }

  /**
   * Supprime une liste spécifique d’un utilisateur.
   * @param {number} listeid
   * @param {string} pseudo
   * @returns {Promise<void>}
   */
  async deleteListe(listeid, pseudo) {
    await pool.query(
      `DELETE FROM LISTE WHERE idliste = $1 AND pseudo_utilisateur = $2`,
      [listeid, pseudo]
    );
  }

  /**
   * Supprime tous les films d’une liste.
   * @param {number} listeid
   * @returns {Promise<void>}
   */
  async removeAllFilmFromList(listeid) {
    await pool.query(`DELETE FROM CONTIENTFILM WHERE idliste = $1`, [listeid]);
  }

  /**
   * Supprime toutes les séries d’une liste.
   * @param {number} listeid
   * @returns {Promise<void>}
   */
  async removeAllSerieFromList(listeid) {
    await pool.query(`DELETE FROM CONTIENTSERIE WHERE idliste = $1`, [listeid]);
  }

  /**
   * Supprime tous les épisodes d’une liste.
   * @param {number} listeid
   * @returns {Promise<void>}
   */
  async removeAllEpisodesFromList(listeid) {
    await pool.query(`DELETE FROM EPISODEVU WHERE idliste = $1`, [listeid]);
  }

  // 🎬 Films

  /**
   * Insère un film dans la base de données.
   * @param {Object} film
   * @param {number} film.idfilm
   * @param {string} film.nomfilm
   * @param {number} film.duree
   * @returns {Promise<void>}
   */
  async insertFilm({ idfilm, nomfilm, duree }) {
    await pool.query(
      `INSERT INTO FILM (idfilm, nomfilm, duree) VALUES ($1, $2, $3)`,
      [idfilm, nomfilm, duree]
    );
  }

  /**
   * Lie un film à une liste.
   * @param {number} idfilm
   * @param {number} idliste
   * @returns {Promise<void>}
   */
  async linkFilmToList(idfilm, idliste) {
    await pool.query(
      `INSERT INTO CONTIENTFILM (idliste, idfilm) VALUES ($1, $2)`,
      [idliste, idfilm]
    );
  }

  /**
   * Supprime un film d’une liste.
   * @param {number} filmid
   * @param {number} listeid
   * @returns {Promise<void>}
   */
  async removeFilmFromList(filmid, listeid) {
    await pool.query(
      `DELETE FROM CONTIENTFILM WHERE idliste = $1 AND idfilm = $2`,
      [listeid, filmid]
    );
  }

  /**
   * Met à jour le classement d’un film dans une liste.
   * @param {number} filmid
   * @param {number} listeid
   * @param {string} rank
   * @param {number} placeRank
   * @returns {Promise<void>}
   */
  async updateFilmRank(filmid, listeid, rank, placeRank) {
    await pool.query(
      `UPDATE CONTIENTFILM 
       SET ranks = $1, placerank = $2 
       WHERE idliste = $3 AND idfilm = $4`,
      [rank, placeRank, listeid, filmid]
    );
  }

  // 📺 Séries

  /**
   * Insère une série dans la base.
   * @param {Object} serie
   * @param {number} serie.idserie
   * @param {string} serie.nomserie
   * @returns {Promise<void>}
   */
  async insertSerie({ idserie, nomserie }) {
    await pool.query(
      `INSERT INTO SERIE (idserie, nomserie) VALUES ($1, $2)`,
      [idserie, nomserie]
    );
  }

  /**
   * Lie une série à une liste.
   * @param {number} idserie
   * @param {number} idliste
   * @returns {Promise<void>}
   */
  async linkSerieToList(idserie, idliste) {
    await pool.query(
      `INSERT INTO CONTIENTSERIE (idliste, idserie) VALUES ($1, $2)`,
      [idliste, idserie]
    );
  }

  /**
   * Supprime le lien entre une série et une liste.
   * @param {number} idserie
   * @param {number} idliste
   * @returns {Promise<void>}
   */
  async unlinkSerieFromList(idserie, idliste) {
    await pool.query(
      `DELETE FROM CONTIENTSERIE WHERE idliste = $1 AND idserie = $2`,
      [idliste, idserie]
    );
  }

  /**
   * Met à jour le classement d'une série dans une liste.
   * @param {number} serieid
   * @param {number} listeid
   * @param {string} rank
   * @param {number} placeRank
   * @returns {Promise<void>}
   */
  async updateSerieRank(serieid, listeid, rank, placeRank) {
    await pool.query(
      `UPDATE CONTIENTSERIE 
       SET ranks = $1, placerank = $2 
       WHERE idliste = $3 AND idserie = $4`,
      [rank, placeRank, listeid, serieid]
    );
  }

  // 🎞️ Épisodes

  /**
   * Insère un épisode dans la base.
   * @param {Object} episode
   * @param {number} episode.idserie
   * @param {number} episode.saison
   * @param {number} episode.episode
   * @param {number} episode.duree
   * @returns {Promise<void>}
   */
  async insertEpisode({ idserie, saison, episode, duree }) {
    await pool.query(
      `INSERT INTO EPISODE (idserie, saison, episode, dureeepisode) VALUES ($1, $2, $3, $4)`,
      [idserie, saison, episode, duree]
    );
  }

  /**
   * Lie un épisode à une liste.
   * @param {number} idserie
   * @param {number} saison
   * @param {number} episode
   * @param {number} idliste
   * @returns {Promise<void>}
   */
  async linkEpisodeToList(idserie, saison, episode, idliste) {
    await pool.query(
      `INSERT INTO EPISODEVU (idliste, idserie, saison, episode) VALUES ($1, $2, $3, $4)`,
      [idliste, idserie, saison, episode]
    );
  }

  /**
   * Supprime un épisode d’une liste.
   * @param {Object} episode
   * @param {number} episode.idserie
   * @param {number} episode.saison
   * @param {number} episode.episode
   * @param {number} episode.idliste
   * @returns {Promise<void>}
   */
  async removeEpisodeFromList({ idserie, saison, episode, idliste }) {
    await pool.query(
      `DELETE FROM EPISODEVU WHERE idliste = $1 AND idserie = $2 AND saison = $3 AND episode = $4`,
      [idliste, idserie, saison, episode]
    );
  }
}

export default DbSetter;
