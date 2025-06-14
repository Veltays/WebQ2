/**
 * Récupère le paramètre `type` depuis l'URL (film ou serie),
 * redirige vers `?type=film` si absent, et applique la classe CSS active
 * au bon bouton (Film ou Série).
 * @module type
 */

const params = new URLSearchParams(window.location.search);
let type = params.get("type"); // Par défaut, "film" si non défini

// Si on est sur la page signin, on force le type à "film"
if (window.location.href.includes("signin")) {
    type = "film";
} else {
    if (!type) {
        // Redirige vers la page avec le paramètre ?type=film si absent
        window.location.href = "index.html?type=film";
    } else {
        const btnFilm = document.querySelector(".FilmButton");
        const btnSerie = document.querySelector(".SerieButton");

        if (type === "film") {
            btnFilm?.classList.add("ButtonActive");
            btnSerie?.classList.remove("ButtonActive");
        }

        if (type === "serie") {
            btnFilm?.classList.remove("ButtonActive");
            btnSerie?.classList.add("ButtonActive");
        }

        console.log("Type de contenu :", type);
    }
}

export default type;
