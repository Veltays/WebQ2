import types from "./type.js";
import UserFetcher from '../../Model/userFetcher.js';
import { updateNotificationCount } from './notificationController.js';

const userFetcher = new UserFetcher();

/**
 * Gère l'ajout d'un média (film ou série) à la liste "À Regarder".
 * @param {HTMLElement} button - Le bouton cliqué contenant l'ID du média.
 * @returns {Promise<void>}
 */
async function handleAddToList(button) {
    const id = button.id;
    const allLists = await userFetcher.getAllUserLists();
    const watchList = allLists.find(l => l.nomliste === "A Regarder");

    if (types === "film") {
        return await userFetcher.setNewFilmOnList(id, watchList.idliste);
    }
    if (types === "serie") {
        return await userFetcher.setNewSerieOnList(id, watchList.idliste);
    }
}

/**
 * Bascule l'état "vu" ou "non vu" d'un média.
 * @param {HTMLElement} button - Le bouton cliqué contenant l'ID du média.
 * @returns {Promise<void>}
 */
async function handleToggleSeen(button) {
    const id = button.id;
    const image = button.querySelector(".IMGButnClass");
    const allLists = await userFetcher.getAllUserLists();
    const seenList = allLists.find(l => l.nomliste === "Vu");

    const isSeen = image.getAttribute("Visionner") === "Oui";

    if (isSeen) {
        updateSeenButtonVisualState(image, false);
        if (types === "film") {
            return await userFetcher.deleteFilmOnList(id, seenList.idliste);
        }
        if (types === "serie") {
            return await userFetcher.deleteSerieOnList(id, seenList.idliste, 0, 0);
        }
    } else {
        updateSeenButtonVisualState(image, true);
        if (types === "film") {
            return await userFetcher.setNewFilmOnList(id, seenList.idliste);
        }
        if (types === "serie") {
            return await userFetcher.setNewSerieOnList(id, seenList.idliste);
        }
    }
}

/**
 * Met à jour l'apparence du bouton de visionnage.
 * @param {HTMLImageElement} imageElement - L'image du bouton.
 * @param {boolean} isNowSeen - Vrai si l'élément est maintenant vu.
 */
function updateSeenButtonVisualState(imageElement, isNowSeen) {
    if (isNowSeen) {
        imageElement.src = "./img/Film/BoutonCardVu.png";
        imageElement.alt = "Marquer comme vu";
        imageElement.setAttribute("Visionner", "Oui");
    } else {
        imageElement.src = "./img/Film/BoutonCardPasEncoreVu.png";
        imageElement.alt = "Marquer comme non vu";
        imageElement.setAttribute("Visionner", "Non");
    }
}

export { handleAddToList, handleToggleSeen };
