import MediaFetcher from '../../Model/mediaFetcher.js';

const mediaFetcher = new MediaFetcher();

/**
 * Récupère les films/séries tendances et les affiche dynamiquement dans le DOM.
 * Crée 3 blocs de 3 propositions chacun (3x3 = 9 éléments max).
 * @returns {Promise<void>}
 */
export async function renderTendances() {
    try {
        const tendances = await mediaFetcher.fetchTrending();
        const container = document.querySelector(".ListePropositionContainer");

        for (let i = 0; i < 3; i++) {
            const div = document.createElement("div");
            div.classList.add(`ListePropositionEnFond${i + 1}`);

            for (let j = 0; j < 3; j++) {
                const film = tendances[j + i * 3];
                const img = document.createElement("img");

                img.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
                img.className = "FilmProposition";
                img.alt = `Image tendance ${j + 1}`;

                div.appendChild(img);
            }

            container.appendChild(div);
        }
    } catch (err) {
        console.error("Erreur lors de l'affichage des tendances :", err);
    }
}

/**
 * Récupère les données d’un formulaire HTML d’inscription.
 * @returns {Object} Objet contenant les champs du formulaire.
 */
export function getFormData() {
    return {
        nom: document.getElementById("Nom").value,
        prenom: document.getElementById("Prenom").value,
        pseudo: document.getElementById("Username").value,
        dateNaissance: document.getElementById("Birthday").value,
        email: document.getElementById("Email").value,
        password: document.getElementById("Password").value,
        passwordConfirm: document.getElementById("PasswordConfirm").value
    };
}

/**
 * Valide l’ensemble des champs du formulaire.
 * @param {Object} formData - Données du formulaire.
 * @returns {boolean} Vrai si toutes les validations passent, sinon faux.
 */
export function validateForm({ nom, prenom, pseudo, dateNaissance, email, password, passwordConfirm }) {
    return (
        validateField(nom, /^[A-Za-z]+$/, ".ErrorFormNom") &&
        validateField(prenom, /^[A-Za-z]+$/, ".ErrorFormPrenom") &&
        validateField(pseudo, /^[A-Za-z0-9_]+$/, ".ErrorFormPseudo") &&
        validateDate(dateNaissance) &&
        validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, ".ErrorFormEmail") &&
        validatePassword(password, passwordConfirm)
    );
}

/**
 * Valide un champ générique via une expression régulière.
 * @param {string} value - Valeur du champ.
 * @param {RegExp} regex - Expression régulière de validation.
 * @param {string} errorSelector - Sélecteur CSS pour le message d'erreur.
 * @returns {boolean} Résultat de la validation.
 */
function validateField(value, regex, errorSelector) {
    const error = document.querySelector(errorSelector);
    if (!regex.test(value)) {
        error.style.display = "block";
        return false;
    }
    error.style.display = "none";
    return true;
}

/**
 * Valide la date de naissance : doit être antérieure à aujourd’hui et > 1900.
 * @param {string} dateStr - Date en string (format HTML5).
 * @returns {boolean} Résultat de la validation.
 */
function validateDate(dateStr) {
    const inputDate = new Date(dateStr);
    const now = new Date();
    const year = inputDate.getFullYear();
    const error = document.querySelector(".ErrorFormBirthday");

    if (inputDate > now || year < 1900) {
        error.style.display = "block";
        return false;
    }
    error.style.display = "none";
    return true;
}

/**
 * Valide le mot de passe et sa confirmation.
 * - Minimum 8 caractères, au moins une lettre et un chiffre.
 * - Doit correspondre à la confirmation.
 * @param {string} pass - Mot de passe.
 * @param {string} confirm - Confirmation du mot de passe.
 * @returns {boolean} Résultat de la validation.
 */
function validatePassword(pass, confirm) {
    const valid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    const errorPass = document.querySelector(".ErrorFormPassword");
    const errorConfirm = document.querySelector(".ErrorFormConfPassword");

    if (!valid.test(pass)) {
        errorPass.style.display = "block";
        return false;
    } else {
        errorPass.style.display = "none";
    }

    if (pass !== confirm) {
        errorConfirm.style.display = "block";
        return false;
    } else {
        errorConfirm.style.display = "none";
    }

    return true;
}
