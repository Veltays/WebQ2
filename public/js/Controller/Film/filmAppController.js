import initFilmPage from './filmPageRenderer.js';
import { listeDeListe, chargerToutesLesListes, afficherListesDansMenu } from './listedeliste.js';

/**
 * Récupère les paramètres de l'URL et extrait l'identifiant du film.
 * Initialise la page du film correspondant et charge les listes.
 */
async function initialiserPageFilm() {
  // Récupération de l'ID du film depuis l'URL
  const params = new URLSearchParams(window.location.search);
  const filmId = params.get("id");

  // Initialisation de la page du film
  initFilmPage(filmId);

  // Ajout du gestionnaire pour l'ouverture du menu de listes
  listeDeListe("toggleMenu", "listeMenu");

  // Chargement et affichage de toutes les listes disponibles
  await chargerToutesLesListes();
  afficherListesDansMenu("listeMenu");
}

// Appel de la fonction principale
initialiserPageFilm();
