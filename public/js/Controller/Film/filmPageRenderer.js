import MediaFetcher from '../../Model/mediaFetcher.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const mediaFetcher = new MediaFetcher();

/**
 * Initialise la page d’un film en récupérant ses détails, crédits, images et bande-annonce.
 * @param {string} filmId - L'identifiant du film à charger.
 */
export default function initFilmPage(filmId) {
    if (!filmId) {
        console.error("Aucun ID de film fourni.");
        return;
    }

    recupererDetailFilm(filmId);
    recupererCreditFilm(filmId);
    recupererImageFilm(filmId);
    recupererBandeAnnonceFilm(filmId);
}

// ======================
// Informations principales
// ======================

/**
 * Récupère les détails du film via l’API et les injecte dans la page.
 * @param {string} id - Identifiant du film.
 */
async function recupererDetailFilm(id) {
    try {
        const film = await mediaFetcher.fetchById(id);

        document.querySelector(".LienFilm").href = film.homepage;
        document.getElementById("SynopsisText").textContent = film.overview;

        ajouterTexte("InfoAnnee", film.release_date);
        ajouterTexte("InfoStudio", film.production_companies[0]?.name || "Inconnu");
        ajouterTexte("InfoBudget", `${film.budget.toLocaleString()} $`);

        const genreList = document.getElementById("GenreWeb");
        const genreText = film.genres.map(g => g.name).join(', ');
        ajouterTexteElement(genreList, genreText);

    } catch (error) {
        console.error("Erreur récupération détails film :", error);
    }
}

// ======================
// Affichage des images
// ======================

/**
 * Récupère les images du film et les affiche sur la page.
 * @param {string} id - Identifiant du film.
 */
async function recupererImageFilm(id) {
    try {
        const filmImage = await mediaFetcher.fetchImages(id);

        const filteredLogos = filmImage.logos.filter(logo => logo.iso_639_1 === "en");
        const logo = filteredLogos.length > 0 ? filteredLogos[0] : filmImage.logos[0];

        document.getElementById("BannerFilm").src = IMAGE_BASE_URL + filmImage.backdrops[0].file_path;
        document.getElementById("LogoFilm").src = IMAGE_BASE_URL + logo.file_path;

        const imagesContainer = document.querySelector(".ImageFilms");
        for (let i = 0; i < Math.min(12, filmImage.backdrops.length); i++) {
            const img = document.createElement("img");
            img.classList.add("ImageFilm");
            img.src = IMAGE_BASE_URL + filmImage.backdrops[i].file_path;
            img.alt = "Image du film";
            imagesContainer.appendChild(img);
        }

    } catch (error) {
        console.error("Erreur récupération images film :", error);
    }
}

// ======================
// Crédits (réalisateur + acteurs)
// ======================

/**
 * Récupère les crédits du film (réalisateur + acteurs principaux) et les affiche.
 * @param {string} id - Identifiant du film.
 */
async function recupererCreditFilm(id) {
    try {
        const data = await mediaFetcher.fetchCredits(id);
        const director = data.crew.find(p => p.job === "Director");

        if (director) {
            ajouterTexte("InfoCreateur", director.name);
        }

        const cast = data.cast.slice(0, 6);
        const listeActeurs = document.querySelector(".ListeActeur");

        cast.forEach(acteur => {
            if (!acteur.profile_path) return;

            const li = document.createElement("li");
            li.classList.add("Acteur");

            const img = document.createElement("img");
            img.classList.add("ActeurImg");
            img.src = IMAGE_BASE_URL + acteur.profile_path;
            img.alt = "Acteur du film";

            const info = document.createElement("div");
            info.classList.add("InfoActeur");

            const nom = document.createElement("h3");
            nom.classList.add("ActeurNom");
            nom.textContent = acteur.name;

            const role = document.createElement("h4");
            role.classList.add("ActeurRole");
            role.textContent = acteur.character;

            info.append(nom, role);
            li.append(img, info);
            listeActeurs.appendChild(li);
        });

    } catch (error) {
        console.error("Erreur récupération crédits film :", error);
    }
}

// ======================
// Bande-annonce (YouTube)
// ======================

let videoPresente = false;

/**
 * Récupère la bande-annonce du film (YouTube) et configure l’affichage sur clic.
 * @param {string} id - Identifiant du film.
 */
async function recupererBandeAnnonceFilm(id) {
    try {
        const data = await mediaFetcher.fetchTrailer(id);
        const bandeAnnonce = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

        if (!bandeAnnonce) {
            console.log("Aucune bande-annonce trouvée.");
            return;
        }

        const bouton = document.querySelector(".YtbButton");
        bouton.addEventListener("click", () => {
            const videoURL = `https://www.youtube.com/embed/${bandeAnnonce.key}`;
            const container = document.getElementById("videoContainer");
            const iframe = document.getElementById("videoPlayer");

            iframe.src = videoURL;
            container.style.display = videoPresente ? 'none' : 'block';
            videoPresente = !videoPresente;
        });

    } catch (error) {
        console.error("Erreur récupération bande-annonce :", error);
    }
}

// ======================
// Utilitaires
// ======================

/**
 * Ajoute un élément <em> contenant du texte à un élément identifié par son ID.
 * @param {string} idElement - ID de l’élément parent.
 * @param {string} texte - Texte à insérer.
 */
function ajouterTexte(idElement, texte) {
    const parent = document.getElementById(idElement);
    const em = document.createElement("em");
    em.classList.add("TextInfoReel");
    em.textContent = texte;
    parent.appendChild(em);
}

/**
 * Ajoute un élément <em> contenant du texte à un élément DOM donné.
 * @param {HTMLElement} parentElement - Élément DOM parent.
 * @param {string} texte - Texte à insérer.
 */
function ajouterTexteElement(parentElement, texte) {
    const em = document.createElement("em");
    em.classList.add("TextInfoReel");
    em.textContent = texte;
    parentElement.appendChild(em);
}
