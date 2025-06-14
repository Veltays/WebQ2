import MediaFetcher from "../../Model/mediaFetcher.js";
import genreMap from "../../Ressources/genreMap.js";
import UserFetcher from "../../Model/userFetcher.js";
import type from "./type.js";
console.log("TYPE chargé :", type);



const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const mediaFetcher = new MediaFetcher(type);
const userFetcher = new UserFetcher();

let MediaVu = [];


/**
 * Initialise le contenu principal des médias selon le type (film ou série).
 * Charge les médias vus, la bannière aléatoire, les tendances, et les sections par genre.
 */
export default async function initMediaContent() {
    await initWatchedMedia();
    await loadBanner();
    await fetchTrending();

    // Genres communs
    await fetchGenreList(16);    // Animation
    await fetchGenreList(9648);  // Mystère
    await fetchGenreList(35);    // Comédie
    await fetchGenreList(10749); // Romance
    await fetchGenreList(18);    // Drame

    if (type === 'film') {
        await fetchGenreList(28);    // Action
        await fetchGenreList(12);    // Aventure
        await fetchGenreList(27);    // Horreur
        await fetchGenreList(878);   // Science Fiction
        await fetchGenreList(10752); // Guerre
    } else {
        await fetchGenreList(10762); // Kids
        await fetchGenreList(10763); // News
        await fetchGenreList(10764); // Reality
        await fetchGenreList(10765); // Sci-Fi & Fantasy
        await fetchGenreList(10766); // Soap
        await fetchGenreList(10767); // Talk
    }
}

/**
 * Récupère les médias tendances et les affiche dans une section dédiée.
 */
async function fetchTrending() {
    try {
        const data = await mediaFetcher.fetchTrending();
        if (!data) return console.error("Aucun film/série tendance trouvé.");

        createSection(0);
        const section = document.getElementById('Liste' + genreMap[0]);
        data.forEach(media => placeMedia(section, media));
        addEventDelegation(section);
    } catch (error) {
        console.error("Erreur récupération des tendances :", error);
    }
}

/**
 * Initialise la liste des médias déjà vus de l'utilisateur connecté.
 */
async function initWatchedMedia() {
    try {
        const allUserLists = await userFetcher.getAllUserLists();
        const watchedList = allUserLists.find(list => list.nomliste === "Vu");

        if (watchedList) {
            MediaVu = type === 'film'
                ? await userFetcher.getAllFilmFromList(watchedList.idliste)
                : await userFetcher.getAllSerieFromList(watchedList.idliste);
        }
    } catch (e) {
        console.error("Erreur initWatchedMedia :", e);
    }
}

/**
 * Vérifie si un média donné est déjà marqué comme vu.
 * @param {Object} media - Le média à vérifier.
 * @returns {Promise<boolean>} - True si déjà vu, false sinon.
 */
async function isMediaWatched(media) {
    try {
        return type === 'film'
            ? MediaVu.some(f => f.idfilm === media.id)
            : MediaVu.some(s => s.idserie === media.id);
    } catch (error) {
        console.error("Erreur vérification film vu :", error);
        return false;
    }
}

/**
 * Récupère les médias d'un genre spécifique et les affiche.
 * @param {number} genre - ID du genre TMDB.
 */
async function fetchGenreList(genre) {
    try {
        const data = await mediaFetcher.fetchByGenre(genre);
        if (!data) return;

        createSection(genre);
        const section = document.getElementById('Liste' + genreMap[genre]);
        if (section) {
            data.forEach(film => placeMedia(section, film));
            addEventDelegation(section);
        }
    } catch (error) {
        console.error(`Erreur récupération genre ${genre} :`, error);
    }
}

/**
 * Crée dynamiquement une section HTML pour un genre donné.
 * @param {number} genreId - ID du genre TMDB.
 */
function createSection(genreId) {
    const section = document.createElement('section');
    const className = 'Film' + genreMap[genreId].replace(/\s/, '-');
    section.classList.add(className);

    const title = document.createElement('h2');
    title.innerText = genreMap[genreId];
    title.classList.add('TitreListe');

    const divList = document.createElement('div');
    divList.classList.add('ListeDeFilm');
    divList.id = 'Liste' + genreMap[genreId];

    section.appendChild(title);
    section.appendChild(divList);
    document.querySelector('main').appendChild(section);

    enableHorizontalScroll(section);
}

/**
 * Crée une carte pour un média et l'ajoute à la section spécifiée.
 * @param {HTMLElement} targetDiv - L'élément DOM où insérer la carte.
 * @param {Object} filmMeta - Métadonnées du film.
 */
async function placeMedia(targetDiv, filmMeta) {
    try {
        const data = await mediaFetcher.fetchById(filmMeta.id);
        if (!data.poster_path) return;

        const card = document.createElement('div');
        card.classList.add('FilmCard');

        const link = document.createElement('a');
        link.href = `${type}.html?id=${data.id}`;

        const img = document.createElement('img');
        img.src = IMAGE_BASE_URL + data.poster_path;
        img.alt = data.title;
        link.appendChild(img);
        card.appendChild(link);

        const btnContainer = document.createElement('div');
        btnContainer.classList.add('CardBtn');

        const isWatched = await isMediaWatched(data);

        const btnSeen = document.createElement('button');
        btnSeen.classList.add('CardBtnVu');
        btnSeen.id = `${data.id}`;

        const imgSeen = document.createElement('img');
        imgSeen.classList.add('IMGButnClass');
        imgSeen.src = isWatched ? './img/Film/BoutonCardVu.png' : './img/Film/BoutonCardPasEncoreVu.png';
        imgSeen.alt = isWatched ? 'Marquer comme vu' : 'Marquer comme Non vu';
        imgSeen.setAttribute("Visionner", isWatched ? "Oui" : "Non");
        btnSeen.appendChild(imgSeen);

        const btnAdd = document.createElement('button');
        btnAdd.classList.add('CardBtnAjouter');
        btnAdd.id = `${data.id}`;

        const imgAdd = document.createElement('img');
        imgAdd.src = './img/Film/BoutonCardAjouter.png';
        imgAdd.alt = 'Ajouter à la liste';
        btnAdd.appendChild(imgAdd);

        btnContainer.appendChild(btnAdd);
        btnContainer.appendChild(btnSeen);
        card.appendChild(btnContainer);
        targetDiv.appendChild(card);
    } catch (error) {
        console.error("Erreur affichage film :", error);
    }
}

/**
 * Charge une bannière aléatoire à partir des médias tendance.
 */
async function loadBanner() {
    try {
        const data = await mediaFetcher.fetchTrending();
        if (!data || data.length === 0) return;

        const randomMedia = data[Math.floor(Math.random() * data.length)];

        const banner = document.querySelector('.FondPresentation');
        const title = document.querySelector('.TitreFilmSuggestion');
        const description = document.querySelector('.DescriptionFilmSuggestion');
        const link = document.querySelector('.LienProposition');

        banner.src = IMAGE_BASE_URL + randomMedia.backdrop_path;
        title.innerText = type === 'film' ? randomMedia.title : randomMedia.name;
        link.href = `${type}.html?id=${randomMedia.id}`;

        let text = randomMedia.overview || "Pas de description.";
        if (text.length > 350) text = text.substring(0, 350) + '...';
        description.innerText = text;
    } catch (error) {
        console.error("Erreur bannière :", error);
    }
}

/**
 * Ajoute la délégation d'événements pour les boutons d'une section.
 * @param {HTMLElement} section - La section contenant les boutons.
 */
function addEventDelegation(section) {
    section.addEventListener("click", (event) => {
        const btnAdd = event.target.closest(".CardBtnAjouter");
        const btnSeen = event.target.closest(".CardBtnVu");

        if (btnAdd) {
            const id = btnAdd.id;
        }

        if (btnSeen) {
            const id = btnSeen.id;
        }
    });
}

/**
 * Active le scroll horizontal à la molette sur une section.
 * @param {HTMLElement} section - La section contenant la liste à scroller.
 */
function enableHorizontalScroll(section) {
    const list = section.querySelector(".ListeDeFilm");
    if (!list) return;

    const scrollAmount = 400;
    list.addEventListener("wheel", (event) => {
        event.preventDefault();
        list.scrollLeft += event.deltaY > 0 ? scrollAmount : -scrollAmount;
    }, { passive: false });
}
