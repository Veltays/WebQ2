import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserService from './userService.js';

/**
 * Configuration de la stratégie d'authentification Google pour Passport.js.
 * Lorsqu'un utilisateur s'authentifie, on cherche son email dans la base.
 * S'il n'existe pas, on le crée automatiquement via le profil Google.
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,       // ID client Google
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Secret client Google
    callbackURL: 'http://veltays.alwaysdata.net/auth/google/callback' // URL de rappel après auth
  },
  /**
   * Fonction callback exécutée après l'authentification Google.
   * @param {string} accessToken - Jeton d'accès Google.
   * @param {string} refreshToken - Jeton de rafraîchissement Google.
   * @param {Object} profile - Profil Google de l'utilisateur.
   * @param {Function} done - Fonction de rappel pour poursuivre l'authentification.
   */
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await UserService.findByEmail(email);
      if (!user) {
        user = await UserService.createFromGoogle(profile);
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

/**
 * Sérialise l'utilisateur dans la session.
 * @param {Object} user - L'utilisateur connecté.
 * @param {Function} done - Fonction de rappel.
 */
passport.serializeUser((user, done) => {
  done(null, user.email); // ou .pseudo ou .id
});

/**
 * Désérialise un utilisateur à partir de son identifiant en session.
 * @param {string} email - L'identifiant sérialisé de l'utilisateur.
 * @param {Function} done - Fonction de rappel.
 */
passport.deserializeUser(async (email, done) => {
  try {
    const user = await UserService.findByEmail(email);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
