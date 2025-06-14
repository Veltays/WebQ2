import Notification from '../../Model/notification.js';

let notificationButton = document.getElementById("BoutonNotification");
let notificationPanel = document.getElementById("AllNotification");

/**
 * Affiche ou masque le panneau des notifications avec animation.
 * Gère l'état d'ouverture/fermeture du panneau.
 */
function toggleNotificationPanel() {
    const isHidden = getComputedStyle(notificationPanel).display === "none";

    if (isHidden) {
        console.log("Notification affichée");
        notificationPanel.style.display = "block";
        notificationPanel.classList.add("AnimationNotification");
        notificationPanel.classList.remove("AnimationNotificationDisparition");
    } else {
        console.log("Notification masquée");
        notificationPanel.classList.remove("AnimationNotification");
        notificationPanel.classList.add("AnimationNotificationDisparition");
        setTimeout(() => {
            notificationPanel.style.display = "none";
        }, 500);
    }
}

/**
 * Écouteur global pour fermer le panneau de notifications
 * si l'utilisateur clique en dehors de celui-ci.
 */
document.addEventListener("click", function (event) {
    const isClickInside = notificationPanel.contains(event.target) || notificationButton.contains(event.target);

    if (!isClickInside && getComputedStyle(notificationPanel).display !== "none") {
        notificationPanel.classList.remove("AnimationNotification");
        notificationPanel.classList.add("AnimationNotificationDisparition");
        setTimeout(() => {
            notificationPanel.style.display = "none";
        }, 500);
    }
});

/**
 * Met à jour le compteur de notifications visibles dans l'interface utilisateur.
 * Récupère les notifications depuis le localStorage.
 */
function updateNotificationCount() {
    Notification.loadFromStorage();
    const count = Notification.count();
    const countElement = document.querySelector(".NotifCount");

    if (countElement) {
        countElement.textContent = count > 0 ? count : '';
        countElement.style.display = count > 0 ? 'block' : 'none';
    }
}

export { toggleNotificationPanel, updateNotificationCount };
