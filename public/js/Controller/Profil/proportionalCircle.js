/**
 * Met à jour dynamiquement les cercles SVG (jours, heures, minutes + total).
 */
export function initProportionalCircles() {
  const smallConfig = [
    { id: "number2", circleId: "little1", max: 30 }, // jours film
    { id: "number3", circleId: "little2", max: 24 }, // heures film
    { id: "number4", circleId: "little3", max: 60 }, // minutes film

    { id: "number6", circleId: "little4", max: 30 }, // jours série
    { id: "number7", circleId: "little5", max: 24 }, // heures série
    { id: "number8", circleId: "little6", max: 60 }, // minutes série
  ];

  smallConfig.forEach(({ id, circleId, max }) => {
    const valueElem = document.getElementById(id);
    const circle = document.getElementById(circleId);
    if (!valueElem || !circle) return;

    const value = parseInt(valueElem.textContent.trim());
    const percent = Math.min(100, (value / max) * 100);
    setCircleProgress(circle, percent);
  });

  // Grands cercles (films / séries)
  updateBigCircle("number1", "big-film", 500); // max 500 heures pour le cercle film
  updateBigCircle("number5", "big-serie", 500); // max 500 heures pour le cercle série
}

/**
 * Applique une progression (%) sur un cercle SVG avec stroke-dashoffset.
 */
function setCircleProgress(circle, percent) {
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  console.log(`Circumference: ${circumference}, Percent: ${percent}`);
  circle.style.strokeDasharray = `${circumference} ${circumference}`;

  // 👇 Corrige l'affichage à 0%
  const dashOffset = percent <= 0 ? circumference : circumference * (1 - percent / 100);

  circle.style.strokeDashoffset = dashOffset;
}

/**
 * Gère le grand cercle central pour les heures totales.
 */
function updateBigCircle(numberId, circleId) {
  const numberElem = document.getElementById(numberId);
  const circle = document.getElementById(circleId);
  if (!numberElem || !circle) return;

  const totalMinutes = extractTotalMinutes(numberId); // ex : 1h32 = 92min
  const remainingMinutes = totalMinutes % 60;
  const percent = (remainingMinutes / 60) * 100;

  setCircleProgress(circle, percent);
}



function extractTotalMinutes(numberId) {
  if (numberId === "number1") {
    const jours = parseInt(document.getElementById("number2").textContent.trim());
    const heures = parseInt(document.getElementById("number3").textContent.trim());
    const minutes = parseInt(document.getElementById("number4").textContent.trim());
    return (jours * 24 * 60) + (heures * 60) + minutes;
  } else if (numberId === "number5") {
    const jours = parseInt(document.getElementById("number6").textContent.trim());
    const heures = parseInt(document.getElementById("number7").textContent.trim());
    const minutes = parseInt(document.getElementById("number8").textContent.trim());
    return (jours * 24 * 60) + (heures * 60) + minutes;
  }
  return 0;
}