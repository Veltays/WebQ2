import { handleAddToList, handleToggleSeen } from './cardButtonActions.js';
import { updateNotificationCount, toggleNotificationPanel } from './notificationController.js';
import { isUserConnected, initUserHeader } from './headerUserInfo.js';
import initSearch from './searchController.js';
import initMediaContent from './homeMediaRenderer.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initialisation de l'application...");

    await isUserConnected();

    showLoadingScreen();

    await initMediaContent();
    await initUserHeader();
    initSearch();
    updateNotificationCount();

    hideLoadingScreen();

    // Gère les clics sur les boutons "Ajouter" ou "Vu"
    document.addEventListener("click", async (event) => {
        const addBtn = event.target.closest(".CardBtnAjouter");
        if (addBtn) {
            await handleAddToList(addBtn);
            updateNotificationCount();
            return;
        }

        const seenBtn = event.target.closest(".CardBtnVu");
        if (seenBtn) {
            await handleToggleSeen(seenBtn);
            updateNotificationCount();
            return;
        }
    });

    // Affiche ou masque le panneau de notifications
    document.getElementById("BoutonNotification")?.addEventListener("click", toggleNotificationPanel);
});

/**
 * Affiche l'écran de chargement et masque le contenu principal.
 */
function showLoadingScreen() {
    const loader = document.getElementById("loader");
    const mainContent = document.querySelector(".Element");

    if (loader && mainContent) {
        loader.style.display = "block";
        mainContent.style.display = "none";
    }

    document.body.classList.add("no-scroll");
}

/**
 * Masque l'écran de chargement et affiche le contenu principal.
 */
function hideLoadingScreen() {
    const loader = document.getElementById("loader");
    const mainContent = document.querySelector(".Element");

    if (loader && mainContent) {
        mainContent.style.display = "block";
        loader.style.display = "none";
    }

    document.body.classList.remove("no-scroll");
}
