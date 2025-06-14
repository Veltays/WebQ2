/**
 * @module genreMap
 * Ce module contient une correspondance entre les identifiants de genres TMDb
 * et leurs noms lisibles (en camelCase) pour les films et les séries.
 */

const genreMap = {
  // Film
  0: "tendance",
  28: "action",
  12: "adventure",
  16: "animation",
  35: "comedy",
  80: "crime",
  99: "documentary",
  18: "drama",
  10751: "family",
  14: "fantasy",
  36: "history",
  27: "horror",
  10402: "music",
  9648: "mystery",
  10749: "romance",
  878: "scienceFiction",
  10770: "tvMovie",
  53: "thriller",
  10752: "war",
  37: "western",

  // Série TV
  10759: "actionAdventure",
  10762: "kids",
  10763: "news",
  10764: "reality",
  10765: "sciFiFantasy",
  10766: "soap",
  10767: "talk",
  10768: "warPolitics"
};

export default genreMap;
