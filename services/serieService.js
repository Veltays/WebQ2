import DbFetcher from '../S-F.db/dbFetcher.js';
import DbSetter from '../S-F.db/dbSetter.js';

/**
 * Service de gestion des séries, épisodes et leur association avec les listes utilisateur.
 */
class SerieService {
  static fetcher = new DbFetcher('serie');
  static setter = new DbSetter('serie');

  /**
   * Ajoute une série à une liste donnée si elle n'y est pas encore.
   * @param {number} serieid - ID TMDB de la série.
   * @param {number} listeid - ID de la liste utilisateur.
   * @returns {Promise<void>}
   */
  static async ajouterSerieAListe(serieid, listeid) {
    const { fetcher, setter } = SerieService;

    const existe = await fetcher.serieExists(serieid);
    if (!existe) {
      const res = await fetch(`https://veltays.alwaysdata.net/api/serie/${serieid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur API série");

      await setter.insertSerie({ idserie: serieid, nomserie: data.original_name });
    }

    const dejaLie = await fetcher.serieInList(serieid, listeid);
    if (!dejaLie) {
      await setter.linkSerieToList(serieid, listeid);
    }
  }

  /**
   * Ajoute un épisode spécifique à une liste, en créant la série/épisode si nécessaire.
   * @param {Object} params - Paramètres de l'épisode.
   * @param {number} params.idserie - ID de la série.
   * @param {number} params.listeid - ID de la liste.
   * @param {number} params.saison - Numéro de saison.
   * @param {number} params.episode - Numéro d’épisode.
   * @returns {Promise<void>}
   */
  static async ajouterEpisodeAListe({ idserie, listeid, saison, episode }) {
    const { fetcher, setter } = SerieService;

    const serieExiste = await fetcher.serieExists(idserie);
    if (!serieExiste) {
      const res = await fetch(`https://veltays.alwaysdata.net/api/serie/${idserie}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur API série");

      await setter.insertSerie({ idserie, nomserie: data.original_name });
    }

    const serieDansListe = await fetcher.serieInList(idserie, listeid);
    if (!serieDansListe) {
      await setter.linkSerieToList(idserie, listeid);
    }

    const episodeExiste = await fetcher.episodeExists(idserie, saison, episode);
    if (!episodeExiste) {
      console.log(`Récupération des détails de l'épisode ${episode} de la saison ${saison} de la série ${idserie}`);
      const epRes = await fetch(`https://veltays.alwaysdata.net/api/serie/episode/${idserie}/${saison}/${episode}`);
      const epData = await epRes.json();
      if (!epRes.ok) throw new Error(epData.message || "Erreur API épisode");

      const runTime = epData?.data?.runtime ?? 0;
      await setter.insertEpisode({ idserie, saison, episode, duree: runTime });
    }

    const dejaLie = await fetcher.episodeInList(idserie, saison, episode, listeid);
    if (!dejaLie) {
      await setter.linkEpisodeToList(idserie, saison, episode, listeid);
    }
  }

  /**
   * Supprime un épisode d'une liste et désassocie la série si plus aucun épisode n'y est lié.
   * @param {Object} params - Paramètres de l'épisode.
   * @param {number} params.serieid - ID de la série.
   * @param {number} params.listeid - ID de la liste.
   * @param {number} params.saison - Numéro de saison.
   * @param {number} params.episode - Numéro de l’épisode.
   * @returns {Promise<void>}
   */
  static async supprimerEpisodeDeListe({ serieid, listeid, saison, episode }) {
    const { fetcher, setter } = SerieService;

    await setter.removeEpisodeFromList({ idserie: serieid, saison, episode, idliste: listeid });

    const encoreDesEpisodes = await fetcher.serieStillHasEpisodes(serieid, listeid);
    if (!encoreDesEpisodes) {
      await setter.unlinkSerieFromList(serieid, listeid);
    }
  }

  /**
   * Met à jour le rang et la position d'une série dans une liste.
   * @param {number} serieid - ID de la série.
   * @param {number} listeid - ID de la liste.
   * @param {string} rank - Rang (ex: A, B, C...).
   * @param {number} placeRank - Position dans le rang.
   * @returns {Promise<void>}
   * @throws {Error} - Si la série n’est pas dans la liste.
   */
  static async updateSerieRank(serieid, listeid, rank, placeRank) {
    const { fetcher, setter } = SerieService;

    const isInList = await fetcher.serieInList(serieid, listeid);
    if (!isInList) {
      const err = new Error("Série non trouvée dans la liste");
      err.status = 404;
      throw err;
    }

    await setter.updateSerieRank(serieid, listeid, rank, placeRank);
  }

  /**
   * Récupère toutes les séries associées à une liste.
   * @param {number} listeid - ID de la liste.
   * @returns {Promise<Object[]>} - Liste des séries.
   * @throws {Error} - Si la liste n'existe pas.
   */
  static async getSeriesFromListe(listeid) {
    const { fetcher } = SerieService;

    const liste = await fetcher.getListeById(listeid);
    if (!liste) {
      const err = new Error("Liste non trouvée ou non autorisée");
      err.status = 404;
      throw err;
    }

    return await fetcher.getSeriesFromListe(listeid);
  }

  /**
   * Récupère tous les épisodes d'une liste, toutes séries confondues.
   * @param {number} listeid - ID de la liste.
   * @returns {Promise<Object[]>} - Liste des épisodes.
   * @throws {Error} - Si la liste n'existe pas.
   */
  static async getAllEpisodesFromListe(listeid) {
    const { fetcher } = SerieService;

    const liste = await fetcher.getListeById(listeid);
    if (!liste) {
      const err = new Error("Liste non trouvée ou non autorisée");
      err.status = 404;
      throw err;
    }

    return await fetcher.getAllEpisodesFromListe(listeid);
  }
}

export default SerieService;
