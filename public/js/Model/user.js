/**
 * Représente un utilisateur avec ses informations personnelles.
 */
class User {
    /**
     * Crée un nouvel utilisateur.
     * @param {string} nom - Le nom de l'utilisateur.
     * @param {string} prenom - Le prénom de l'utilisateur.
     * @param {string} pseudo - Le pseudo unique de l'utilisateur.
     * @param {string} dateNaissance - Date de naissance (format ISO ou YYYY-MM-DD).
     * @param {string} email - Adresse e-mail.
     * @param {string} motDePasse - Mot de passe (chiffré ou non selon l'implémentation).
     */
    constructor(nom, prenom, pseudo, dateNaissance, email, motDePasse) {
        this.nom = nom;
        this.prenom = prenom;
        this.pseudo = pseudo;
        this.dateNaissance = dateNaissance;
        this.age = this.getAge(); // Calcul dynamique
        this.email = email;
        this.motDePasse = motDePasse;
        this.heuresRegardees = 0; // Initialisation manquante
    }

    /**
     * Calcule l’âge de l’utilisateur à partir de sa date de naissance.
     * @returns {number} Âge calculé en années.
     */
    getAge() {
        const today = new Date();
        const birthDate = new Date(this.dateNaissance);

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    /**
     * Ajoute des heures au compteur d'heures regardées.
     * @param {number} nombreHeures - Nombre d’heures à ajouter.
     */
    ajouterHeures(nombreHeures) {
        this.heuresRegardees += nombreHeures;
    }

    /**
     * Affiche dans la console toutes les informations de l’utilisateur.
     */
    afficherInfos() {
        console.log(`Nom : ${this.nom}`);
        console.log(`Prénom : ${this.prenom}`);
        console.log(`Pseudo : ${this.pseudo}`);
        console.log(`Email : ${this.email}`);
        console.log(`Date de naissance : ${this.dateNaissance}`);
        console.log(`Âge : ${this.age} ans`);
        console.log(`Heures regardées : ${this.heuresRegardees} h`);
    }
}

export default User;
