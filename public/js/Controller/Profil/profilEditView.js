/**
 * @module profilEditView
 * Gère l'édition du profil utilisateur (photo de profil, bannière, pseudo).
 */

import UserFetcher from '../../Model/userFetcher.js';

let newProfilPicUrl = null;
let newBannerUrl = null;
const userFetcher = new UserFetcher();

/**
 * Initialise la vue d’édition du profil :
 * - gestion des uploads d’images,
 * - modification du pseudo,
 * - sauvegarde des nouvelles infos.
 */
function initProfilEditView() {
  // Déclenche les inputs de fichiers
  document.getElementById("new-profilpic").addEventListener("click", () => {
    document.getElementById("fileInputProfilPic").click();
  });

  document.getElementById("new-banner").addEventListener("click", () => {
    document.getElementById("fileInputBanner").click();
  });

  // Upload de la photo de profil
  document.getElementById("fileInputProfilPic").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await userFetcher.uploadImage(file, "PhotoProfil");
      newProfilPicUrl = url;

      const img = document.querySelector("#new-profilpic img");
      if (img) img.src = url;
    } catch (error) {
      alert("Erreur upload image : " + error.message);
    }
  });

  // Upload de la bannière
  document.getElementById("fileInputBanner").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await userFetcher.uploadImage(file, "BannerProfil");
      newBannerUrl = url;

      const img = document.querySelector("#new-banner img");
      if (img) img.src = url;
    } catch (error) {
      alert("Erreur upload image : " + error.message);
    }
  });

  // Bouton de sauvegarde du profil
  document.querySelector(".save-button").addEventListener("click", async (e) => {
    e.preventDefault();

    const inputPseudo = document.getElementById("new-pseudo");
    const newPseudo = inputPseudo.value.trim();

    if (/\s/.test(newPseudo)) {
      alert("Le pseudo ne peut pas contenir d'espaces.");
      return;
    }

    // Ancien pseudo affiché dans le profil
    const oldPseudoElement = document.querySelector(".username p");
    const oldPseudo = oldPseudoElement?.textContent.trim() || "Utilisateur";

    const finalPseudo = newPseudo !== "" ? newPseudo : oldPseudo;
    const finalBanner = newBannerUrl || document.querySelector(".banner").src;
    const finalProfilPic = newProfilPicUrl || document.querySelector(".profile-picture").src;

    console.log("Pseudo utilisé :", finalPseudo);
    console.log("Nouvelle URL de bannière :", finalBanner);
    console.log("Nouvelle URL de photo de profil :", finalProfilPic);

    try {
      const result = await userFetcher.updateUserInfo(finalPseudo, finalBanner, finalProfilPic);
      if (result) {
        alert("Profil mis à jour !");

        inputPseudo.value = "";
        document.getElementById("fileInputProfilPic").value = "";
        document.getElementById("fileInputBanner").value = "";

        newProfilPicUrl = null;
        newBannerUrl = null;

        const profilPicImg = document.querySelector("#new-profilpic img");
        const bannerImg = document.querySelector("#new-banner img");
        if (profilPicImg) profilPicImg.src = "img/Profil/Icon.png";
        if (bannerImg) bannerImg.src = "img/Profil/Icon.png";

        const modal = document.querySelector(".modal");
        if (modal) modal.classList.add("hidden");

        window.location.reload();
      }
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  });
}

export { initProfilEditView };
