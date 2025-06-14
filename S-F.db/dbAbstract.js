/**
 * Classe abstraite représentant un connecteur de base de données selon un type donné (FILM, SERIE, UTILISATEUR).
 * Fournit une méthode pour changer dynamiquement le type ciblé.
 */
class DbAbstract {
  /**
   * Initialise une instance avec un type de ressource par défaut ou spécifié.
   * @param {string} [type='FILM'] - Type de la ressource ciblée ('FILM', 'SERIE', 'UTILISATEUR').
   * @throws {Error} Si le type est invalide.
   */
  constructor(type = 'FILM') {
    this.setType(type);
  }

  /**
   * Définit le type de ressource de l'instance.
   * Accepte également les alias comme 'user' ou 'utilisateur'.
   * @param {string} type - Type de la ressource ('FILM', 'SERIE', 'UTILISATEUR').
   * @throws {Error} Si le type n'est pas supporté.
   */
  setType(type) {
    if(type === 'user' || type === 'utilisateur') {
      type = 'UTILISATEUR';
    }

    const upperType = type.toUpperCase();
    if (upperType === 'FILM' || upperType === 'SERIE' || upperType === 'UTILISATEUR') {
      this.type = upperType;
    }
    else {
      throw new Error("Type invalide. Utilisez 'Film' ou 'Serie' ou 'utilisateur'.");
    }
  }

  /**
   * Alias pour changer dynamiquement le type de ressource.
   * @param {string} type - Nouveau type à définir.
   */
  ChangerType(type) {
    this.setType(type);
  }
}

export default DbAbstract;
