import DbFetcher from '../S-F.db/dbFetcher.js';
import DbSetter from '../S-F.db/dbSetter.js';

/**
 * Service de gestion des films : ajout, suppression, mise à jour de classement, etc.
 * Utilise des fetchers/setters personnalisés pour interagir avec la base de données.
 */
class FilmService {
  /** @type {DbFetcher} */
  static fetcher = new DbFetcher('film');

  /** @type {DbSetter} */
  static setter = new DbSetter('film');

  /**
   * Ajoute un film à une liste donnée. Insère le film dans la base s'il n'existe pas encore.
   * @param {number|string} filmid - Identifiant du film TMDB.
   * @param {number|string} listeid - Identifiant de la liste.
   * @returns {Promise<void>}
   */
  static async ajouterFilmAListe(filmid, listeid) {
    const { fetcher, setter } = FilmService;

    const filmExiste = await fetcher.filmExists(filmid);
    if (!filmExiste) {
      const res = await fetch(`https://veltays.alwaysdata.net/api/film/${filmid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur API film");

      await setter.insertFilm({
        idfilm: filmid,
        nomfilm: data.original_title,
        duree: data.runtime ?? 0,
      });
    }

    const dejaLie = await fetcher.filmInList(filmid, listeid);
    if (!dejaLie) {
      await setter.linkFilmToList(filmid, listeid);
    }
  }

  /**
   * Supprime un film d'une liste.
   * @param {number|string} filmid - Identifiant du film.
   * @param {number|string} listeid - Identifiant de la liste.
   * @returns {Promise<void>}
   */
  static async supprimerFilmDeListe(filmid, listeid) {
    await FilmService.setter.removeFilmFromList(filmid, listeid);
  }

  /**
   * Met à jour le rang et la position d'un film dans une liste.
   * @param {number|string} filmid - Identifiant du film.
   * @param {number|string} listeid - Identifiant de la liste.
   * @param {string} rank - Rang attribué (ex. : A, B...).
   * @param {number} placeRank - Position dans le rang.
   * @returns {Promise<void>}
   * @throws {Error} Si le film n'existe pas dans la liste.
   */
  static async updateFilmRank(filmid, listeid, rank, placeRank) {
    const { fetcher, setter } = FilmService;

    const isInList = await fetcher.filmInList(filmid, listeid);
    if (!isInList) {
      const err = new Error("Film non trouvé dans la liste");
      err.status = 404;
      throw err;
    }

    await setter.updateFilmRank(filmid, listeid, rank, placeRank);
  }

  /**
   * Récupère tous les films d'une liste donnée.
   * @param {number|string} listeid - Identifiant de la liste.
   * @returns {Promise<Object[]>} Tableau des films.
   * @throws {Error} Si la liste n'existe pas ou n'est pas accessible.
   */
  static async getFilmsFromListe(listeid) {
    const { fetcher } = FilmService;

    const liste = await fetcher.getListeById(listeid);
    if (!liste) {
      const err = new Error("Liste non trouvée ou non autorisée");
      err.status = 404;
      throw err;
    }

    return await fetcher.getFilmsFromListe(listeid);
  }
}

export default FilmService;
