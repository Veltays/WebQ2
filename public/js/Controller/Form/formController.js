import { renderTendances, getFormData, validateForm } from "./formRenderer.js";
import UserManager from "../../Model/userFetcher.js";
import User from "../../Model/user.js";
import MediaFetcher from "../../Model/mediaFetcher.js";
import Notification from "../../Model/notification.js";

const userManager = new UserManager();
const mediaFetcher = new MediaFetcher();

/**
 * Initialise les contrôleurs du formulaire d'inscription.
 */
export default function initFormController() {
    handleRetourAccueil();
    setupForm();
    handleLoginWithGoogle();
    fetchAndDisplayTendances();
}

/**
 * Récupère et affiche les films ou séries tendances sur la page d'accueil.
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
 * Gère la redirection vers l'authentification Google et affiche une notification.
 */
async function handleLoginWithGoogle() {
    document.getElementById("Button-google")?.addEventListener("click", () => {
        window.location.href = "http://veltays.alwaysdata.net/auth/google";
    });

    const notifSucces = new Notification("Succes", `La création du compte a été effectuée avec succès`, Notification.Type.SUCCESS);
    await Notification.store(notifSucces);
}

/**
 * Ajoute un listener pour revenir à l'accueil.
 */
function handleRetourAccueil() {
    document.querySelector(".boutonRetour")?.addEventListener("click", () => {
        window.location.href = "./index.html";
    });
}

/**
 * Prépare et gère la soumission du formulaire d'inscription.
 */
function setupForm() {
    const button = document.querySelector(".Container-Bouton-SignIn");

    button?.addEventListener("click", async (event) => {
        event.preventDefault();

        const formData = getFormData();
        if (!validateForm(formData)) return;

        const user = new User(...Object.values(formData));
        const result = await userManager.postUserData(user);

        if (result) {
            alert("Utilisateur créé avec succès !");
            const notifSucces = new Notification("Succes", `La création du compte a été effectuée avec succès`, Notification.Type.SUCCESS);
            await Notification.store(notifSucces);
            window.location.href = "./index.html";
        }
    });
}
