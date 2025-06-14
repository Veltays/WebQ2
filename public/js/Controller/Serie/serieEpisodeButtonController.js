/**
 * Contrôleur des boutons d'interaction avec les épisodes (vu, à regarder, etc.)
 * @module serieEpisodeButtonController
 */

import UserFetcher from '../../Model/userFetcher.js';
const userFetcherInstance = new UserFetcher();

/**
 * Initialise les écouteurs sur les boutons des épisodes.
 * Détecte les clics sur les boutons "vu" et applique les actions associées.
 */
export function initEpisodeButtonListeners() {
  document.addEventListener("click", async function (event) {
    const seenButton = event.target.closest(".Btn-Episode-Deja-Vu");
    if (seenButton) {
      await handleMarkEpisodeAsSeen(seenButton);
      updateButtonState(seenButton);
    }

    // Exemple pour d'autres boutons :
    // const favoriteButton = event.target.closest(".Btn-Ajouter-Episode-Favori");
  });
}

/**
 * Marque ou démarque un épisode comme vu, selon son état actuel.
 * @param {HTMLElement} button - Le bouton cliqué correspondant à l'épisode.
 */
async function handleMarkEpisodeAsSeen(button) {
  const params = new URLSearchParams(window.location.search);
  const serieId = params.get("id");
  const episodeId = button.getAttribute("data-episode");
  const seasonId = button.getAttribute("data-saison");

  console.log("→ Ajout Vu :", { serieId, seasonId, episodeId });

  try {
    const allLists = await userFetcherInstance.getAllUserLists();
    const seenList = allLists.find((list) => list.nomliste === "Vu");

    if (!seenList) {
      alert("Liste 'Vu' introuvable.");
      return;
    }

    let result;
    const visionState = button.getAttribute("visionner");

    if (visionState === "Oui") {
      console.log("→ Retrait de la liste 'Vu'");
      result = await userFetcherInstance.deleteSerieOnList(
        serieId,
        seenList.idliste,
        seasonId,
        episodeId
      );
      if (result) button.setAttribute("visionner", "Non");
    } else {
      console.log("→ Ajout à la liste 'Vu'");
      result = await userFetcherInstance.setNewEpisodeOnSerie(
        serieId,
        seenList.idliste,
        seasonId,
        episodeId
      );
      if (result) button.setAttribute("visionner", "Oui");
    }

    if (!result) {
      console.error("❌ Échec de l'opération sur l'épisode.");
    }

  } catch (error) {
    console.error("❌ Erreur lors du traitement :", error);
  }
}

/**
 * Met à jour visuellement l'état du bouton selon la propriété `visionner`.
 * @param {HTMLElement} button - Le bouton à mettre à jour.
 */
function updateButtonState(button) {
  const isSeen = button.getAttribute("visionner") === "Oui";
  const img = button.querySelector(".Btn-Episode-Deja-Vu-Img");
  img.src = isSeen
    ? "./img/Serie/EpisodeVu.png"
    : "./img/Serie/EpisodePasEncoreVu.png";
}
