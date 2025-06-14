import MediaFetcher from '../../Model/mediaFetcher.js';
import UserManager from '../../Model/userFetcher.js';
import { renderTendances } from './loginRenderer.js';
import Notification from '../../Model/notification.js';

const mediaFetcher = new MediaFetcher();
const userManager = new UserManager();

/**
 * Initialise tous les événements et composants de la page de connexion.
 */
export default function initLoginPage() {
    handleRetourAccueil();
    fetchAndDisplayTendances();
    setupLoginHandler();
    handleLoginWithGoogle();
}

/**
 * Gère le retour vers la page d'accueil via un bouton.
 */
function handleRetourAccueil() {
    document.querySelector(".Button-Return-Home")?.addEventListener("click", () => {
        window.location.href = "./index.html";
    });
}

/**
 * Redirige vers l'authentification Google et enregistre une notification de succès.
 */
async function handleLoginWithGoogle() {
    document.getElementById('google-login')?.addEventListener('click', () => {
        window.location.href = 'http://veltays.alwaysdata.net/auth/google';
    });

    const notif = new Notification(
        "Succès",
        "La connexion au compte a été effectuée avec succès",
        Notification.Type.SUCCESS
    );
    await Notification.store(notif);
}

/**
 * Récupère les tendances depuis l'API et les affiche dans le DOM.
 */
async function fetchAndDisplayTendances() {
    try {
        const tendances = await mediaFetcher.fetchTrending();
        renderTendances(tendances);
    } catch (error) {
        console.error("Erreur lors de la récupération des tendances :", error);
    }
}

/**
 * Gère la connexion via le formulaire login (email + mot de passe).
 */
function setupLoginHandler() {
    document.querySelector(".Container-Bouton-SignIn")?.addEventListener("click", async () => {
        const identifiant = document.getElementById("Email").value;
        const motDePasse = document.getElementById("Password").value;

        const user = { identifiant, motDePasse };
        const result = await userManager.checkUserData(user);

        if (result) {
            const notif = new Notification(
                "Succès",
                `La connexion au compte ${user.identifiant} a été effectuée avec succès`,
                Notification.Type.SUCCESS
            );
            await Notification.store(notif);
            window.location.href = "./index.html";
        } else {
            alert("Identifiants invalides");
        }
    });
}
