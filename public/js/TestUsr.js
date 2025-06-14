import UserManager from "./class/UserFetcher.js";
const UserManagerObj = new UserManager();





/************************************************************* */
/*********************** GET USERDATA **************************/
/************************************************************* */
let dataUsr = await UserManagerObj.GetUserData(); // Récupère les données de l'utilisateur après la connexion
console.log(dataUsr); // Affiche les données de l'utilisateur dans la console





/************************************************************* */
/*********************** SET NEWLIST ***************************/
/************************************************************* */

let NewListe = await UserManagerObj.SetNewList("Film action"); // Récupère la liste de films de l'utilisateur
console.log(NewListe); // Affiche la liste de films dans la console


/************************************************************* */
/******************** GET ALLUSER LIST *************************/
/************************************************************* */
let AllList = await UserManagerObj.GetAllUserList(); // Récupère toutes les listes de films de l'utilisateur

for (let i = 0; i < AllList.length; i++) {
    console.log("Liste " + (i + 1) + " : " + AllList[i].nomliste); // Affiche le nom de chaque liste dans la console
}


/************************************************************* */
/******************** ADDFILMTOLIST *************************/
/************************************************************* */

let filmid = 550; // ID du film à ajouter (fightclub)
let listeid = AllList[1].idliste; // ID de la liste dans laquelle ajouter le film (Liste Vu)  
let resultAjout = await UserManagerObj.SetNewFilmOnList(filmid, listeid); // Ajoute le film à la liste
console.log(resultAjout); // Affiche le résultat de l'ajout dans la console



/************************************************************* */
/******************** ADDSERIETOLIST *************************/
/************************************************************* */

let serieid = 42821;
let listeid2 = AllList[1].idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)

let CreationSerie = await UserManagerObj.SetNewSerieOnList(serieid, listeid2)
console.log("Création de la série " + serieid + " dans la liste " + listeid2 + " : " + CreationSerie); // Affiche le résultat de la création dans la console



/************************************************************* */
/***************** ADD EPISODE TO SERIE ***********************/
/************************************************************* */

let episode = 1; 
let saison = 1;

let resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid, saison, episode)
console.log("Ajout de l'épisode 1 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console

episode = 2; 
resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid, saison, episode)
console.log("Ajout de l'épisode 2 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console

episode = 3; 
resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid, saison, episode)
console.log("Ajout de l'épisode 3 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console

episode = 4; 
resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid, saison, episode)
console.log("Ajout de l'épisode 4 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console

episode = 5; 
resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid, saison, episode)
console.log("Ajout de l'épisode 5 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console


listeid2 = AllList[1].idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)
episode = 4; 
resultAjoutSerie = await UserManagerObj.SetNewEpisodeOnSérie(serieid, listeid2, saison, episode)
console.log("Ajout de l'épisode 3 de la saison 1 de la série " + serieid + " à la liste " + listeid2 + " : " + resultAjoutSerie); // Affiche le résultat de l'ajout dans la console




/************************************************************* */
/***************** DELETE FILM OF LIST ***********************/
/************************************************************* */


listeid = AllList[1].idliste;
let SuppressionFilm = await UserManagerObj.DeleteFilmOnList(filmid, listeid); // Supprime le film de la liste
console.log("Suppression du film " + filmid + " de la liste " + listeid + " : " + SuppressionFilm); // Affiche le résultat de la suppression dans la console




/************************************************************* */
/***************** DELETE EPISODE OF SERIE ***********************/
/************************************************************* */


listeid = AllList[1].idliste; // ID de la liste dans laquelle supprimer la série (Liste Vu)
let SuppressionSerie = await UserManagerObj.DeleteSerieOnList(serieid, listeid,saison,1); // Supprime la série de la liste (serieid, listeid, saison, episode)
console.log("Suppression de la série " + serieid + " de la liste " + listeid + " : " + SuppressionSerie); // Affiche le résultat de la suppression dans la console

SuppressionSerie = await UserManagerObj.DeleteSerieOnList(serieid, listeid,saison,2); // Supprime la série de la liste (serieid, listeid, saison, episode)
console.log("Suppression de la série " + serieid + " de la liste " + listeid + " : " + SuppressionSerie); // Affiche le résultat de la suppression dans la console

SuppressionSerie = await UserManagerObj.DeleteSerieOnList(serieid, listeid,saison,3); // Supprime la série de la liste (serieid, listeid, saison, episode)
console.log("Suppression de la série " + serieid + " de la liste " + listeid + " : " + SuppressionSerie); // Affiche le résultat de la suppression dans la console


SuppressionSerie = await UserManagerObj.DeleteSerieOnList(serieid, listeid,saison,4); // Supprime la série de la liste (serieid, listeid, saison, episode)
console.log("Suppression de la série " + serieid + " de la liste " + listeid + " : " + SuppressionSerie); // Affiche le résultat de la suppression dans la console




/************************************************************* */
/***************** DELETE LIST  ***********************/
/************************************************************* */


//insertion film et serie dans Alllist2 pour tester la suppression de liste

filmid = 552; // ID du film à ajouter (fightclub)
listeid = AllList[2].idliste; // ID de la liste dans laquelle ajouter le film (Liste Vu)  
resultAjout = await UserManagerObj.SetNewFilmOnList(filmid, listeid); // Ajoute le film à la liste
console.log(resultAjout); // Affiche le résultat de l'ajout dans la console

serieid = 42822;
listeid2 = AllList[2].idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)

CreationSerie = await UserManagerObj.SetNewSerieOnList(serieid, listeid2)
console.log("Création de la série " + serieid + " dans la liste " + listeid2 + " : " + CreationSerie); // Affiche le résultat de la création dans la console




let SuppressionListe = await UserManagerObj.DeleteList(AllList[2].idliste); // Supprime la liste de l'utilisateur
console.log("Suppression de la liste " + AllList[1].idliste + " : " + SuppressionListe); // Affiche le résultat de la suppression dans la console




/************************************************************* */
/***************** UPDATE USERDATA   ***********************/
/************************************************************* */

let newPseudo = 'Velteur'
let newBanniere = 'caca'
let newProfilPic = 'pipi'

let UpdateDataUser = await UserManagerObj.UpdateUserInfo(newPseudo, newBanniere, newProfilPic); // Met à jour les données de l'utilisateur
console.log("Mise à jour des données de l'utilisateur : " + UpdateDataUser); // Affiche le résultat de la mise à jour dans la console


/************************************************************* */
/***************** UPDATE RANKFilm   ***********************/
/************************************************************* */
console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
NewListe = await UserManagerObj.SetNewList("TestRank"); // Récupère la liste de films de l'utilisateur
console.log(NewListe); // Affiche la liste de films dans la console


AllList = await UserManagerObj.GetAllUserList(); // Récupère toutes les listes de films de l'utilisateur
console.log(AllList); // Affiche toutes les listes de films dans la console
let ListeRank = AllList.find((list) => list.nomliste === "TestRank");
console.log(ListeRank);





filmid = 551; 
listeid = ListeRank.idliste; 
resultAjout = await UserManagerObj.SetNewFilmOnList(filmid, listeid); 
console.log(resultAjout); 

filmid = 550; 
resultAjout = await UserManagerObj.SetNewFilmOnList(filmid, listeid); 
console.log(resultAjout); 

filmid = 549; 
resultAjout = await UserManagerObj.SetNewFilmOnList(filmid, listeid); 
console.log(resultAjout); 

let ResultUpdateRank = await UserManagerObj.UpdateRankFilm(filmid, listeid, "S", 1); 
console.log("Mise à jour du rang du film " + filmid + " dans la liste " + listeid + " : ", ResultUpdateRank);



/************************************************************* */
/***************** UPDATE RANK SERIE   ***********************/
/************************************************************* */

console.log('\n\n\n\n\n\n\n');
NewListe = await UserManagerObj.SetNewList("TestRankSerie"); // Récupère la liste de films de l'utilisateur
console.log(NewListe); // Affiche la liste de films dans la console

AllList = await UserManagerObj.GetAllUserList(); // Récupère toutes les listes de films de l'utilisateur

console.log(AllList); // Affiche toutes les listes de films dans la console

let ListeRankSerie = AllList.find((list) => list.nomliste === "TestRankSerie");
console.log(ListeRankSerie);

let serieId = 42821 // ID de la série à ajouter NHk
listeid = ListeRankSerie.idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)
resultAjout = await UserManagerObj.SetNewSerieOnList(serieId, listeid); // Ajoute la série à la liste
console.log(resultAjout); // Affiche le résultat de l'ajout dans la console

serieid = 42822; // ID de la série à ajouter NHk
listeid = ListeRankSerie.idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)
resultAjout = await UserManagerObj.SetNewSerieOnList(serieid, listeid); // Ajoute la série à la liste
console.log(resultAjout); // Affiche le résultat de l'ajout dans la console

serieid = 42823; // ID de la série à ajouter NHk
listeid = ListeRankSerie.idliste; // ID de la liste dans laquelle ajouter la série (Liste Vu)
resultAjout = await UserManagerObj.SetNewSerieOnList(serieid, listeid); // Ajoute la série à la liste
console.log(resultAjout); // Affiche le résultat de l'ajout dans la console


let ResultUpdateRankSerie = await UserManagerObj.UpdateRankSerie(serieid, listeid, "S", 1);
console.log("Mise à jour du rang de la série " + serieid + " dans la liste " + listeid + " : ", ResultUpdateRankSerie);



/************************************************************* */
/***************** UPDATE LIST    ***********************/
/************************************************************* */

console.log('\n\n\n\n\n\n\n');
NewListe = await UserManagerObj.SetNewList("TestUpdateList"); // Récupère la liste de films de l'utilisateur

AllList = await UserManagerObj.GetAllUserList(); // Récupère toutes les listes de films de l'utilisateur

console.log(AllList); // Affiche toutes les listes de films dans la console

let ListeTestUpdate = AllList.find((list) => list.nomliste === "TestUpdateList");
console.log(ListeTestUpdate); // Affiche la liste de films dans la console

let NewNomListe = "succes"

let NewList = await UserManagerObj.UpdateListName(ListeTestUpdate.idliste, NewNomListe); // Met à jour le nom de la liste
console.log("Mise à jour du nom de la liste " + ListeTestUpdate.idliste + " : " + NewList); // Affiche le résultat de la mise à jour dans la console



/************************************************************* */
/***************** GET ALL FILM FROM LIST  ***********************/
/************************************************************* */


let AllFilm = await UserManagerObj.getAllFilmFromList(ListeRank.idliste); // Récupère tous les films de la liste
console.log("Tous les films de la liste " + ListeTestUpdate.idliste + " : ", AllFilm); // Affiche tous les films de la liste dans la console



/************************************************************* */
/***************** GET ALL Serie FROM LIST  ***********************/
/************************************************************* */

let AllSerie = await UserManagerObj.getAllSerieFromList(ListeRankSerie.idliste); // Récupère toutes les séries de la liste
console.log("Toute les série de la liste" + ListeRankSerie.idliste + " : ", AllSerie); // Affiche toutes les séries de la liste dans la console