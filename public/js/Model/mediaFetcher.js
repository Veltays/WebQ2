const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const BASE_API_URL = 'https://veltays.alwaysdata.net/api';

/**
 * Classe permettant de récupérer les données médias (films ou séries) via une API personnalisée.
 */
class MediaFetcher {
    /**
     * Initialise un nouvel objet MediaFetcher.
     * @param {"film" | "serie"} type - Le type de média à utiliser (par défaut : "film").
     */
    constructor(type = "film") {
        this.type = (type === "film" || type === "serie") ? type : "film";
    }

    /**
     * Récupère les détails d’un média par son identifiant.
     * @param {string} id - L'identifiant du film ou de la série.
     * @returns {Promise<Object|null>} - Les données du média ou null en cas d'erreur.
     */
    async fetchById(id) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/${id}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des détails : ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la récupération des détails :", error);
            return null;
        }
    }

    /**
     * Récupère une liste de médias par genre.
     * @param {string} genre - Le genre à rechercher.
     * @returns {Promise<Object[]>} - Un tableau de médias.
     */
    async fetchByGenre(genre) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}?genre=${genre}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des films par genre : ${response.statusText}`);
            }
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error(`Erreur lors de la récupération des films par genre ${genre} :`, error);
            return [];
        }
    }

    /**
     * Récupère les médias les plus tendance.
     * @returns {Promise<Object[]>} - Un tableau de médias tendance.
     */
    async fetchTrending() {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/tendance`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des films tendance : ${response.statusText}`);
            }
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Erreur lors de la récupération des films tendance :", error);
            return [];
        }
    }

    /**
     * Récupère les images d’un média.
     * @param {string} id - L’identifiant du film ou de la série.
     * @returns {Promise<Object|null>} - Données contenant les images ou null.
     */
    async fetchImages(id) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/${id}/images`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des images : ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la récupération des images :", error);
            return null;
        }
    }

    /**
     * Récupère les crédits d’un média (acteurs, réalisateurs...).
     * @param {string} id - L’identifiant du film ou de la série.
     * @returns {Promise<Object|null>} - Données des crédits ou null.
     */
    async fetchCredits(id) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/${id}/cast`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des crédits : ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la récupération des crédits :", error);
            return null;
        }
    }

    /**
     * Récupère la bande-annonce d’un média.
     * @param {string} id - L’identifiant du film ou de la série.
     * @returns {Promise<Object|null>} - Données de la bande-annonce ou null.
     */
    async fetchTrailer(id) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/trailer/${id}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération de la bande-annonce : ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la récupération de la bande-annonce :", error);
            return null;
        }
    }

    /**
     * Effectue une recherche libre dans les médias.
     * @param {string} query - Terme de recherche.
     * @returns {Promise<Object[]>} - Résultats de la recherche.
     */
    async fetchWithQuery(query) {
        try {
            const response = await fetch(`${BASE_API_URL}/${this.type}/recherche/${query}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la recherche : ${response.statusText}`);
            }
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Erreur lors de la recherche :", error);
            return [];
        }
    }
}

export default MediaFetcher;
