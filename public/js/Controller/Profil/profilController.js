/**
 * Contrôleur principal de la page de profil utilisateur.
 * Gère le rendu des données utilisateur, les statistiques de visionnage, les listes
 * et les interactions telles que la déconnexion ou l’ouverture du modal de modification.
 * @module profilController
 */

import UserManager from '../../Model/userFetcher.js';
import MediaManager from '../../Model/mediaFetcher.js';
import { initProportionalCircles } from "./proportionalCircle.js"; // 👈 ajout

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const userManager = new UserManager();
const mediaManager = new MediaManager();

/* ============ INITIALISATION ============ */

/**
 * Initialise tous les composants dynamiques du profil utilisateur.
 */
export async function initProfilController() {
  const userData = await userManager.getUserData();
  renderUserHeader(userData);
  renderWatchStats(userData);
  await loadAllLists();
  await afficheNbVu();
  setupModalHandlers(userManager);
  setupLogout(userManager);
  setupBackButton();

  await UpdateNumberOfSeen();
  initProportionalCircles();  
}


/* ============ RENDER / UI ============ */

/**
 * Affiche l'en-tête du profil utilisateur avec photo, bannière et pseudo.
 * @param {Object} data - Données de l'utilisateur.
 */
function renderUserHeader(data) {
  document.querySelector(".banner").src = data.banniere;
  document.querySelector(".profile-picture").src = data.photodeprofil;
  document.querySelector(".username p").textContent = data.pseudo;
}

/**
 * Affiche les statistiques de visionnage (films, séries, total).
 * @param {Object} user - Données de l'utilisateur contenant les heures de visionnage.
 */
function renderWatchStats(user) {
  const convertMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return {
      days,
      hoursOnly: hours % 24,
      minutes: minutes % 60,
      totalHours: hours
    };
  };

  const total = convertMinutes(user.nombreheurevisionnetotal);
  document.querySelector(".te-total p:nth-of-type(2)").textContent =
    `${total.days} jours ${total.hoursOnly} heures ${total.minutes} minutes`;

  const film = convertMinutes(user.nombreheurevisionnerfilm);
  document.getElementById("number1").textContent = `${film.totalHours} heures`;
  document.querySelector("#number2 p").textContent = film.days;
  document.querySelector("#number3 p").textContent = film.hoursOnly;
  document.querySelector("#number4 p").textContent = film.minutes;

  const serie = convertMinutes(user.nombreheurevisionnerserie);
  document.getElementById("number5").textContent = `${serie.totalHours} heures`;
  document.querySelector("#number6 p").textContent = serie.days;
  document.querySelector("#number7 p").textContent = serie.hoursOnly;
  document.querySelector("#number8 p").textContent = serie.minutes;
}

/**
 * Gère l'affichage visuel d'une carte de média dans un conteneur donné.
 * @param {HTMLElement} container - Élément dans lequel injecter la carte.
 * @param {number} mediaId - ID TMDB du film ou de la série.
 */
async function renderMedia(container, mediaId) {
  try {
    const data = await mediaManager.fetchById(mediaId);
    if (!data.poster_path) return;

    const card = document.createElement('div');
    card.classList.add('FilmCard');

    const link = document.createElement('a');
    link.href = `${mediaManager.type}.html?id=${data.id}`;

    const img = document.createElement('img');
    img.src = IMAGE_BASE_URL + data.poster_path;
    img.alt = data.title || data.name;

    link.appendChild(img);
    card.appendChild(link);
    container.appendChild(card);
  } catch (error) {
    console.error("Erreur affichage média :", error);
  }
}


/* ============ LISTES UTILISATEUR ============ */

/**
 * Crée dynamiquement une section DOM contenant une liste utilisateur.
 * @param {string} listName - Nom de la liste.
 * @returns {HTMLElement} - Le conteneur DOM créé pour la liste.
 */
function createListSection(listName) {
  const section = document.createElement('section');
  section.classList.add(listName);

  const title = document.createElement('h2');
  title.innerText = listName;
  title.classList.add('TitreListe');

  const divList = document.createElement('div');
  divList.classList.add('ListeDeFilm');
  divList.id = 'Liste' + listName;

  section.appendChild(title);
  section.appendChild(divList);
  document.querySelector('.list-place').appendChild(section);

  return divList;
}

/**
 * Charge toutes les listes de l'utilisateur et génère leur contenu.
 */
async function loadAllLists() {
  try {
    const allLists = await userManager.getAllUserLists();
    console.log("Toutes les listes utilisateur :", allLists);

    for (const list of allLists) {
      await displayListMedia(list);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des listes utilisateur :", error);
  }
}

/**
 * Affiche le contenu d'une liste utilisateur (films et séries).
 * @param {Object} list - Liste utilisateur (nomliste, idliste...).
 */
async function displayListMedia(list) {
  try {
    const listId = list.idliste;
    const listName = list.nomliste;
    const container = createListSection(listName.replace(/\s+/g, '_'));

    const films = await userManager.getAllFilmFromList(listId);
    films.forEach(film => {
      mediaManager.type = "film";
      renderMedia(container, film.idfilm);
    });

    const series = await userManager.getAllSerieFromList(listId);
    series.forEach(serie => {
      mediaManager.type = "serie";
      renderMedia(container, serie.idserie);
    });
  } catch (error) {
    console.error(`Erreur lors de l'affichage de la liste "${list.nomliste}" :`, error);
  }
}


/* ============ HANDLERS (MODAL / UI) ============ */

/**
 * Configure les interactions du modal d'édition de profil et de création de liste.
 * @param {UserManager} userInstance - Instance de gestion utilisateur.
 */
function setupModalHandlers(userInstance) {
  const modal = document.querySelector(".modal");
  const openBtn = document.getElementById("edit-profile");
  const closeBtn = document.querySelector(".close");

  const modal2 = document.querySelector(".modal2");
  const openNewList = document.getElementById("btn-creer-liste");
  const closeBtn2 = document.querySelector(".close2");
  const saveBtn2 = document.querySelector(".save-button2");

  if (openBtn && modal && closeBtn) {
    openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    window.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
  }

  if (openNewList && modal2 && closeBtn2 && saveBtn2) {
    openNewList.addEventListener("click", e => {
      e.preventDefault();
      modal2.classList.remove("hidden");
    });

    closeBtn2.addEventListener("click", () => modal2.classList.add("hidden"));
    window.addEventListener("click", e => { if (e.target === modal2) modal2.classList.add("hidden"); });

    saveBtn2.addEventListener("click", async e => {
      e.preventDefault();
      const listNameInput = document.getElementById("new-list-name");
      const name = listNameInput.value.trim();
      if (!name) return alert("Le nom de la liste ne peut pas être vide");

      try {
        await userInstance.setNewList(name);
        const allLists = await userInstance.getAllUserLists();
        const newList = allLists.find(l => l.nomliste === name);
        if (newList) await displayListMedia(newList);
        modal2.classList.add("hidden");
        listNameInput.value = "";
      } catch (err) {
        console.error("Erreur création liste :", err);
        alert("Erreur lors de la création de la liste.");
      }
    });
  }
}

/**
 * Initialise le bouton de déconnexion.
 * @param {UserManager} userInstance - Instance de gestion utilisateur.
 */
function setupLogout(userInstance) {
  document.getElementById("deconnexion")?.addEventListener("click", async e => {
    e.preventDefault();
    await userInstance.logout();
    window.location.href = "./index.html";
  });
}

/**
 * Active le bouton de retour vers la page d'accueil.
 */
function setupBackButton() {
  document.getElementById("back-btn")?.addEventListener("click", () => {
    window.location.href = "./index.html";
  });
}


/* ============ STATS OPTIONNELLES (à revoir selon l'API) ============ */

/**
 * Affiche le nombre total de films et épisodes vus.
 */
async function afficheNbVu() {
  try {
    const userId = window.currentUserId;
    if (!userId) return console.warn("ID utilisateur non défini.");

    const list = await userManager.getUserListByName("vu");
    const nbFilms = list?.films?.length || 0;

    const episodes = await userManager.getEpisodesVus(userId);
    const nbEpisodes = episodes?.length || 0;

    document.getElementById("nbfilmvu").textContent = nbFilms;
    document.getElementById("nbserievu").textContent = nbEpisodes;
  } catch (err) {
    console.error("Erreur lors de l'affichage des vues :", err);
  }
}



async function UpdateNumberOfSeen()
{
  try {


    // Calculer le nombre de films vus
    const allLists = await userManager.getAllUserLists();
    const seenList = allLists.find(list => list.nomliste === "Vu");

    const listFilmSeen = await userManager.getAllFilmFromList(seenList.idliste);

    console.log("Films vus :", listFilmSeen);
    const nbFilmsVu = listFilmSeen.length || 0;
    document.getElementById("nbfilmvu").textContent = nbFilmsVu;



    // Calculer le nombre d'épisodes vus

    const ListEpisodeSeen = await userManager.getAllEpisodeFromSerieOnList(seenList.idliste);
    console.log("Épisodes vus :", ListEpisodeSeen);
    const nbEpisodesVu = ListEpisodeSeen.length || 0;
    document.getElementById("nbserievu").textContent = nbEpisodesVu;



  }
  catch (err) {
    console.error("Erreur lors de la mise à jour du nombre de vus :", err);
  }
}