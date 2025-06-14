/**
 * Contrôleur principal de la page série.
 * Gère l'affichage des informations de la série, les saisons, les épisodes,
 * la bande-annonce, les images, les boutons d'interaction et le scroll des épisodes.
 * @module seriePageRenderer
 */

import UserFetcher from '../../Model/userFetcher.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const PORT_URL = `https://veltays.alwaysdata.net/api/serie/`;
const userFetcherInstance = new UserFetcher();


const ListEpisodeDejaVu = [];

/**
 * Initialise tous les éléments de la page série.
 * @param {string} id - Identifiant de la série.
 */
export default async function initSeriePage(id) {
  fetchSerieDetails(id);
  fetchSerieCredits(id);
  fetchSerieImages(id);
  
  
  await InitEpisodeDejaVu(id);


  fetchSerieEpisodes(id);
  fetchSerieTrailer(id);
  setupEpisodeScroll();
}

/**
 * Récupère et affiche les images (bannière, logo) de la série.
 * @param {string} id
 */
async function fetchSerieImages(id) {
  try {
    const res = await fetch(`${PORT_URL}${id}/images`);
    const serieImage = await res.json();

    const logos = serieImage.logos.filter(logo => logo.iso_639_1 === "en" || logo.iso_639_1 === "fr");
    document.getElementById("BannerSerie").src = IMAGE_BASE_URL + serieImage.backdrops[0].file_path;
    document.getElementById("LogoSerie").src = IMAGE_BASE_URL + (logos[0]?.file_path || serieImage.logos[0]?.file_path || "");
  } catch (err) {
    console.error("Erreur images :", err);
  }
}

/**
 * Récupère et affiche les détails de la série.
 * @param {string} id
 */
async function fetchSerieDetails(id) {
  try {
    const res = await fetch(`${PORT_URL}${id}`);
    const serie = await res.json();

    document.querySelector(".LienSerie").href = serie.homepage;
    document.getElementById("SynopsisText").innerText = serie.overview;
    document.getElementById("InfoCreateur").innerHTML += `<em class="TextInfoReel">${serie.created_by.map(d => d.name).join(", ") || "Aucun"}</em>`;
    document.getElementById("InfoAnnee").innerHTML += `<em class="TextInfoReel">${serie.first_air_date}</em>`;
    document.getElementById("InfoStudio").innerHTML += `<em class="TextInfoReel">${serie.production_companies[0]?.name || "Inconnu"}</em>`;
    document.getElementById("InfoBudget").innerHTML += `<em class="TextInfoReel">${serie.budget || 0} $</em>`;

    const genres = serie.genres.map(g => g.name).join(", ");
    document.getElementById("GenreWeb").innerHTML = `<em class="TextInfoReel">${genres}</em>`;
  } catch (err) {
    console.error("Erreur détails :", err);
  }
}

/**
 * Récupère et affiche les acteurs principaux de la série.
 * @param {string} id
 */
async function fetchSerieCredits(id) {
  try {
    const res = await fetch(`${PORT_URL}${id}/cast`);
    const data = await res.json();
    const liste = document.querySelector(".ListeActeur");

    data.cast.slice(0, 6).forEach(acteur => {
      if (!acteur.profile_path) return;

      const li = document.createElement("li");
      li.className = "Acteur";
      li.innerHTML = `
        <img class="ActeurImg" src="${IMAGE_BASE_URL + acteur.profile_path}" alt="Acteur">
        <div class="InfoActeur">
          <h3 class="ActeurNom">${acteur.name}</h3>
          <h4 class="ActeurRole">${acteur.character}</h4>
        </div>`;
      liste.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur casting :", err);
  }
}

let videoPresente = false;
/**
 * Récupère et configure le bouton d'affichage de la bande-annonce YouTube.
 * @param {string} id
 */
async function fetchSerieTrailer(id) {
  try {
    const res = await fetch(`${PORT_URL}trailer/${id}`);
    const data = await res.json();

    const bandeAnnonce = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
    if (!bandeAnnonce) return;

    const btn = document.querySelector(".YtbButton");
    btn.addEventListener("click", () => {
      const container = document.getElementById("videoContainer");
      const iframe = document.getElementById("videoPlayer");
      iframe.src = `https://www.youtube.com/embed/${bandeAnnonce.key}`;
      container.style.display = videoPresente ? 'none' : 'block';
      videoPresente = !videoPresente;
    });
  } catch (err) {
    console.error("Erreur trailer :", err);
  }
}

/**
 * Récupère les saisons disponibles et déclenche le changement de saison.
 * @param {string} id
 */
async function fetchSerieEpisodes(id) {
  try {
    const res = await fetch(`${PORT_URL}NbSeason/${id}`);
    const data = await res.json();
    const select = document.getElementById("ChoixSaison");

    for (let i = 1; i <= data.number_of_seasons; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = `Saison ${i}`;
      select.appendChild(option);
    }

    select.dispatchEvent(new Event("change"));
  } catch (err) {
    console.error("Erreur saisons :", err);
  }
}

/**
 * Récupère et affiche les épisodes de la saison sélectionnée.
 */
document.getElementById("ChoixSaison")?.addEventListener("change", async (e) => {
  const id = new URLSearchParams(window.location.search).get("id");
  const saison = e.target.value;
  const episodeList = document.querySelector(".ListeEpisode");

  try {
    const res = await fetch(`${PORT_URL}getAllSeason/${saison}/${id}`);
    const data = await res.json();
    episodeList.innerHTML = "";



    console.log("Tout les episode Vu :", ListEpisodeDejaVu);


    data.episodes.forEach((episode, i) => {
      const li = document.createElement("li");
      li.className = "EpisodeX";

      console.log(`${episode.season_number}-${episode.episode_number}`);

      const key = `${episode.season_number}-${episode.episode_number}`;
      const vu = ListEpisodeDejaVu.includes(key) ? "Oui" : "Non";

      console.log(`Episode ${i + 1} de la saison ${episode.season_number} déjà vu : ${vu}`);

      li.innerHTML = `
        <div class="ImgAndTxt">
          <img class="EpisodeImg" src="${IMAGE_BASE_URL}/${episode.still_path}" alt="Episode">
          <div class="EpisodeTexte">
            <h2 class="TitreEpisode">${i + 1} - ${episode.name}</h2>
            <p class="TexteEpisode">${episode.overview}</p>
          </div>
        </div>
        <div class="EpisodeBtn">
          <button class="Btn-Ajouter-Episode-Liste" data-saison="${episode.season_number}" data-episode="${i + 1}">
            <img class="Btn-Ajouter-Episode-Liste-Img" src="./img/Serie/AjouterListe.png" alt="Ajouter à ma liste">
          </button>
          <button class="Btn-Ajouter-Episode-Favori" data-saison="${episode.season_number}" data-episode="${i + 1}">
            <img class="Btn-Ajouter-Episode-Favori-Img" src="./img/Serie/Favori.png" alt="Favori">
          </button>
          <button class="Btn-Episode-Deja-Vu" data-saison="${episode.season_number}" data-episode="${i + 1}" visionner="${vu}">
            <img class="Btn-Episode-Deja-Vu-Img" src="${vu === "Oui" ? './img/Serie/EpisodeVu.png' : './img/Serie/EpisodePasEncoreVu.png'}" alt="Déjà vu">
          </button>
        </div>`;

      episodeList.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur épisodes :", err);
  }
});

/**
 * Initialise le scroll vertical pour la liste des épisodes.
 */
function setupEpisodeScroll() {
  const scrollContainer = document.querySelector(".ListeEpisode");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("wheel", (event) => {
    if (event.deltaY === 0) return;
    event.preventDefault();
    scrollContainer.scrollTop += event.deltaY > 0 ? 263 : -263;
  });
}





/**
 * Initialise la liste des épisodes déjà vus pour une série donnée.
 * Cette fonction récupère toutes les listes de l'utilisateur, trouve celle nommée "Vu",
 * puis filtre les épisodes appartenant à la série courante.
 * Elle remplit ensuite la liste globale `ListEpisodeDejaVu` avec des clés de la forme "saison-épisode".
 *
 * @async
 * @function
 * @param {string} id - Identifiant de la série à afficher (utilisé pour filtrer les épisodes).
 * @returns {Promise<void>} Ne retourne rien, mais met à jour la liste `ListEpisodeDejaVu`.
 * @throws Affiche une erreur dans la console si la récupération des listes ou des épisodes échoue.
 */
async function InitEpisodeDejaVu(id) {
  try {
    const allLists = await userFetcherInstance.getAllUserLists();
    const seenList = allLists.find(list => list.nomliste === "Vu");
    if (!seenList) 
      return console.error("Liste 'Vu' introuvable");

    const episodes = await userFetcherInstance.getAllEpisodeFromSerieOnList(seenList.idliste);
    console.log("Episodes déjà vus :", episodes);

    episodes.forEach(episode => {
      if (id == episode.idserie) {
        ListEpisodeDejaVu.push(`${episode.saison}-${episode.episode}`);
      }
    });
  } catch (err) {
    console.error("Erreur initialisation épisodes déjà vus :", err);
  }
}