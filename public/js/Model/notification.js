import { updateNotificationCount } from "../Controller/Main/notificationController.js";
import UserFetcher from "./userFetcher.js";

/**
 * Classe représentant une notification utilisateur affichée dans l’interface.
 */
class Notification {
    static Type = {
        INFO: "info",
        WARNING: "warning",
        ERROR: "error",
        SUCCESS: "success",
    };

    static iconPathByType = {
        [Notification.Type.INFO]: "./img/Film/LogoInfo.png",
        [Notification.Type.WARNING]: "./img/Film/WarningNotig.png",
        [Notification.Type.ERROR]: "./img/Film/ErrorNotif.png",
        [Notification.Type.SUCCESS]: "./img/Film/SuccesNotif.png",
    };

    /**
     * @param {string} titre - Le titre de la notification.
     * @param {string} message - Le message de la notification.
     * @param {"info" | "warning" | "error" | "success"} type - Le type de notification.
     */
    constructor(titre, message, type) {
        this.titre = titre;
        this.message = message;
        this.type = type;
        this.timestamp = Date.now();
    }

    /**
     * Crée un élément DOM représentant la notification.
     * @returns {HTMLLIElement} Élément <li> contenant la notification.
     */
    createElement() {
        const li = document.createElement("li");
        li.className = `${this.type}Notification`;

        const iconDiv = document.createElement("div");
        iconDiv.className = "NotificationIcon";

        const icon = document.createElement("img");
        icon.src = Notification.iconPathByType[this.type];
        icon.className = "LogoNotification";
        icon.alt = `${this.type}Icon`;

        iconDiv.appendChild(icon);

        const textDiv = document.createElement("div");
        textDiv.className = "TexteNotification";

        const h2 = document.createElement("h2");
        h2.className = "TexteNotificationH2";
        h2.innerText = this.titre;

        const p = document.createElement("p");
        p.className = "TexteNotificationP";
        p.innerText = this.message;

        textDiv.append(h2, p);
        li.append(iconDiv, textDiv);

        return li;
    }

    /**
     * Affiche la notification dans le conteneur désigné.
     * @param {string} [containerSelector=".NotificationList"] - Sélecteur du conteneur DOM.
     */
    show(containerSelector = ".NotificationList") {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container ${containerSelector} not found.`);
            return;
        }

        const notifElement = this.createElement();
        container.prepend(notifElement);
        Notification.store(this);
    }

    /**
     * Stocke une notification dans le localStorage.
     * @param {Notification} notification - L’objet notification à stocker.
     */
    static async store(notification) {
        const current = JSON.parse(localStorage.getItem("notifications") || "[]");
        current.unshift({
            titre: notification.titre,
            message: notification.message,
            type: notification.type,
            timestamp: notification.timestamp,
        });
        localStorage.setItem("notifications", JSON.stringify(current));
    }

    /**
     * Récupère toutes les notifications stockées.
     * @returns {Array<Object>} - Liste des notifications.
     */
    static getAll() {
        return JSON.parse(localStorage.getItem("notifications") || "[]");
    }

    /**
     * Supprime toutes les notifications stockées.
     */
    static clearAll() {
        localStorage.removeItem("notifications");
        updateNotificationCount();
    }

    /**
     * Retourne le nombre de notifications stockées.
     * @returns {number}
     */
    static count() {
        return Notification.getAll().length;
    }

    /**
     * Recharge toutes les notifications depuis le stockage local et les affiche dans le conteneur.
     */
    static loadFromStorage() {
        const notifications = Notification.getAll();
        const container = document.querySelector(".NotificationList");
        if (!container) return;

        container.innerHTML = "";

        // Bouton "Delete All"
        const deleteBtn = document.createElement("li");
        deleteBtn.className = "DeleteAllBtn";
        deleteBtn.innerHTML = `
            <div class="FontDeleteAll">
                <button class="DeleteAllBtn">
                    <h1 class="TexteDeleteAll"> Delete ALL</h1>
                    <img src="./img/notification/Delete.png" alt="Bouton de suppression" class="DeleteAllBtnImg" />
                </button>
            </div>
        `;
        deleteBtn.addEventListener("click", () => {
            Notification.clearAll();
            Notification.loadFromStorage();
            updateNotificationCount();
        });

        // Ajout des notifications dans le conteneur
        notifications.forEach(data => {
            const notification = new Notification(data.titre, data.message, data.type);
            const notifElement = notification.createElement();
            container.prepend(notifElement);
        });

        container.prepend(deleteBtn);
    }
}

export default Notification;
