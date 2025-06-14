import Notification from "../Model/notification.js";

/**
 * Classe permettant d’interagir avec les services utilisateur via l’API.
 */
class UserFetcher {
    constructor() { }

    /**
     * Récupère la valeur d’un cookie par son nom.
     * @param {string} name - Nom du cookie.
     * @returns {string|undefined} Valeur du cookie ou undefined.
     */
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    /**
     * Envoie les données d'inscription d’un nouvel utilisateur.
     * @param {Object} user - Données utilisateur à enregistrer.
     * @returns {Promise<number|null>} 1 si succès, null sinon.
     */
    async postUserData(user) {
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/inscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erreur serveur :", data.message || "Erreur inconnue");
                alert(data.message || "Erreur inconnue");
                return null;
            }

            return 1;
        } catch (error) {
            console.error("Erreur lors de l'envoi des données :", error);
            return null;
        }
    }

    /**
     * Vérifie les identifiants d’un utilisateur (connexion).
     * @param {Object} user - Identifiants (email + mot de passe).
     * @returns {Promise<boolean>} True si succès, exception sinon.
     */
    async checkUserData(user) {
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/connexion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(user),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de connexion");
            }

            return true;
        } catch (error) {
            console.error("Erreur de connexion :", error.message);
            alert("Erreur : " + error.message);
        }
    }

    /**
     * Déconnecte l’utilisateur (via l’API) et vide les données locales.
     */
    async logout() {
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/deconnexion", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de déconnexion");
            }

            alert("Déconnexion réussie ! À bientôt !");
            localStorage.clear();
        } catch (error) {
            console.error("Erreur de déconnexion :", error.message);
            alert("Erreur : " + error.message);
        }
    }

    /**
     * Récupère les données de l’utilisateur connecté (via JWT).
     * @returns {Promise<Object|null>} Données utilisateur ou redirection.
     */
    async getUserData() {
        try {
            const token = this.getCookie("token");

            if (!token) {
                throw new Error("Token absent. L'utilisateur n'est pas connecté.");
            }

            const response = await fetch("https://veltays.alwaysdata.net/user/DataUtilisateur", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de récupération des données utilisateur");
            }

            return data;
        } catch (error) {
            console.error("Erreur récupération données utilisateur :", error.message);
            alert("Erreur : " + error.message);
            window.location.href = "./login.html";
        }
    }

    /**
        * Crée une nouvelle liste pour l’utilisateur.
        * @param {string} name - Nom de la nouvelle liste.
        * @returns {Promise<Object|undefined>} Données de la nouvelle liste.
        */
    async setNewList(name) {
        const token = this.getCookie("token");
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/creerListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de création de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur création liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }

    /**
     * Récupère toutes les listes de l’utilisateur connecté.
     * @returns {Promise<Object[]|undefined>} Tableaux des listes utilisateur.
     */
    async getAllUserLists() {
        const token = this.getCookie("token");
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/AllUserList", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de récupération des listes utilisateur");
            }

            return data;
        } catch (error) {
            console.error("Erreur récupération listes utilisateur :", error.message);
            if (error.message === "Token invalide") {
                window.location.href = "./login.html";
            }
        }
    }

    /**
     * Ajoute un film à une liste spécifique.
     * @param {string} filmId - Identifiant du film.
     * @param {string} listId - Identifiant de la liste.
     */
    async setNewFilmOnList(filmId, listId) {
        const token = this.getCookie("token");
        console.log("Ajout d'un film à la liste :", filmId, listId);
        try {
            if (!listId) {
                console.error("❌ Liste ID manquant !");
                return;
            }

            const response = await fetch("https://veltays.alwaysdata.net/user/ajouterFilmAListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ filmid: filmId, listeid: listId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            const filmRes = await fetch(`https://veltays.alwaysdata.net/api/film/${filmId}`);
            const film = await filmRes.json();

            const listRes = await fetch(`https://veltays.alwaysdata.net/user/getListName/${listId}`);
            const listName = await listRes.json();

            new Notification("Info", `Le film ${film.title} a été ajouté à la liste ${listName}`, Notification.Type.INFO).show();

            return data;
        } catch (error) {
            console.error("Erreur ajout film :", error.message);
        }
    }

    /**
 * Ajoute une série à une liste spécifique.
 * @param {string} serieId - Identifiant de la série.
 * @param {string} listId - Identifiant de la liste.
 */
    async setNewSerieOnList(serieId, listId) {
        const token = this.getCookie("token");
        console.log("Ajout d'une série :", serieId, listId);
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/ajouterSerieAListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ serieid: serieId, listeid: listId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            const serieRes = await fetch(`https://veltays.alwaysdata.net/api/serie/${serieId}`);
            const serie = await serieRes.json();

            const listRes = await fetch(`https://veltays.alwaysdata.net/user/getListName/${listId}`);
            const listName = await listRes.json();

            new Notification("info", `La série ${serie.name} a été ajoutée à la liste ${listName}`, Notification.Type.INFO).show();

            return data;
        } catch (error) {
            console.error("Erreur ajout série :", error.message);
        }
    }

    /**
     * Ajoute un épisode d’une série dans une liste.
     * @param {string} serieId - ID de la série.
     * @param {string} listId - ID de la liste.
     * @param {number} saison - Numéro de la saison.
     * @param {number} episode - Numéro de l’épisode.
     */
    async setNewEpisodeOnSerie(serieId, listId, saison, episode) {
        const token = this.getCookie("token");
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/ajouterEpisodeAListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ idserie: serieId, listeid: listId, saison, episode }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            const serieRes = await fetch(`https://veltays.alwaysdata.net/api/serie/${serieId}`);
            const serie = await serieRes.json();

            const listRes = await fetch(`https://veltays.alwaysdata.net/user/getListName/${listId}`);
            const listName = await listRes.json();

            const notif = new Notification("info", `L'épisode ${saison}x${episode} de la série ${serie.name} a été ajouté à ${listName}`, Notification.Type.INFO);
            await Notification.store(notif);

            return data;
        } catch (error) {
            console.error("Erreur ajout épisode :", error.message);
            alert("Erreur : " + error.message);
        }
    }

    /**
     * Supprime un film d'une liste utilisateur.
     * @param {string} filmId - Identifiant du film à supprimer.
     * @param {string} listId - Identifiant de la liste concernée.
     * @returns {Promise<Object|undefined>}
     */
    async deleteFilmOnList(filmId, listId) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/supprimerFilmDeListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ filmid: filmId, listeid: listId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de suppression du film de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur suppression film :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
     * Supprime une série ou un épisode d’une liste.
     * @param {string} serieId - ID de la série.
     * @param {string} listId - ID de la liste.
     * @param {number} saison - Numéro de la saison.
     * @param {number} episode - Numéro de l’épisode.
     * @returns {Promise<Object|undefined>}
     */
    async deleteSerieOnList(serieId, listId, saison, episode) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/supprimerSerieDeListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ serieid: serieId, listeid: listId, Saison: saison, Episode: episode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de suppression de la série de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur suppression série :", error.message);
            alert("Erreur : " + error.message);
        }
    }



    /**
     * Supprime une liste de l'utilisateur.
     * @param {string} listId - Identifiant de la liste à supprimer.
     * @returns {Promise<Object|undefined>}
     */
    async deleteList(listId) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/supprimerListe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ listeid: listId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de suppression de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur suppression liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }



    /**
     * Met à jour les données de l'utilisateur (pseudo, bannière, photo de profil).
     * @param {string} newPseudo - Nouveau pseudo de l'utilisateur.
     * @param {string} bannerPath - Chemin de la nouvelle bannière.
     * @param {string} profilPicPath - Chemin de la nouvelle photo de profil.
     * @returns {Promise<Object|false>}
     */
    async updateUserInfo(newPseudo, bannerPath, profilPicPath) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/updateUserData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({
                    newPseudo,
                    newBanniere: bannerPath,
                    newPhotodeprofil: profilPicPath
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de mise à jour des informations utilisateur");
            }

            const notif = new Notification("warning", `Des données du compte ont été modifiées`, Notification.Type.WARNING);
            await Notification.store(notif);

            return data;
        } catch (error) {
            console.error("Erreur mise à jour utilisateur :", error.message);
            alert("Erreur : " + error.message);
            return false;
        }
    }


    /**
     * Met à jour le rang d’un film dans une liste.
     * @param {string} filmId - ID du film.
     * @param {string} listId - ID de la liste.
     * @param {string} rank - Rang (A, B, C...).
     * @param {number} placeRank - Place dans le rang.
     * @returns {Promise<Object|undefined>}
     */
    async updateRankFilm(filmId, listId, rank, placeRank) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/updateRankFilm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ filmid: filmId, listeid: listId, rank, placeRank })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de mise à jour du rang du film");
            }

            return data;
        } catch (error) {
            console.error("Erreur mise à jour rang film :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
     * Met à jour le rang d’une série dans une liste.
     * @param {string} serieId - ID de la série.
     * @param {string} listId - ID de la liste.
     * @param {string} rank - Rang (A, B, C...).
     * @param {number} placeRank - Place dans le rang.
     * @returns {Promise<Object|undefined>}
     */
    async updateRankSerie(serieId, listId, rank, placeRank) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/updateRankSerie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ serieid: serieId, listeid: listId, rank, placeRank })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de mise à jour du rang de la série");
            }

            return data;
        } catch (error) {
            console.error("Erreur mise à jour rang série :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
     * Met à jour le nom d’une liste.
     * @param {string} listId - Identifiant de la liste.
     * @param {string} newName - Nouveau nom.
     * @returns {Promise<Object|undefined>}
     */
    async updateListName(listId, newName) {
        const token = this.getCookie('token');
        try {
            const response = await fetch("https://veltays.alwaysdata.net/user/updateList", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({ listeid: listId, newName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de mise à jour du nom de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur mise à jour nom liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
     * Récupère tous les films d’une liste.
     * @param {string} listId - ID de la liste.
     * @returns {Promise<Object[]|undefined>}
     */
    async getAllFilmFromList(listId) {
        const token = this.getCookie('token');
        try {
            const response = await fetch(`https://veltays.alwaysdata.net/user/getFilmFromList?listeid=${listId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de récupération des films de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur récupération films liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
     * Récupère toutes les séries d’une liste.
     * @param {string} listId - ID de la liste.
     * @returns {Promise<Object[]|undefined>}
     */
    async getAllSerieFromList(listId) {
        const token = this.getCookie('token');
        try {
            const response = await fetch(`https://veltays.alwaysdata.net/user/getSerieFromList?listeid=${listId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de récupération des séries de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur récupération séries liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }


    /**
 * Envoie une image (photo de profil ou bannière) au serveur.
 *
 * @param {File} imageFile - Le fichier image à uploader.
 * @param {string} imageType - Le type d'image : 'PhotoProfil' ou 'BannerProfil'.
 * @returns {Promise<string>} - L'URL de l'image uploadée.
 * @throws {Error} - Si une erreur survient lors de l'envoi.
 */
    async uploadImage(imageFile, imageType) {
        const token = this.getCookie('token');
        const formData = new FormData();
        formData.append("image", imageFile);  // On convertit le fichier en FormData pour -> l'envoyer a l'API qui sera receptionner par multer
        formData.append("type", imageType); // 'PhotoProfil' ou 'BannerProfil'

        console.log("Envoi de l'image :", imageFile, imageType);

        const response = await fetch("https://veltays.alwaysdata.net/user/uploadImage", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de l'upload de l'image");
        }

        return data.url; // URL renvoyée par l'API
    }


    async getAllEpisodeFromSerieOnList(listId) {
        const token = this.getCookie('token');
        try {
            const response = await fetch(`https://veltays.alwaysdata.net/user/getEpisodeFromList?listeid=${listId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur de récupération des épisodes de la liste");
            }

            return data;
        } catch (error) {
            console.error("Erreur récupération épisodes liste :", error.message);
            alert("Erreur : " + error.message);
        }
    }


}

export default UserFetcher;