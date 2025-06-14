/**
 * Affiche les tendances dans la page d'accueil ou de login.
 *
 * @param {Array<Object>} tendances - Liste d'objets contenant les données des films tendances.
 */
export function renderTendances(tendances) {
    const container = document.querySelector(".ListePropositionContainer");

    for (let i = 0; i < 3; i++) {
        const backgroundDiv = document.createElement("div");
        backgroundDiv.classList.add(`ListePropositionEnFond${i + 1}`);

        for (let j = 0; j < 3; j++) {
            const film = tendances[j + i * 3];
            const img = document.createElement("img");

            img.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
            img.className = "FilmProposition";
            img.alt = `Image de la tendance ${j + 1}`;

            backgroundDiv.appendChild(img);
        }

        container.appendChild(backgroundDiv);
    }
}
