import DbSetter from '../S-F.db/dbSetter.js';
import DbFetcher from '../S-F.db/dbFetcher.js';

/**
 * Service de gestion des listes utilisateur.
 * Permet de créer, modifier, supprimer et récupérer les listes de films/séries/épisodes.
 */
class ListeService {
  static fetcher = new DbFetcher('user');
  static setter = new DbSetter('user');

  /**
   * Crée une nouvelle liste pour un utilisateur.
   * @param {string} pseudo - Pseudo de l'utilisateur.
   * @param {string} nomListe - Nom de la nouvelle liste.
   * @returns {Promise<void>}
   */
  static async creerListe(pseudo, nomListe) {
    await ListeService.setter.insertListe(nomListe, pseudo);
  }

  /**
   * Récupère toutes les listes associées à un utilisateur.
   * @param {string} pseudo - Pseudo de l'utilisateur.
   * @returns {Promise<Object[]>} - Tableau des listes.
   * @throws {Error} - Si aucune liste n'est trouvée.
   */
  static async getAllUserList(pseudo) {
    const listes = await ListeService.fetcher.getListesByUserPseudo(pseudo);

    if (!listes || listes.length === 0) {
      const err = new Error("Aucune liste trouvée");
      err.status = 404;
      throw err;
    }

    return listes;
  }

  /**
   * Supprime une liste (et ses liens) si ce n'est pas une liste protégée.
   * @param {number} listeid - ID de la liste à supprimer.
   * @param {string} pseudo - Pseudo de l'utilisateur.
   * @returns {Promise<void>}
   * @throws {Error} - Si la liste n'existe pas ou est protégée.
   */
  static async supprimerListe(listeid, pseudo) {
    const { fetcher, setter } = ListeService;

    const liste = await fetcher.getListeByIdAndUser(listeid, pseudo);
    if (!liste) {
      const err = new Error("Liste non trouvée");
      err.status = 404;
      throw err;
    }

    const nom = liste.nomliste.toLowerCase();
    if (nom === 'vu' || nom === 'a regarder') {
      const err = new Error("Vous ne pouvez pas supprimer la liste 'Vu'");
      err.status = 400;
      throw err;
    }

    await setter.removeAllFilmFromList(listeid);
    await setter.removeAllSerieFromList(listeid);
    await setter.removeAllEpisodesFromList(listeid);
    await setter.deleteListe(listeid, pseudo);
  }

  /**
   * Modifie le nom d'une liste (si elle n'est pas protégée).
   * @param {number} listeid - ID de la liste.
   * @param {string} newName - Nouveau nom de la liste.
   * @returns {Promise<void>}
   * @throws {Error} - Si la liste n'existe pas ou est protégée.
   */
  static async updateListeName(listeid, newName) {
    const { fetcher, setter } = ListeService;

    const liste = await fetcher.getListeById(listeid);
    if (!liste) {
      const err = new Error("Liste non trouvée");
      err.status = 404;
      throw err;
    }

    const nom = liste.nomliste.toLowerCase();
    if (nom === 'vu' || nom === 'a regarder') {
      const err = new Error("Vous ne pouvez pas modifier la liste 'Vu'");
      err.status = 400;
      throw err;
    }

    await setter.updateListeName(listeid, newName);
  }

  /**
   * Récupère le nom d'une liste via son ID.
   * @param {number} listeid - ID de la liste.
   * @returns {Promise<string>} - Nom de la liste.
   * @throws {Error} - Si la liste est introuvable.
   */
  static async getListName(listeid) {
    const liste = await ListeService.fetcher.getListeById(listeid);
    if (!liste) {
      const err = new Error("Liste non trouvée");
      err.status = 404;
      throw err;
    }
    return liste.nomliste;
  }
}

export default ListeService;
