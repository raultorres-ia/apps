// Si canvies els noms o vols afegir més àudios, només cal editar aquesta llista.
// IMPORTANT: col·loca els arxius MP3 dins la carpeta assets/audio/.
const audios = [
  {
    id: "instruccions",
    label: "Instruccions",
    icon: "📘",
    src: "assets/audio/01_instruccions.mp3",
  },
  {
    id: "casa",
    label: "Casa",
    icon: "🏠",
    src: "assets/audio/02_casa.mp3",
  },
  {
    id: "cotxe",
    label: "Cotxe",
    icon: "🚗",
    src: "assets/audio/03_cotxe.mp3",
  },
  {
    id: "arbre-sol",
    label: "Arbre i sol",
    icon: "🌳",
    src: "assets/audio/04_arbre_sol.mp3",
  },
];

const grid = document.getElementById("audioGrid");
const items = [];

function pauseOthers(currentAudio) {
  items.forEach(({ audio, card, state }) => {
    if (audio !== currentAudio) {
      audio.pause();
      card.classList.remove("is-playing");
      state.textContent = "Preparat";
    }
  });
}

function buildCard(item) {
  const card = document.createElement("article");
  card.className = "audio-card";

  const head = document.createElement("div");
  head.className = "audio-head";

  const icon = document.createElement("div");
  icon.className = "icon-wrap";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = item.icon;

  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.className = "audio-title";
  title.textContent = item.label;

  const state = document.createElement("p");
  state.className = "state";
  state.textContent = "Preparat";

  titleWrap.append(title, state);
  head.append(icon, titleWrap);

  const controls = document.createElement("div");
  controls.className = "controls";

  const playBtn = document.createElement("button");
  playBtn.className = "btn";
  playBtn.type = "button";
  playBtn.textContent = "▶️"; // Play symbol
  playBtn.setAttribute("aria-label", "Reproducir");

  const pauseBtn = document.createElement("button");
  pauseBtn.className = "btn";
  pauseBtn.type = "button";
  pauseBtn.textContent = "⏸️"; // Pause symbol
  pauseBtn.setAttribute("aria-label", "Pausa");

  const restartBtn = document.createElement("button");
  restartBtn.className = "btn btn-restart";
  restartBtn.type = "button";
  restartBtn.textContent = "🔄"; // Restart symbol
  restartBtn.setAttribute("aria-label", "Tornar a començar");

  const audio = document.createElement("audio");
  audio.src = item.src;
  audio.preload = "none";

  playBtn.addEventListener("click", async () => {
    pauseOthers(audio);
    try {
      await audio.play();
      card.classList.add("is-playing");
      state.textContent = "Sonant ara";
    } catch (_err) {
      state.textContent = "No s'ha pogut reproduir";
    }
  });

  pauseBtn.addEventListener("click", () => {
    audio.pause();
    card.classList.remove("is-playing");
    state.textContent = "En pausa";
  });

  restartBtn.addEventListener("click", async () => {
    pauseOthers(audio);
    audio.currentTime = 0;
    try {
      await audio.play();
      card.classList.add("is-playing");
      state.textContent = "Sonant des de l'inici";
    } catch (_err) {
      state.textContent = "No s'ha pogut reproduir";
    }
  });

  audio.addEventListener("ended", () => {
    card.classList.remove("is-playing");
    state.textContent = "Acabat";
  });

  controls.append(playBtn, pauseBtn, restartBtn);
  card.append(head, controls, audio);

  return { card, audio, state };
}

audios.forEach((item) => {
  const built = buildCard(item);
  items.push(built);
  grid.appendChild(built.card);
});
