// -----------------------------------------------------------
// Plataforma gamificada: "El viatge de la Dragueta del Bon Rotllo"
// Nivell: 3r de primària (Catalunya)
// Objectiu educatiu: fomentar la convivència, el respecte, el treball cooperatiu
// i l'autoregulació del comportament, alineat amb el Decret 175/2022.
// Tot el text visible és en català estàndard.
// -----------------------------------------------------------

// Constants fàcilment modificables pel docent
const DEFAULT_OBJECTIU_PUNTS = 100;
const PUNTS_BON_COMPORTAMENT = 1;
const PUNTS_MAL_COMPORTAMENT = -1;

// Claus de localStorage
const LS_PUNTS = "puntsGrup";
const LS_RECOMPENSA = "recompensaText";
const LS_POSITIUS = "comptadorPositius";
const LS_NEGATIUS = "comptadorNegatius";
const LS_OBJECTIU = "objectiuPunts";

// Estat en memòria
let puntsGrup = 0;
let recompensaText = "";
let puntsAnteriors = 0; // per detectar quan es travessa el llindar de celebració
let comptadorPositius = 0; // registre per partida
let comptadorNegatius = 0; // registre per partida
let objectiuPunts = DEFAULT_OBJECTIU_PUNTS; // objectiu configurable

// Referències del DOM
const elPuntsActuals = document.getElementById("puntsActuals");
const elObjectiuPunts = document.getElementById("objectiuPunts");
const elBarraProgres = document.getElementById("barraProgres");
const elDragueta = document.getElementById("dragueta");
const elMissatgeAnims = document.getElementById("missatgeAnims");
const elTextLog = document.getElementById("textLog");
const elDarrerCanvi = document.getElementById("darrerCanvi");
const elRecompensa = document.getElementById("recompensaText");
const elBtnDesarAjustos = document.getElementById("btnDesarAjustos");
const elBtnBo = document.getElementById("btnBo");
const elBtnDolent = document.getElementById("btnDolent");
const elBtnReiniciar = document.getElementById("btnReiniciar");
const elInputPunts = document.getElementById("inputPunts");
const elBtnCanviarPunts = document.getElementById("btnCanviarPunts");
const elInputObjectiu = document.getElementById("inputObjectiu");
const elBtnCanviarObjectiu = document.getElementById("btnCanviarObjectiu");
const elCountPositius = document.getElementById("countPositius");
const elCountNegatius = document.getElementById("countNegatius");
const elModal = document.getElementById("modal");
const elModalText = document.getElementById("modalText");
const elModalRecompensa = document.getElementById("modalRecompensa");
const elTancarModal = document.getElementById("tancarModal");
const elEcoImg = document.getElementById("ecoImg");

// -----------------------------------------------------------
// Inicialització
// -----------------------------------------------------------
function inicialitzarAplicacio() {
  // 1) Recuperem estat de localStorage (si existeix)
  const puntsGuardats = Number(localStorage.getItem(LS_PUNTS));
  const recompensaGuardada = localStorage.getItem(LS_RECOMPENSA);
  const posGuardats = Number(localStorage.getItem(LS_POSITIUS));
  const negGuardats = Number(localStorage.getItem(LS_NEGATIUS));
  const objectiuGuardat = Number(localStorage.getItem(LS_OBJECTIU));

  if (!Number.isNaN(puntsGuardats) && puntsGuardats >= 0) {
    puntsGrup = puntsGuardats;
  } else {
    puntsGrup = 0;
    localStorage.setItem(LS_PUNTS, String(puntsGrup));
  }

  if (typeof recompensaGuardada === "string" && recompensaGuardada.trim().length > 0) {
    recompensaText = recompensaGuardada.trim();
  } else {
    recompensaText = "D'on ve l'Eco?";
    localStorage.setItem(LS_RECOMPENSA, recompensaText);
  }

  if (!Number.isNaN(posGuardats) && posGuardats >= 0) {
    comptadorPositius = posGuardats;
  } else {
    comptadorPositius = 0;
    localStorage.setItem(LS_POSITIUS, String(comptadorPositius));
  }

  if (!Number.isNaN(negGuardats) && negGuardats >= 0) {
    comptadorNegatius = negGuardats;
  } else {
    comptadorNegatius = 0;
    localStorage.setItem(LS_NEGATIUS, String(comptadorNegatius));
  }

  // 2) Pintem valors inicials
  if (!Number.isNaN(objectiuGuardat) && objectiuGuardat > 0) {
    objectiuPunts = Math.floor(objectiuGuardat);
  } else {
    objectiuPunts = DEFAULT_OBJECTIU_PUNTS;
    localStorage.setItem(LS_OBJECTIU, String(objectiuPunts));
  }

  elObjectiuPunts.textContent = String(objectiuPunts);
  elRecompensa.value = recompensaText;
  if (elInputPunts) elInputPunts.value = String(puntsGrup);
  if (elInputObjectiu) elInputObjectiu.value = String(objectiuPunts);

  // 3) Assignem esdeveniments dels botons
  elBtnBo.addEventListener("click", () => actualitzarPunts(PUNTS_BON_COMPORTAMENT));
  elBtnDolent.addEventListener("click", () => actualitzarPunts(PUNTS_MAL_COMPORTAMENT));
  elBtnReiniciar.addEventListener("click", reiniciarMarcador);
  elBtnDesarAjustos.addEventListener("click", guardarAjustos);
  if (elBtnCanviarPunts) {
    elBtnCanviarPunts.addEventListener("click", canviarPuntsManual);
  }
  elBtnCanviarObjectiu.addEventListener("click", canviarObjectiuPartida);
  elTancarModal.addEventListener("click", tancarCelebracio);
  elModal.addEventListener("click", (ev) => {
    // Tancar si es clica fora del contingut
    if (ev.target === elModal) tancarCelebracio();
  });

  // 3.1) Fallbacks de la imatge d'Eco si no carrega
  configurarImatgeEco();

  // 4) Refresquem la UI
  actualitzarUI();
}

function configurarImatgeEco() {
  if (!elEcoImg) return;
  let intent = 0;
  elEcoImg.addEventListener(
    "error",
    () => {
      if (intent === 0) {
        intent += 1;
        // Primer intent: provar fitxer local
        elEcoImg.src = "eco.png";
        elEcoImg.alt = "Eco";
      } else {
        // Segon intent: mostrar emoji de fallback i avisar
        const contenidor = document.getElementById("dragueta");
        if (contenidor) {
          elEcoImg.style.display = "none";
          contenidor.textContent = "🐉";
        }
        if (elDarrerCanvi) {
          elDarrerCanvi.textContent =
            "No s'ha pogut carregar la imatge de l'Eco. Desa 'eco.png' al mateix directori per veure-la.";
        }
      }
    },
    { once: false }
  );
}

// -----------------------------------------------------------
// Lògica de puntuació i UI
// -----------------------------------------------------------
function actualitzarPunts(delta) {
  // Guardem el valor anterior per comprovar el pas de llindar
  puntsAnteriors = puntsGrup;

  const textComentari = elTextLog.value.trim();

  // Calculem nou marcador, sense baixar de 0
  const nou = Math.max(0, puntsGrup + delta);
  puntsGrup = nou;
  localStorage.setItem(LS_PUNTS, String(puntsGrup));

  // Actualitzem compte de positius/negatius
  if (delta > 0) {
    comptadorPositius += 1;
    localStorage.setItem(LS_POSITIUS, String(comptadorPositius));
  } else if (delta < 0) {
    comptadorNegatius += 1;
    localStorage.setItem(LS_NEGATIUS, String(comptadorNegatius));
  }

  // Mostrem darrer canvi
  if (delta > 0) {
    elDarrerCanvi.textContent = textComentari
      ? `+${delta} punt: ${textComentari}`
      : `+${delta} punt per bon comportament`;
  } else if (delta < 0) {
    elDarrerCanvi.textContent = textComentari
      ? `${delta} punt: ${textComentari}`
      : `${delta} punt per mal comportament`;
  } else {
    elDarrerCanvi.textContent = textComentari || "Sense canvis";
  }

  // Esborrem el comentari per a la propera acció
  elTextLog.value = "";

  // Refresquem UI
  const abansSotaObjectiu = puntsAnteriors < objectiuPunts;
  actualitzarUI();

  // Si travessa el llindar cap amunt, celebrem
  if (abansSotaObjectiu && puntsGrup >= objectiuPunts) {
    mostrarCelebracio();
  }
}

function actualitzarUI() {
  // Actualitzem marcador numèric
  elPuntsActuals.textContent = String(puntsGrup);
  if (elInputPunts) elInputPunts.value = String(puntsGrup);
  elCountPositius.textContent = String(comptadorPositius);
  elCountNegatius.textContent = String(comptadorNegatius);

  // Percentatge de progrés (0..1) i amplada de la barra
  const percent = Math.max(0, Math.min(1, puntsGrup / objectiuPunts));
  elBarraProgres.style.width = `${percent * 100}%`;

  // Posició de la Dragueta al llarg del camí
  // Situem l'emoji en funció de l'amplada visible de la via
  requestAnimationFrame(() => {
    const via = document.querySelector(".via");
    if (!via) return;
    const { width } = via.getBoundingClientRect();
    elDragueta.style.left = `${percent * width}px`;
  });

  // Missatge d'ànims
  if (puntsGrup >= objectiuPunts) {
    elMissatgeAnims.textContent = "Objectiu assolit! Podeu continuar sumant o reiniciar.";
  } else {
    const restants = objectiuPunts - puntsGrup;
    if (restants <= 10) {
      elMissatgeAnims.textContent = "Esteu molt a prop de la recompensa cooperativa!";
    } else {
      elMissatgeAnims.textContent = `Encara us queden ${restants} punts per arribar a l'objectiu, ànims!`;
    }
  }
}

// -----------------------------------------------------------
// Persistència d'ajustos
// -----------------------------------------------------------
function guardarAjustos() {
  // Desa el text de recompensa configurat pel mestre
  const text = elRecompensa.value.trim();
  recompensaText = text.length > 0 ? text : "D'on ve l'Eco?";
  localStorage.setItem(LS_RECOMPENSA, recompensaText);
  elDarrerCanvi.textContent = "Recompensa desada";
}

// -----------------------------------------------------------
// Celebració i modal
// -----------------------------------------------------------
function mostrarCelebracio() {
  // Text de celebració + recompensa configurada
  const guardada = localStorage.getItem(LS_RECOMPENSA);
  const text = typeof guardada === "string" && guardada.trim().length > 0
    ? guardada.trim()
    : recompensaText || "D'on ve l'Eco?";

  elModalRecompensa.textContent = `Recompensa cooperativa: ${text}`;
  elModal.setAttribute("aria-hidden", "false");

  // Portem el focus al botó de tancar per accessibilitat
  setTimeout(() => elTancarModal.focus(), 0);
}

function tancarCelebracio() {
  elModal.setAttribute("aria-hidden", "true");
}

// -----------------------------------------------------------
// Reiniciar marcador
// -----------------------------------------------------------
function reiniciarMarcador() {
  const confirmar = window.confirm("Segur que vols reiniciar el marcador a 0?");
  if (!confirmar) return;

  puntsAnteriors = puntsGrup;
  puntsGrup = 0;
  localStorage.setItem(LS_PUNTS, String(puntsGrup));
  // Reiniciem els comptadors de la partida
  comptadorPositius = 0;
  comptadorNegatius = 0;
  localStorage.setItem(LS_POSITIUS, String(comptadorPositius));
  localStorage.setItem(LS_NEGATIUS, String(comptadorNegatius));
  actualitzarUI();
  tancarCelebracio();
  elDarrerCanvi.textContent = "Marcador reiniciat";
}

// Inici
window.addEventListener("DOMContentLoaded", inicialitzarAplicacio);

// -----------------------------------------------------------
// Canvi de l'objectiu de punts de la partida
// -----------------------------------------------------------
function canviarPuntsManual() {
  const valor = Number(elInputPunts.value);
  if (Number.isNaN(valor) || valor < 0) {
    elDarrerCanvi.textContent = "Introdueix un nombre vàlid (≥ 0).";
    return;
  }

  const abansSotaObjectiu = puntsGrup < objectiuPunts;
  puntsAnteriors = puntsGrup;
  puntsGrup = Math.floor(valor);
  localStorage.setItem(LS_PUNTS, String(puntsGrup));
  actualitzarUI();
  elDarrerCanvi.textContent = `Punts actuals fixats a ${puntsGrup}.`;

  if (abansSotaObjectiu && puntsGrup >= objectiuPunts) {
    mostrarCelebracio();
  }
}
// -----------------------------------------------------------
function canviarObjectiuPartida() {
  const valor = Number(elInputObjectiu.value);
  if (Number.isNaN(valor) || valor <= 0) {
    elDarrerCanvi.textContent = "Introdueix un objectiu vàlid (> 0).";
    return;
  }

  const objectiuAnterior = objectiuPunts;
  objectiuPunts = Math.floor(valor);
  localStorage.setItem(LS_OBJECTIU, String(objectiuPunts));
  elObjectiuPunts.textContent = String(objectiuPunts);

  // Recalcula UI i comprova si ja s'assoleix amb el nou objectiu
  const abansSotaObjectiu = puntsGrup < objectiuAnterior;
  actualitzarUI();
  elDarrerCanvi.textContent = `Objectiu de la partida fixat a ${objectiuPunts} punts.`;

  if (abansSotaObjectiu && puntsGrup >= objectiuPunts) {
    mostrarCelebracio();
  }
}
/*
 El viatge de l'Eco — © 2025 Raül Torres
 Codi sota llicència GNU AGPL v3. Vegeu LICENSE.txt
 Més informació: https://raultorres-ia.github.io/apps/gamificacio_eco/index.html
*/
