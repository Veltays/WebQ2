import type from "./type.js";
import MediaFetcher from '../../Model/mediaFetcher.js';

/**
 * Initialise la logique de la barre de recherche : ouverture UI, écoute de l'entrée,
 * gestion du focus et affichage des résultats.
 */
export default function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchBar = document.getElementById("BarreSousSearch");
    const resultListContainer = document.getElementById("search-results");

    let hasClicked = false;

    document.getElementById("search-button")?.addEventListener("click", () => {
        hasClicked = true;
        showSearchUI();
        searchInput.focus();
    });

    searchInput?.addEventListener("focusout", () => {
        setTimeout(() => {
            hideSearchUI();
        }, 100);
    });

    document.addEventListener("click", (event) => {
        if (!hasClicked) return;

        const isClickInsideSearch =
            searchInput.contains(event.target) ||
            document.getElementById("search-button").contains(event.target);

        if (!isClickInsideSearch) {
            hideSearchUI();
        }
    });

    searchInput.addEventListener("input", async (event) => {
        const query = event.target.value.trim();

        if (query !== "") {
            showResultList();
            resultListContainer.querySelector(".result-list").innerHTML = "";
            await processSearch(query);
        }
    });

    /**
     * Affiche les éléments visuels de la barre de recherche.
     */
    function showSearchUI() {
        searchInput.style.display = "block";
        searchInput.classList.remove("SearchBarRowDisparition");
        searchInput.classList.add("SearchBarRow");

        searchBar.style.display = "block";
        searchBar.classList.remove("SearchBarRowDisparition");
        searchBar.classList.add("SearchBarRow");

        searchBar.value = "";
    }

    /**
     * Masque les éléments visuels de la barre de recherche.
     */
    function hideSearchUI() {
        searchBar.classList.remove("SearchBarRow");
        searchBar.classList.add("SearchBarRowDisparition");

        searchInput.classList.remove("SearchBarRow");
        searchInput.classList.add("SearchBarRowDisparition");

        resultListContainer.classList.remove("SearchBarRow");
        resultListContainer.classList.add("SearchBarRowDisparition");

        searchInput.style.display = "block";
        searchBar.style.display = "block";
    }

    /**
     * Affiche la liste des résultats dans l'UI.
     */
    function showResultList() {
        resultListContainer.style.display = "block";
        resultListContainer.classList.remove("SearchBarRowDisparition");
        resultListContainer.classList.add("SearchBarRow");
    }
}

/**
 * Effectue une recherche d’un média selon le mot-clé fourni.
 * @param {string} query - La chaîne de recherche saisie par l'utilisateur.
 */
async function processSearch(query) {
    if (!query || query.trim() === "") {
        console.warn("La requête de recherche est vide ou nulle.");
        return;
    }

    const search = query.replace(/ /g, "+");
    const fetcher = new MediaFetcher(type);

    try {
        const results = await fetcher.fetchWithQuery(search);
        results.forEach(result => displaySearchResults(result));
    } catch (err) {
        console.error("Erreur de recherche :", err);
    }
}

/**
 * Affiche un résultat de recherche dans la liste de résultats.
 * @param {Object} result - Un objet représentant un film ou une série.
 */
function displaySearchResults(result) {
    if (!result.poster_path || result.poster_path === "null") return;

    const list = document.querySelector(".result-list");

    const li = document.createElement("li");
    li.className = "search-resultIl";

    const link = document.createElement("a");
    link.href = `${type}.html?id=${result.id}`;
    link.className = "result-link";

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
    img.alt = (result.title || result.name) + " poster";
    img.className = "result-image";

    const info = document.createElement("div");
    info.className = "result-info";

    const title = document.createElement("h3");
    title.className = "result-title";
    title.textContent = result.title || result.name || "Titre inconnu";

    const date = document.createElement("p");
    date.className = "result-date";
    date.textContent = type === "film"
        ? result.release_date
        : result.first_air_date || "Date inconnue";

    const desc = document.createElement("p");
    desc.className = "result-description";
    desc.textContent = (result.overview || "").substring(0, 150) + "...";

    info.append(title, date, desc);
    link.append(img, info);
    li.append(link);
    list.appendChild(li);
}
