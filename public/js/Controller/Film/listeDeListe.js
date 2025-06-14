import UserManager from '../../Model/userFetcher.js';

const userManager = new UserManager();

/**
 * Gère l'ouverture et la fermeture du menu des listes utilisateur.
 * @param {string} toggleId - ID de l'élément qui déclenche l'ouverture.
 * @param {string} menuId - ID du menu à afficher/cacher.
 */
export function listeDeListe(toggleId = "toggleMenu", menuId = "listeMenu") {
    const toggleButton = document.getElementById(toggleId);
    const menu = document.getElementById(menuId);

    if (!toggleButton || !menu) {
        console.warn(`Éléments avec ID ${toggleId} ou ${menuId} non trouvés.`);
        return;
    }

    toggleButton.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });

    document.addEventListener("click", function (e) {
        if (!toggleButton.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add("hidden");
        }
    });
}

/**
 * Charge toutes les listes de l'utilisateur depuis le back-end.
 * @returns {Promise<void>}
 */
export async function chargerToutesLesListes() {
    try {
        const allLists = await userManager.getAllUserLists();
        console.log("Toutes les listes utilisateur :", allLists);
    } catch (error) {
        console.error("Erreur lors du chargement des listes utilisateur :", error);
    }
}

/**
 * Affiche les listes utilisateur dans le menu et gère l'ajout de films à une liste.
 * @param {string} menuId - ID du menu où les listes seront affichées.
 */
export async function afficherListesDansMenu(menuId = "listeMenu") {
    try {
        const menu = document.getElementById(menuId);
        if (!menu) {
            console.warn(`Menu avec ID ${menuId} non trouvé.`);
            return;
        }

        const allLists = await userManager.getAllUserLists();

        let ul = menu.querySelector("ul");
        if (!ul) {
            ul = document.createElement("ul");
            menu.appendChild(ul);
        }
        ul.innerHTML = "";

        allLists.forEach(liste => {
            const li = document.createElement("li");
            li.classList.add("liste-item");

            const nomSpan = document.createElement("span");
            nomSpan.textContent = liste.nomliste;

            const plusSpan = document.createElement("span");
            plusSpan.classList.add("plus-icon");
            plusSpan.textContent = "+";

            li.append(nomSpan, plusSpan);

            li.addEventListener("click", () => {
                console.log(`Liste sélectionnée : ${liste.nomliste}`);
                const params = new URLSearchParams(window.location.search);
                const filmId = params.get("id");
                userManager.setNewFilmOnList(filmId, liste.idliste);
            });

            ul.appendChild(li);
        });

    } catch (error) {
        console.error("Erreur lors de l'affichage des listes dans le menu :", error);
    }
}

/**
 * Variante pour l’ajout d’une série à une liste utilisateur.
 * @param {string} menuId - ID du menu où les listes seront affichées.
 */
export async function afficherListesDansMenuSerie(menuId = "listeMenu") {
    try {
        const menu = document.getElementById(menuId);
        if (!menu) {
            console.warn(`Menu avec ID ${menuId} non trouvé.`);
            return;
        }

        const allLists = await userManager.getAllUserLists();

        let ul = menu.querySelector("ul");
        if (!ul) {
            ul = document.createElement("ul");
            menu.appendChild(ul);
        }
        ul.innerHTML = "";

        allLists.forEach(liste => {
            const li = document.createElement("li");
            li.classList.add("liste-item");

            const nomSpan = document.createElement("span");
            nomSpan.textContent = liste.nomliste;

            const plusSpan = document.createElement("span");
            plusSpan.classList.add("plus-icon");
            plusSpan.textContent = "+";

            li.append(nomSpan, plusSpan);

            li.addEventListener("click", () => {
                console.log(`Liste sélectionnée : ${liste.nomliste}`);
                const params = new URLSearchParams(window.location.search);
                const serieId = params.get("id");
                userManager.setNewSerieOnList(serieId, liste.idliste);
            });

            ul.appendChild(li);
        });

    } catch (error) {
        console.error("Erreur lors de l'affichage des listes dans le menu :", error);
    }
}
