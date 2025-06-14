// ✅ Serveur Express principal (server.js)
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';


import './services/googleAuth.js';

import filmsRouter from './routes/routeFilm.js';
import SerieRouter from './routes/routeSerie.js';
import UserRouter from './routes/routeUser.js';
import Auth from './routes/auth.js';
import pool from './db.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const ip = process.env.IP || '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);    // Obtenir le nom du fichier actuel
const __dirname = path.dirname(__filename);           // Obtenir le répertoire du fichier actuel

// Middleware CORS
app.use(cors({ 
  origin: ['http://localhost:3000','http://127.0.0.1:5501', 'http://veltays.alwaysdata.net'],
  credentials: true 
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',   // Clé secrète pour signer les cookies de session
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: false  // Ne pas sauvegarder une session non initialisée
}));
app.use(passport.initialize());
app.use(passport.session());

// Dossier public statique
app.use(express.static(path.join(__dirname, 'public'))); // Servir les fichiers statiques depuis le dossier 'public'
app.use(express.urlencoded({ extended: true })); // Middleware pour parser les données des formulaires



// Routes
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/film', filmsRouter);
app.use('/api/serie', SerieRouter);
app.use('/user', UserRouter);
app.use('/auth', Auth);

// Test de connexion DB 
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');  // Vérifier la connexion à la base de données en renvoyant l'heure actuelle
    console.log('Connexion à la base de données réussie:', result.rows[0]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur connexion base de données');
  }
});

// Lancement du serveur 
app.listen(port, ip, () => {
  console.log(`✅ Serveur lancé sur http://${ip}:${port}`);
});

// Gestion erreurs critiques pour éviter crash serveur
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', promise, 'raison:', reason);
});
