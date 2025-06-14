/**
 * Contrôleur principal de la page série.
 * Initialise les composants de la page série et les listes utilisateur.
 * @module serieMain
 */

import initSeriePage from './seriePageRenderer.js';
import { initEpisodeButtonListeners } from './serieEpisodeButtonController.js';
import { listeDeListe, chargerToutesLesListes, afficherListesDansMenuSerie } from '../Film/listeDeListe.js';

const params = new URLSearchParams(window.location.search);
const serieId = params.get("id");

/**
 * Initialise la page série au chargement du DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
  initSeriePage(serieId);
  initEpisodeButtonListeners();
});

// Chargement des listes utilisateur dans le menu contextuel
listeDeListe("toggleMenu", "listeMenu");
await chargerToutesLesListes();
afficherListesDansMenuSerie("listeMenu");
