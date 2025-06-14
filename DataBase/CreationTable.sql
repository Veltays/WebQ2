-- SUPPRESSION DES TABLES DèJA EXISTANTE


DROP TABLE CONTIENTFILM;
DROP TABLE CONTIENTSERIE;
DROP TABLE EPISODEVU;
DROP TABLE EPISODE;
DROP TABLE SERIE;
DROP TABLE FILM;
DROP TABLE LISTE;
DROP TABLE UTILISATEUR;





CREATE TABLE UTILISATEUR (
    pseudo VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    datenaissance DATE,
    age INT,
    email VARCHAR(100),
    password VARCHAR(255),
    nombreheureVisionnerSerie NUMBER DEFAULT 0,
    nombreheureVisionnerFilm NUMBER DEFAULT 0,
    nombreheureVisionneTotal NUMBER DEFAULT 0,
    banniere VARCHAR(255) DEFAULT './img/BannerDefault',
    photodeprofil VARCHAR(255) DEFAULT './img/ProfilPicDefault'
);


CREATE TABLE LISTE (
    idliste NUMBER PRIMARY KEY,
    nomliste VARCHAR(100),
    pseudo_utilisateur VARCHAR2(50),
    CONSTRAINT fk_utilisateur FOREIGN KEY (pseudo_utilisateur)
        REFERENCES utilisateur(pseudo)
);


-- Table Film
CREATE TABLE FILM (
    idfilm NUMBER PRIMARY KEY,
    nomFilm VARCHAR(255),
    duree NUMBER
);



CREATE TABLE SERIE (
    idserie NUMBER PRIMARY KEY,
    nomSerie VARCHAR(255)
);


CREATE TABLE CONTIENTFILM (
    idliste NUMBER,
    idfilm NUMBER,
    PRIMARY KEY (idliste, idfilm),
    CONSTRAINT fk_contientFilm_liste FOREIGN KEY (idliste) 
        REFERENCES liste(idliste),
    CONSTRAINT fk_contientFilm_film FOREIGN KEY (idfilm) 
        REFERENCES film(idfilm),
    ranks CHAR,
    placerank NUMBER
);

CREATE TABLE CONTIENTSERIE (
    idliste NUMBER,
    idserie NUMBER,
    PRIMARY KEY (idliste, idserie),
    CONSTRAINT fk_contientSerie_liste FOREIGN KEY (idliste) 
        REFERENCES liste(idliste),
    CONSTRAINT fk_contientSerie_serie FOREIGN KEY (idserie) 
        REFERENCES serie(idserie),
    ranks CHAR,
    placerank NUMBER
);


CREATE TABLE EPISODE (
    idserie NUMBER,  -- idserie est une clé étrangère
    saison NUMBER,
    episode NUMBER,
    dureeEpisode NUMBER,
    PRIMARY KEY (idserie,saison, episode),  -- La clé primaire est composée uniquement de saison et episode
    CONSTRAINT fk_Episode_IdSerie FOREIGN KEY (idserie) 
        REFERENCES SERIE(idserie)  -- idserie fait référence à la table SERIE
);

 /*    
 Pourquoi une table épisode vu ? 
 car quand un utilisateur ajoutait dans sa liste un episode X d'une saison X aucun moyen de savoir dans qu'elle liste cette épisode etait car il n'etait rattacher a la liste 
 il était rattaché a Serie qui lui était rattacher a la liste donc on doit relier Liste, et EPISODE
 ainsi on peut savoir qu'elle episode a vraiment été rajouter a la liste, probleme c'est que on  n'avais pas d'idSerie DONC DCP, pas de possibilite de savoir a quelle serie cette episode appaartnait
 donc on doit faire une ternaire entre Liste,SerieEpisode
 
 
 */

CREATE TABLE EPISODEVU (
    idserie NUMBER,
    idliste NUMBER,
    saison NUMBER,
    episode NUMBER,
    PRIMARY KEY (idserie, idliste, saison, episode),

    CONSTRAINT FK_LISTE_EPISODEVU FOREIGN KEY (idliste) 
        REFERENCES Liste(idliste),

    -- La contrainte fait référence à la clé primaire (idserie, saison, episode) dans EPISODE
    CONSTRAINT FK_SAISON_EPISODEVU FOREIGN KEY (idserie,saison, episode) 
        REFERENCES EPISODE(idserie,saison, episode)

);




