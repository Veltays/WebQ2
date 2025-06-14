import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DbFetcher from '../S-F.db/dbFetcher.js';
import DbSetter from '../S-F.db/dbSetter.js';

/**
 * Service utilisateur pour l'inscription, la connexion, la récupération et la mise à jour des données.
 */
class UserService {
  /** @type {string} Clé secrète JWT */
  static JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';
  /** @type {DbFetcher} */
  static fetcher = new DbFetcher('user');
  /** @type {DbSetter} */
  static setter = new DbSetter('user');

  /**
   * Enregistre un nouvel utilisateur dans la base de données.
   * @param {Object} userData - Données de l'utilisateur.
   * @param {string} userData.nom
   * @param {string} userData.prenom
   * @param {string} userData.pseudo
   * @param {string|null} userData.dateNaissance
   * @param {number|null} userData.age
   * @param {string} userData.email
   * @param {string} userData.motDePasse
   * @returns {Promise<void>}
   * @throws {Error} Si un utilisateur avec ce pseudo ou email existe déjà.
   */
  static async register({ nom, prenom, pseudo, dateNaissance, age, email, motDePasse }) {
    const userExists = await this.fetcher.userExistsByPseudoOrEmail(pseudo, email);
    if (userExists) {
      const err = new Error("Un utilisateur avec ce pseudo ou cet email existe déjà.");
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    await this.setter.insertUser({ nom, prenom, pseudo, dateNaissance, age, email, hashedPassword });
    await this.setter.insertDefaultLists(pseudo);
  }

  /**
   * Authentifie un utilisateur via son pseudo/email et mot de passe.
   * @param {string} identifiant - Pseudo ou email.
   * @param {string} motDePasse - Mot de passe brut.
   * @returns {Promise<string>} - Token JWT si authentification réussie.
   * @throws {Error} En cas d'identifiants invalides.
   */
  static async login(identifiant, motDePasse) {
    const user = await this.fetcher.getUserByPseudoOrEmail(identifiant);

    if (!user) {
      const err = new Error("Identifiants invalides");
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(motDePasse, user.password);
    if (!isMatch) {
      const err = new Error("Mot de passe incorrect");
      err.status = 401;
      throw err;
    }

    return jwt.sign({ pseudo: user.pseudo }, this.JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Récupère les données d’un utilisateur via son pseudo.
   * @param {string} pseudo - Pseudo de l'utilisateur.
   * @returns {Promise<Object>} - Données utilisateur.
   * @throws {Error} Si l'utilisateur est introuvable.
   */
  static async getUserData(pseudo) {
    const user = await this.fetcher.getUserDataByPseudo(pseudo);
    if (!user) {
      const err = new Error("Utilisateur non trouvé");
      err.status = 404;
      throw err;
    }
    return user;
  }

  /**
   * Met à jour les données utilisateur (pseudo, bannière, photo).
   * @param {string} currentPseudo - Ancien pseudo.
   * @param {Object} data - Nouvelles données utilisateur.
   * @param {string} data.newPseudo
   * @param {string} data.newBanniere
   * @param {string} data.newPhotodeprofil
   * @returns {Promise<string>} - Nouveau token JWT.
   */
  static async updateUserData(currentPseudo, { newPseudo, newBanniere, newPhotodeprofil }) {
    const pseudoPris = await this.fetcher.isPseudoTaken(newPseudo, currentPseudo);

    await this.setter.updateUserData({
      currentPseudo,
      newPseudo,
      banniere: newBanniere,
      photodeprofil: newPhotodeprofil
    });

    return jwt.sign({ pseudo: newPseudo }, this.JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Recherche un utilisateur à partir de son email.
   * @param {string} email - Email de l'utilisateur.
   * @returns {Promise<Object|null>} - Utilisateur ou null s'il n'existe pas.
   */
  static async findByEmail(email) {
    return await this.fetcher.getUserByEmail(email);
  }

  /**
   * Crée un nouvel utilisateur à partir des données du profil Google.
   * @param {Object} profile - Profil Google.
   * @returns {Promise<Object>} - Utilisateur créé ou existant.
   */
  static async createFromGoogle(profile) {
    const email = profile.emails[0].value;
    const pseudo = profile.displayName.replace(/\s+/g, '') + Date.now(); // pseudo temporaire
    const nom = profile.name?.familyName || '';
    const prenom = profile.name?.givenName || '';
    const photo = profile.photos[0]?.value || null;

    const defaultUser = {
      nom,
      prenom,
      pseudo,
      dateNaissance: null,
      age: null,
      email,
      hashedPassword: null, // utilisateur Google
      photodeprofil: photo,
      banniere: "./img/BannerProfil/Default.png"
    };

    await this.setter.insertUserFromGoogle(defaultUser); // méthode à créer
    await this.setter.insertDefaultLists(pseudo);
    return await this.fetcher.getUserByEmail(email);
  }
}

export default UserService;
