import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';

/**
 * @route GET /auth/google
 * @group Authentification - Google
 * @description Lance le processus d'authentification via Google OAuth.
 * @returns {Redirect} - Redirige vers la page de login Google
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @route GET /auth/google/callback
 * @group Authentification - Google
 * @description Callback de Google après authentification. Génère un JWT et le place dans un cookie.
 * @returns {Redirect} - Redirige vers /profil.html avec le pseudo dans l'URL
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html', session: false }),
  (req, res) => {
    const token = jwt.sign(
      { pseudo: req.user.pseudo },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: false,   // Pour permettre l'accès au cookie via JavaScript
      secure: false,     // À mettre à true si HTTPS est utilisé
      sameSite: 'Lax',   // jsp pq
    });

    res.redirect('/profil.html?user=${req.user.pseudo}' + encodeURIComponent(req.user.pseudo));   //EncodeUrIComponent pour éviter les problèmes d'URL (genre espace etc)
  }
);

export default router;
