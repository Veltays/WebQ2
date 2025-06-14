CREATE SEQUENCE seq_idliste START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER Trigger_IdListe 
    BEFORE INSERT ON liste
    FOR EACH ROW
    WHEN (NEW.idliste IS NULL)
    BEGIN
        SELECT seq_idliste.NEXTVAL INTO :NEW.idliste FROM dual;
    END;






CREATE OR REPLACE TRIGGER Trigger_Update_HEURETOTAL BEFORE
    INSERT OR UPDATE ON utilisateur
    FOR EACH ROW
BEGIN
    :new.nombreheureVisionneTotal := :new.nombreheureVisionnerSerie + :new.nombreheureVisionnerFilm;
END;






CREATE OR REPLACE TRIGGER trigger_update_nbheure_film_vu
AFTER INSERT ON CONTIENTFILM
FOR EACH ROW
DECLARE
    v_duree NUMBER;
    v_nomListe VARCHAR2(50);
BEGIN
    -- Récupérer le nom de la liste
    SELECT NomListe INTO v_nomListe
    FROM LISTE
    WHERE idliste = :NEW.idliste;

    IF UPPER(v_nomListe) = 'VU' THEN
        -- Si c'est une liste de films vus, on met à jour les heures
        SELECT duree INTO v_duree
        FROM FILM
        WHERE idfilm = :NEW.idfilm;

        UPDATE UTILISATEUR
        SET nombreheureVisionnerFilm = nombreheureVisionnerFilm + v_duree,
            nombreheureVisionneTotal = nombreheureVisionneTotal + v_duree
        WHERE pseudo = (
            SELECT pseudo_utilisateur
            FROM LISTE
            WHERE idliste = :NEW.idliste
        );
    END IF;
END;






CREATE OR REPLACE TRIGGER trigger_update_nbheure_episodevu
AFTER INSERT ON EPISODEVU
FOR EACH ROW
DECLARE
    v_duree NUMBER;
    v_nomListe VARCHAR2(50);
BEGIN
    -- Récupérer le nom de la liste
    SELECT NomListe INTO v_nomListe
    FROM LISTE
    WHERE idliste = :NEW.idliste;

    IF UPPER(v_nomListe) = 'VU' THEN
        -- Si c'est une liste VU, on récupère la durée de l'épisode
        SELECT dureeEpisode INTO v_duree
        FROM EPISODE
        WHERE idserie = :NEW.idserie
          AND saison = :NEW.saison
          AND episode = :NEW.episode;

        -- Puis on met à jour l'utilisateur
        UPDATE UTILISATEUR
        SET nombreheureVisionnerSerie = nombreheureVisionnerSerie + v_duree,
            nombreheureVisionneTotal = nombreheureVisionneTotal + v_duree
        WHERE pseudo = (
            SELECT pseudo_utilisateur
            FROM LISTE
            WHERE idliste = :NEW.idliste
        );
    END IF;
END;







