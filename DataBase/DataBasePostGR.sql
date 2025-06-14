DROP TABLE IF EXISTS EPISODEVU;
DROP TABLE IF EXISTS CONTIENTFILM;
DROP TABLE IF EXISTS CONTIENTSERIE;
DROP TABLE IF EXISTS EPISODE;
DROP TABLE IF EXISTS SERIE;
DROP TABLE IF EXISTS FILM;
DROP TABLE IF EXISTS LISTE;
DROP TABLE IF EXISTS UTILISATEUR;


-- Table UTILISATEUR
CREATE TABLE UTILISATEUR (
    pseudo VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    datenaissance DATE,
    age INT,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    nombreheureVisionnerSerie NUMERIC DEFAULT 0,
    nombreheureVisionnerFilm NUMERIC DEFAULT 0,
    nombreheureVisionneTotal NUMERIC DEFAULT 0,
    banniere VARCHAR(255) DEFAULT './img/BannerDefault',
    photodeprofil VARCHAR(255) DEFAULT './img/ProfilPicDefault'
);

-- Table LISTE
CREATE TABLE LISTE (
    idliste SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour auto-incrémentation
    nomliste VARCHAR(100),
    pseudo_utilisateur VARCHAR(50),
    CONSTRAINT fk_utilisateur FOREIGN KEY (pseudo_utilisateur)
        REFERENCES utilisateur(pseudo)
);

CREATE TABLE FILM (
    idfilm INT PRIMARY KEY,  -- ? Correction : type + PRIMARY KEY
    nomFilm VARCHAR(255),
    duree NUMERIC
);

CREATE TABLE SERIE (
    idserie INT PRIMARY KEY,  -- ? Correction aussi
    nomSerie VARCHAR(255)
);

-- Table CONTIENTFILM
CREATE TABLE CONTIENTFILM (
    idliste INT,
    idfilm INT,
    PRIMARY KEY (idliste, idfilm),
    CONSTRAINT fk_contientFilm_liste FOREIGN KEY (idliste) 
        REFERENCES liste(idliste),
    CONSTRAINT fk_contientFilm_film FOREIGN KEY (idfilm) 
        REFERENCES film(idfilm),
    ranks CHAR(1),  -- Les caractères peuvent être limités à 1
    placerank INT
);

-- Table CONTIENTSERIE
CREATE TABLE CONTIENTSERIE (
    idliste INT,
    idserie INT,
    PRIMARY KEY (idliste, idserie),
    CONSTRAINT fk_contientSerie_liste FOREIGN KEY (idliste) 
        REFERENCES liste(idliste),
    CONSTRAINT fk_contientSerie_serie FOREIGN KEY (idserie) 
        REFERENCES serie(idserie),
    ranks CHAR(1),  -- Les caractères peuvent être limités à 1
    placerank INT
);

-- Table EPISODE
CREATE TABLE EPISODE (
    idserie INT,           -- idserie est une clé étrangère
    saison INT,
    episode INT,
    dureeEpisode NUMERIC,
    PRIMARY KEY (idserie, saison, episode),  -- Clé primaire composée de 3 colonnes
    CONSTRAINT fk_Episode_IdSerie FOREIGN KEY (idserie)
        REFERENCES SERIE(idserie)
);

-- Table EPISODEVU
CREATE TABLE EPISODEVU (
    idserie INT,
    idliste INT,
    saison INT,
    episode INT,
    PRIMARY KEY (idserie, idliste, saison, episode),

    CONSTRAINT FK_LISTE_EPISODEVU FOREIGN KEY (idliste)
        REFERENCES LISTE(idliste),

    -- FK vers EPISODE : on doit matcher toute la clé primaire (idserie, saison, episode)
    CONSTRAINT FK_SAISON_EPISODEVU FOREIGN KEY (idserie, saison, episode)
        REFERENCES EPISODE(idserie, saison, episode)
);






/*----------------------------------------------------------*/

CREATE OR REPLACE FUNCTION update_heuretotal() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.nombreheureVisionneTotal := NEW.nombreheureVisionnerSerie + NEW.nombreheureVisionnerFilm;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Trigger_Update_HEURETOTAL
BEFORE INSERT OR UPDATE ON utilisateur
FOR EACH ROW
EXECUTE FUNCTION update_heuretotal();




/*----------------------------------------------------------*/


CREATE OR REPLACE FUNCTION trigger_update_nbheure_film_vu() 
RETURNS TRIGGER AS $$
DECLARE
    v_duree NUMERIC; -- Utiliser NUMERIC plutôt que NUMBER
    v_nomListe VARCHAR(50); -- Utiliser VARCHAR au lieu de VARCHAR2
BEGIN
    -- Récupérer le nom de la liste
    SELECT nomliste INTO v_nomListe
    FROM liste
    WHERE idliste = NEW.idliste;

    IF UPPER(v_nomListe) = 'VU' THEN
        -- Si c'est une liste de films vus, on met à jour les heures
        SELECT duree INTO v_duree
        FROM film
        WHERE idfilm = NEW.idfilm;

        UPDATE utilisateur
        SET nombreheureVisionnerFilm = nombreheureVisionnerFilm + v_duree,
            nombreheureVisionneTotal = nombreheureVisionneTotal + v_duree
        WHERE pseudo = (
            SELECT pseudo_utilisateur
            FROM liste
            WHERE idliste = NEW.idliste
        );
    END IF;

    RETURN NULL; -- Retourner NULL dans un trigger AFTER
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger qui appelle la fonction
CREATE TRIGGER trigger_update_nbheure_film_vu
AFTER INSERT ON contientfilm
FOR EACH ROW
EXECUTE FUNCTION trigger_update_nbheure_film_vu();




/*----------------------------------------------------------*/
CREATE OR REPLACE FUNCTION trigger_update_nbheure_episodevu() 
RETURNS TRIGGER AS $$
DECLARE
    v_duree NUMERIC; -- Utiliser NUMERIC au lieu de NUMBER
    v_nomListe VARCHAR(50); -- Utiliser VARCHAR au lieu de VARCHAR2
BEGIN
    -- Récupérer le nom de la liste
    SELECT nomliste INTO v_nomListe
    FROM liste
    WHERE idliste = NEW.idliste;

    IF UPPER(v_nomListe) = 'VU' THEN
        -- Si c'est une liste VU, on récupère la durée de l'épisode
        SELECT dureeepisode INTO v_duree
        FROM episode
        WHERE idserie = NEW.idserie
          AND saison = NEW.saison
          AND episode = NEW.episode;

        -- Puis on met à jour l'utilisateur
        UPDATE utilisateur
        SET nombreheureVisionnerSerie = nombreheureVisionnerSerie + v_duree,
            nombreheureVisionneTotal = nombreheureVisionneTotal + v_duree
        WHERE pseudo = (
            SELECT pseudo_utilisateur
            FROM liste
            WHERE idliste = NEW.idliste
        );
    END IF;

    RETURN NULL; -- Retourner NULL dans un trigger AFTER
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger qui appelle la fonction
CREATE TRIGGER trigger_update_nbheure_episodevu
AFTER INSERT ON episodevu
FOR EACH ROW
EXECUTE FUNCTION trigger_update_nbheure_episodevu();


/*----------------------------------------------------------*/





















/*----------------------------------------------------------*/


SELECT 
    u.pseudo AS "Pseudo Utilisateur", 
    u.nom AS "Nom Utilisateur", 
    u.prenom AS "Prenom Utilisateur", 
    u.datenaissance AS "Date de Naissance", 
    u.age AS "Age", 
    u.email AS "Email", 
    u.nombreheureVisionnerSerie AS "Heures Visionnées en Série", 
    u.nombreheureVisionnerFilm AS "Heures Visionnées en Film", 
    u.nombreheureVisionneTotal AS "Heures Visionnées Totales", 
    u.banniere AS "Bannière", 
    u.photodeprofil AS "Photo de Profil", 

    l.idliste AS "ID Liste", 
    l.nomliste AS "Nom Liste", 
    l.pseudo_utilisateur AS "Pseudo Utilisateur de la Liste",

    f.idfilm AS "ID Film", 
    f.nomFilm AS "Nom Film", 
    f.duree AS "Durée du Film", 

    s.idserie AS "ID Série", 
    s.nomSerie AS "Nom Série", 

    e.idserie AS "ID Série Episode", 
    e.saison AS "Saison", 
    e.episode AS "Episode", 
    e.dureeepisode AS "Durée de l'Episode",

    cf.idliste AS "ID Liste Film", 
    cf.idfilm AS "ID Film dans Liste", 
    cf.ranks AS "Rank Film", 
    cf.placerank AS "Placement Rank Film", 

    cs.idliste AS "ID Liste Série", 
    cs.idserie AS "ID Série dans Liste", 
    cs.ranks AS "Rank Série", 
    cs.placerank AS "Placement Rank Série"

FROM 
    utilisateur u
LEFT JOIN 
    liste l ON l.pseudo_utilisateur = u.pseudo
LEFT JOIN 
    contientfilm cf ON cf.idliste = l.idliste
LEFT JOIN 
    film f ON f.idfilm = cf.idfilm
LEFT JOIN 
    contientserie cs ON cs.idliste = l.idliste
LEFT JOIN 
    serie s ON s.idserie = cs.idserie
LEFT JOIN 
    episode e ON e.idserie = s.idserie
ORDER BY 
    u.pseudo, l.idliste, cf.idfilm, cs.idserie, e.saison, e.episode;




