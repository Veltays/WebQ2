import UserFetcher from "../../Model/userFetcher.js";

const userFetcher = new UserFetcher();

/**
 * Vérifie si l'utilisateur est connecté (via token). Redirige vers login si absent.
 */
function isUserConnected() {
    const token = userFetcher.getCookie('token');
    if (!token) {
        console.log("Aucun token trouvé, utilisateur non connecté.");
        window.location.href = "./login.html";
    }
}

/**
 * Initialise l'en-tête utilisateur : image de profil + lien vers la page profil.
 */
async function initUserHeader() {
    const profilPicture = document.querySelector(".ProfilButtonImg");
    const profilLink = document.querySelector(".LienProfil");

    const token = userFetcher.getCookie('token');

    if (token) {
        const userData = await userFetcher.getUserData();

        const profilePic = userData.photodeprofil || './img/PhotoProfil/Default.jpg';
        profilPicture.src = profilePic;
        profilLink.href = `./profil.html?user=${userData.pseudo}`;

        console.log("Token trouvé : " + token);
    } else {
        profilPicture.src = './img/Film/DefaultPP.png';
        profilLink.href = "./login.html";
    }
}

export { initUserHeader, isUserConnected };
