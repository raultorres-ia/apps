/**
 * L'Aventura de les Coordenades - 4t de Primària
 * Aplicació educativa interactiva per treballar el pla cartesià i les quadrícules.
 * © 2026 Raül Torres | Codi: AGPL v3 | Continguts: CC BY-SA 4.0
 */

(() => {
  'use strict';

  // ==================== GLOBAL STATE & GAMIFICATION ====================
  const AVATARS = ['🏴‍☠️', '🧑‍🚀', '🧭', '🤖', '🦊', '🐬', '🧙‍♀️'];
  const RANKS = [
    { min: 0, name: 'Grumet', emoji: '🥉' },
    { min: 50, name: 'Explorador/a', emoji: '🥈' },
    { min: 120, name: 'Navegant', emoji: '🥇' },
    { min: 220, name: 'Cartògraf/a', emoji: '🏆' },
    { min: 350, name: 'Capità/na Estel·lar', emoji: '👑' }
  ];

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const state = {
    avatarIdx: 0,
    score: 0,
    streak: 0,
    soundEnabled: true,
    activeMode: 'explora',

    // Mode 1: Explora
    exploreType: 'points', // 'points' (0..8) or 'cells' (A..H, 1..8)
    exploreX: 3,
    exploreY: 4,

    // Mode 2: Caça del Tresor
    treasureType: 'points', // 'points' or 'cells'
    treasureChallengeKind: 'click', // 'click' (locate on map) or 'write' (identify coords)
    treasureTargetX: 5,
    treasureTargetY: 3,
    treasureItem: { emoji: '💎', name: 'el cofre de diamants' },
    treasureSolved: false,
    treasureShowHint: false,
    treasureLastClick: null,

    // Mode 3: Dibuix Secret
    currentDrawingKey: 'star',
    drawProgressIdx: 0,
    drawCompleted: false,

    // Mode 4: Robot Explorador
    robotStart: { x: 1, y: 1 },
    robotPos: { x: 1, y: 1 },
    robotStar: { x: 4, y: 3, collected: false },
    robotGoal: { x: 7, y: 6 },
    robotObstacles: [],
    robotPath: [{ x: 1, y: 1 }],
    robotWon: false,

    // Mode 5: Radar d'Illes (7x7 cells: A-G, 1-7)
    fleetSize: 7,
    fleetTargets: [], // [{c, r, emoji, name, found}]
    fleetProbes: {}   // key "c,r" -> 'hit' | 'hot' | 'cold'
  };

  // ==================== WEB AUDIO SYNTHESIZER ====================
  let audioCtx = null;

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.16, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.23);
        });
      } else if (type === 'error') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (_) {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }

  // ==================== CONFETTI ENGINE ====================
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function launchConfetti() {
    const colors = ['#2563eb', '#ea580c', '#0d9488', '#f59e0b', '#ec4899', '#22c55e'];
    for (let i = 0; i < 65; i++) {
      confettiParticles.push({
        x: window.innerWidth * (0.25 + Math.random() * 0.5),
        y: window.innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: 7 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.25,
        life: 1
      });
    }
    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // gravity
      p.rot += p.vrot;
      p.life -= 0.014;

      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, p.life);
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 30);
    if (confettiParticles.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimId = null;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==================== SCORE & HEADER UPDATES ====================
  function addScore(points) {
    state.score += points;
    state.streak += 1;
    updateScoreUI();
  }

  function resetStreak() {
    state.streak = 0;
    updateScoreUI();
  }

  function updateScoreUI() {
    document.getElementById('scoreValue').textContent = state.score;
    document.getElementById('streakValue').textContent = state.streak;

    let currentRank = RANKS[0];
    for (const r of RANKS) {
      if (state.score >= r.min) currentRank = r;
    }
    document.getElementById('rankName').textContent = currentRank.name;
    document.getElementById('rankEmoji').textContent = currentRank.emoji;
  }

  // ==================== MODE 1: EXPLORA LA QUADRÍCULA ====================
  function renderExploreMode() {
    const container = document.getElementById('exploreGridContainer');
    const isPoints = state.exploreType === 'points';

    if (isPoints) {
      // Cartesian grid 0..8
      const maxN = 8;
      const padLeft = 58;
      const padBottom = 56;
      const padTop = 34;
      const padRight = 34;
      const size = 500;
      const plotW = size - padLeft - padRight;
      const plotH = size - padTop - padBottom;
      const step = plotW / maxN;

      const toX = (x) => padLeft + x * step;
      const toY = (y) => size - padBottom - y * step;

      const px = toX(state.exploreX);
      const py = toY(state.exploreY);
      const originX = toX(0);
      const originY = toY(0);

      let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pla cartesià interactiu de 0 a 8">`;

      // Background subtle grid fill
      svg += `<rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="#ffffff" rx="4"/>`;

      // Grid lines & axis numbers
      for (let i = 0; i <= maxN; i++) {
        const gx = toX(i);
        const gy = toY(i);

        // Vertical grid line
        svg += `<line x1="${gx}" y1="${padTop}" x2="${gx}" y2="${originY}" stroke="${i === 0 ? '#334155' : '#cbd5e1'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
        // Horizontal grid line
        svg += `<line x1="${originX}" y1="${gy}" x2="${size - padRight}" y2="${gy}" stroke="${i === 0 ? '#334155' : '#cbd5e1'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;

        // X Axis labels
        const isCurrentX = i === state.exploreX;
        svg += `<text x="${gx}" y="${originY + 26}" text-anchor="middle" font-size="${isCurrentX ? '18' : '15'}" font-weight="${isCurrentX ? '900' : '700'}" fill="${isCurrentX ? '#ea580c' : '#475569'}">${i}</text>`;

        // Y Axis labels
        const isCurrentY = i === state.exploreY;
        svg += `<text x="${originX - 18}" y="${gy + 5}" text-anchor="end" font-size="${isCurrentY ? '18' : '15'}" font-weight="${isCurrentY ? '900' : '700'}" fill="${isCurrentY ? '#0d9488' : '#475569'}">${i}</text>`;
      }

      // Axis Titles
      svg += `<text x="${padLeft + plotW / 2}" y="${size - 8}" text-anchor="middle" font-size="14" font-weight="800" fill="#ea580c">EIX HORITZONTAL (X) ➡️</text>`;
      svg += `<text x="16" y="${padTop + plotH / 2}" text-anchor="middle" font-size="14" font-weight="800" fill="#0d9488" transform="rotate(-90, 16, ${padTop + plotH / 2})">EIX VERTICAL (Y) ⬆️</text>`;

      // Animated / Highlighted Path from (0,0) -> (X,0) -> (X,Y)
      // Step 1: Horizontal path along X
      if (state.exploreX > 0) {
        svg += `<line x1="${originX}" y1="${originY}" x2="${px}" y2="${originY}" stroke="#ea580c" stroke-width="6" stroke-linecap="round" />`;
        svg += `<line x1="${originX}" y1="${py}" x2="${px}" y2="${py}" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6,5" />`;
      }
      // Step 2: Vertical path up to Y
      if (state.exploreY > 0) {
        svg += `<line x1="${px}" y1="${originY}" x2="${px}" y2="${py}" stroke="#0d9488" stroke-width="5" stroke-dasharray="7,5" stroke-linecap="round" />`;
      }

      // Interactive intersection points
      for (let x = 0; x <= maxN; x++) {
        for (let y = 0; y <= maxN; y++) {
          const cx = toX(x);
          const cy = toY(y);
          const isSelected = x === state.exploreX && y === state.exploreY;
          svg += `<circle cx="${cx}" cy="${cy}" r="15" fill="transparent" class="grid-point-hit" data-x="${x}" data-y="${y}" />`;
          svg += `<circle cx="${cx}" cy="${cy}" r="${isSelected ? 9 : 4}" fill="${isSelected ? '#2563eb' : '#94a3b8'}" pointer-events="none" />`;
        }
      }

      // Highlight badge on active point
      svg += `<circle cx="${px}" cy="${py}" r="14" fill="none" stroke="#2563eb" stroke-width="3" pointer-events="none" />`;
      const labelBoxX = Math.min(Math.max(px - 36, padLeft), size - padRight - 72);
      const labelBoxY = py - 38 < 6 ? py + 16 : py - 38;
      svg += `
        <g pointer-events="none">
          <rect x="${labelBoxX}" y="${labelBoxY}" width="72" height="26" rx="8" fill="#1e293b" />
          <text x="${labelBoxX + 36}" y="${labelBoxY + 18}" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="800">(${state.exploreX}, ${state.exploreY})</text>
        </g>
      `;

      svg += `</svg>`;
      container.innerHTML = svg;

      // Update side readout
      document.getElementById('exploreIntroText').textContent =
        'Clica qualsevol punt on es creuen les línies i observa com ens desplacem des del punt (0, 0)!';
      document.getElementById('exploreCoordDisplay').innerHTML =
        `(<span style="color:var(--axis-x)">${state.exploreX}</span>, <span style="color:var(--axis-y)">${state.exploreY}</span>)`;
      document.getElementById('exploreStepX').innerHTML =
        state.exploreX === 0
          ? `Ens quedem a <strong>0</strong> en horitzontal (sobre l'eix vertical!).`
          : `Camina <strong>${state.exploreX}</strong> ${state.exploreX === 1 ? 'pas' : 'passos'} a la dreta per l'eix X.`;
      document.getElementById('exploreStepY').innerHTML =
        state.exploreY === 0
          ? `No pugem cap pas (<strong>0</strong> en vertical, sobre l'eix horitzontal!).`
          : `Enfila't <strong>${state.exploreY}</strong> ${state.exploreY === 1 ? 'pas' : 'passos'} amunt per l'eix Y.`;

      // Attach listeners
      container.querySelectorAll('.grid-point-hit').forEach((el) => {
        el.addEventListener('click', () => {
          state.exploreX = parseInt(el.dataset.x, 10);
          state.exploreY = parseInt(el.dataset.y, 10);
          playSound('click');
          renderExploreMode();
        });
      });
    } else {
      // Alphanumeric Cells Grid (A..H, 1..8)
      const cols = 8;
      const rows = 8;
      const padLeft = 52;
      const padTop = 48;
      const padRight = 24;
      const padBottom = 24;
      const size = 500;
      const gridW = size - padLeft - padRight;
      const gridH = size - padTop - padBottom;
      const cellW = gridW / cols;
      const cellH = gridH / rows;

      const selC = Math.min(state.exploreX, cols - 1);
      const selR = Math.min(state.exploreY, rows - 1);

      let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Quadrícula de caselles A-H i 1-8">`;

      // Column headers (A..H)
      for (let c = 0; c < cols; c++) {
        const cx = padLeft + c * cellW + cellW / 2;
        const isSel = c === selC;
        svg += `<rect x="${padLeft + c * cellW + 2}" y="10" width="${cellW - 4}" height="30" rx="8" fill="${isSel ? '#ea580c' : '#ffedd5'}" />`;
        svg += `<text x="${cx}" y="31" text-anchor="middle" font-size="16" font-weight="900" fill="${isSel ? '#ffffff' : '#9a3412'}">${LETTERS[c]}</text>`;
      }

      // Row headers (1..8)
      for (let r = 0; r < rows; r++) {
        const cy = padTop + r * cellH + cellH / 2;
        const isSel = r === selR;
        svg += `<rect x="10" y="${padTop + r * cellH + 2}" width="34" height="${cellH - 4}" rx="8" fill="${isSel ? '#0d9488' : '#ccfbf1'}" />`;
        svg += `<text x="27" y="${cy + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="${isSel ? '#ffffff' : '#115e59'}">${r + 1}</text>`;
      }

      // Cells
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = padLeft + c * cellW;
          const y = padTop + r * cellH;
          const isSelected = c === selC && r === selR;
          const isSameCol = c === selC;
          const isSameRow = r === selR;

          let fill = '#ffffff';
          if (isSelected) fill = '#bfdbfe';
          else if (isSameCol) fill = '#fff7ed';
          else if (isSameRow) fill = '#f0fdfa';

          svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="#cbd5e1" stroke-width="1.5" class="grid-cell-hit" data-c="${c}" data-r="${r}" />`;

          if (isSelected) {
            svg += `<rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="none" stroke="#2563eb" stroke-width="3" rx="6" pointer-events="none" />`;
            svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 7}" text-anchor="middle" font-size="18" font-weight="900" fill="#1e3a8a" pointer-events="none">${LETTERS[c]}${r + 1}</text>`;
          }
        }
      }

      svg += `</svg>`;
      container.innerHTML = svg;

      // Update side readout
      const colLetter = LETTERS[selC];
      const rowNum = selR + 1;
      document.getElementById('exploreIntroText').textContent =
        'En una quadrícula de caselles (com als mapes o als escacs), cada quadrat té una LLETRA de columna i un NÚMERO de fila!';
      document.getElementById('exploreCoordDisplay').innerHTML =
        `(<span style="color:var(--axis-x)">${colLetter}</span>, <span style="color:var(--axis-y)">${rowNum}</span>)`;
      document.getElementById('exploreStepX').innerHTML =
        `Busca la columna de la lletra <strong>${colLetter}</strong> en horitzontal.`;
      document.getElementById('exploreStepY').innerHTML =
        `Baixa fins a la fila número <strong>${rowNum}</strong> en vertical.`;

      container.querySelectorAll('.grid-cell-hit').forEach((el) => {
        el.addEventListener('click', () => {
          state.exploreX = parseInt(el.dataset.c, 10);
          state.exploreY = parseInt(el.dataset.r, 10);
          playSound('click');
          renderExploreMode();
        });
      });
    }
  }

  // ==================== MODE 2: CAÇA DEL TRESOR ====================
  const TREASURE_ITEMS = [
    { emoji: '💎', name: 'el cofre de diamants' },
    { emoji: '🏝️', name: "l'illa misteriosa" },
    { emoji: '🦜', name: 'el lloro del capità' },
    { emoji: '🗼', name: 'el far lluminós' },
    { emoji: '⚓', name: "l'àncora d'or" },
    { emoji: '🐙', name: 'el pop gegant' },
    { emoji: '👑', name: 'la corona antiga' },
    { emoji: '🧭', name: 'la brúixola màgica' }
  ];

  function populateTreasureSelects() {
    const selX = document.getElementById('trInputX');
    const selY = document.getElementById('trInputY');
    const lblX = document.getElementById('trLabelX');
    const lblY = document.getElementById('trLabelY');

    selX.innerHTML = '';
    selY.innerHTML = '';

    if (state.treasureType === 'points') {
      lblX.textContent = 'Horitzontal (X) ➡️';
      lblY.textContent = 'Vertical (Y) ⬆️';
      for (let i = 0; i <= 8; i++) {
        selX.innerHTML += `<option value="${i}">${i}</option>`;
        selY.innerHTML += `<option value="${i}">${i}</option>`;
      }
    } else {
      lblX.textContent = 'Columna (Lletra) ➡️';
      lblY.textContent = 'Fila (Número) ⬇️';
      for (let i = 0; i < 8; i++) {
        selX.innerHTML += `<option value="${i}">${LETTERS[i]}</option>`;
        selY.innerHTML += `<option value="${i}">${i + 1}</option>`;
      }
    }
  }

  function generateTreasureMission() {
    state.treasureSolved = false;
    state.treasureShowHint = false;
    state.treasureLastClick = null;

    // Alternate or randomize between clicking the map and identifying coordinates
    state.treasureChallengeKind = Math.random() < 0.55 ? 'click' : 'write';
    state.treasureItem = TREASURE_ITEMS[Math.floor(Math.random() * TREASURE_ITEMS.length)];

    const maxVal = state.treasureType === 'points' ? 8 : 7;
    state.treasureTargetX = Math.floor(Math.random() * (maxVal + 1));
    state.treasureTargetY = Math.floor(Math.random() * (maxVal + 1));

    populateTreasureSelects();
    updateTreasureUI();
    renderTreasureGrid();
  }

  function formatTreasureCoord(x, y) {
    if (state.treasureType === 'points') {
      return `(${x}, ${y})`;
    }
    return `(${LETTERS[x]}, ${y + 1})`;
  }

  function updateTreasureUI() {
    const badge = document.getElementById('treasureModeBadge');
    const title = document.getElementById('treasurePromptTitle');
    const missionBox = document.getElementById('treasureMissionBox');
    const inputArea = document.getElementById('treasureInputArea');
    const feedback = document.getElementById('treasureFeedback');

    const coordStr = formatTreasureCoord(state.treasureTargetX, state.treasureTargetY);
    const { emoji, name } = state.treasureItem;

    feedback.className = 'feedback-box';

    if (state.treasureChallengeKind === 'click') {
      badge.textContent = '🎯 Missió: Col·loca al mapa';
      title.textContent = 'On hem d’anar?';
      missionBox.innerHTML = `Clica al mapa la coordenada exacta <span class="mission-coord-highlight">${coordStr}</span> per trobar ${name} ${emoji}!`;
      inputArea.classList.add('hidden');
      feedback.textContent = 'Fes clic directament sobre el punt o casella del mapa!';
    } else {
      badge.textContent = '✍️ Missió: Escriu la coordenada';
      title.textContent = 'Quines coordenades té?';
      missionBox.innerHTML = `Observa el mapa! Hem descobert ${name} ${emoji}. Selecciona'n les coordenades exactes i comprova la resposta!`;
      inputArea.classList.remove('hidden');
      feedback.textContent = 'Tria primer la coordenada horitzontal i després la vertical!';
    }
  }

  function handleTreasureMapClick(x, y) {
    if (state.treasureSolved) return;

    if (state.treasureChallengeKind === 'write') {
      // If they click on the map during 'write' mode, remind them to use the selector
      const feedback = document.getElementById('treasureFeedback');
      feedback.className = 'feedback-box';
      feedback.textContent = 'En aquesta missió el tresor ja és al mapa! Tria les coordenades als desplegables de la dreta i prem «Comprova».';
      return;
    }

    state.treasureLastClick = { x, y };
    const feedback = document.getElementById('treasureFeedback');

    if (x === state.treasureTargetX && y === state.treasureTargetY) {
      state.treasureSolved = true;
      playSound('success');
      launchConfetti();
      addScore(15);
      feedback.className = 'feedback-box success';
      feedback.innerHTML = `🎉 <strong>Molt bé!</strong> Has trobat ${state.treasureItem.name} ${state.treasureItem.emoji} a <strong>${formatTreasureCoord(x, y)}</strong>! (+15 punts)`;
    } else {
      playSound('error');
      resetStreak();
      feedback.className = 'feedback-box error';

      // Check if student inverted X and Y!
      if (x === state.treasureTargetY && y === state.treasureTargetX && state.treasureTargetX !== state.treasureTargetY) {
        feedback.innerHTML = `⚠️ <strong>Compte! Has invertit l'ordre!</strong> Has clicat <strong>${formatTreasureCoord(x, y)}</strong> en lloc de <strong>${formatTreasureCoord(state.treasureTargetX, state.treasureTargetY)}</strong>. Recorda: primer ➡️ horitzontal i després ⬆️ vertical!`;
      } else {
        feedback.innerHTML = `❌ Has clicat a <strong>${formatTreasureCoord(x, y)}</strong>. Torna-ho a provar! Busquem <strong>${formatTreasureCoord(state.treasureTargetX, state.treasureTargetY)}</strong>.`;
      }
    }

    renderTreasureGrid();
  }

  function checkTreasureWrittenAnswer() {
    if (state.treasureSolved) return;
    const x = parseInt(document.getElementById('trInputX').value, 10);
    const y = parseInt(document.getElementById('trInputY').value, 10);
    const feedback = document.getElementById('treasureFeedback');

    if (x === state.treasureTargetX && y === state.treasureTargetY) {
      state.treasureSolved = true;
      playSound('success');
      launchConfetti();
      addScore(15);
      feedback.className = 'feedback-box success';
      feedback.innerHTML = `🎉 <strong>Exacte!</strong> ${state.treasureItem.emoji} es troba a la coordenada <strong>${formatTreasureCoord(x, y)}</strong>! (+15 punts)`;
    } else {
      playSound('error');
      resetStreak();
      feedback.className = 'feedback-box error';
      if (x === state.treasureTargetY && y === state.treasureTargetX && state.treasureTargetX !== state.treasureTargetY) {
        feedback.innerHTML = `⚠️ <strong>Gairebé! Has posat els números al revés!</strong> Recorda mirar primer l'eix horitzontal ➡️ i després el vertical ⬆️.`;
      } else {
        feedback.innerHTML = `❌ No és <strong>${formatTreasureCoord(x, y)}</strong>. Fixa't bé en la fila i la columna del mapa!`;
      }
    }
    renderTreasureGrid();
  }

  function renderTreasureGrid() {
    const container = document.getElementById('treasureGridContainer');
    const isPoints = state.treasureType === 'points';

    if (isPoints) {
      const maxN = 8;
      const padLeft = 58;
      const padBottom = 56;
      const padTop = 34;
      const padRight = 34;
      const size = 500;
      const plotW = size - padLeft - padRight;
      const plotH = size - padTop - padBottom;
      const step = plotW / maxN;

      const toX = (x) => padLeft + x * step;
      const toY = (y) => size - padBottom - y * step;
      const originX = toX(0);
      const originY = toY(0);

      let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Mapa del tresor per punts">`;
      svg += `<rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="#fffbeb" rx="4"/>`;

      for (let i = 0; i <= maxN; i++) {
        const gx = toX(i);
        const gy = toY(i);
        svg += `<line x1="${gx}" y1="${padTop}" x2="${gx}" y2="${originY}" stroke="${i === 0 ? '#334155' : '#fcd34d'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
        svg += `<line x1="${originX}" y1="${gy}" x2="${size - padRight}" y2="${gy}" stroke="${i === 0 ? '#334155' : '#fcd34d'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
        svg += `<text x="${gx}" y="${originY + 26}" text-anchor="middle" font-size="15" font-weight="800" fill="#ea580c">${i}</text>`;
        svg += `<text x="${originX - 18}" y="${gy + 5}" text-anchor="end" font-size="15" font-weight="800" fill="#0d9488">${i}</text>`;
      }

      svg += `<text x="${padLeft + plotW / 2}" y="${size - 8}" text-anchor="middle" font-size="14" font-weight="800" fill="#ea580c">HORITZONTAL (X) ➡️</text>`;
      svg += `<text x="16" y="${padTop + plotH / 2}" text-anchor="middle" font-size="14" font-weight="800" fill="#0d9488" transform="rotate(-90, 16, ${padTop + plotH / 2})">VERTICAL (Y) ⬆️</text>`;

      const tx = toX(state.treasureTargetX);
      const ty = toY(state.treasureTargetY);

      // Show hint lines if requested or solved
      if (state.treasureShowHint || state.treasureSolved) {
        svg += `<line x1="${originX}" y1="${originY}" x2="${tx}" y2="${originY}" stroke="#ea580c" stroke-width="5" />`;
        svg += `<line x1="${tx}" y1="${originY}" x2="${tx}" y2="${ty}" stroke="#0d9488" stroke-width="4" stroke-dasharray="6,4" />`;
      }

      // Clickable intersections
      for (let x = 0; x <= maxN; x++) {
        for (let y = 0; y <= maxN; y++) {
          const cx = toX(x);
          const cy = toY(y);
          svg += `<circle cx="${cx}" cy="${cy}" r="16" fill="transparent" class="grid-point-hit" data-x="${x}" data-y="${y}" />`;
          svg += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="#d97706" pointer-events="none" />`;
        }
      }

      // If wrong click happened, show red X marker
      if (state.treasureLastClick && !state.treasureSolved) {
        const wx = toX(state.treasureLastClick.x);
        const wy = toY(state.treasureLastClick.y);
        svg += `<circle cx="${wx}" cy="${wy}" r="11" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5" pointer-events="none" />`;
        svg += `<text x="${wx}" y="${wy + 5}" text-anchor="middle" font-size="14" pointer-events="none">❌</text>`;
      }

      // Show treasure item if 'write' mode OR if already solved
      if (state.treasureChallengeKind === 'write' || state.treasureSolved) {
        svg += `<circle cx="${tx}" cy="${ty}" r="20" fill="#fef08a" stroke="#ca8a04" stroke-width="3" pointer-events="none" />`;
        svg += `<text x="${tx}" y="${ty + 8}" text-anchor="middle" font-size="24" pointer-events="none">${state.treasureItem.emoji}</text>`;
      }

      svg += `</svg>`;
      container.innerHTML = svg;

      container.querySelectorAll('.grid-point-hit').forEach((el) => {
        el.addEventListener('click', () => {
          handleTreasureMapClick(parseInt(el.dataset.x, 10), parseInt(el.dataset.y, 10));
        });
      });
    } else {
      // Cells mode (A..H, 1..8)
      const cols = 8;
      const rows = 8;
      const padLeft = 52;
      const padTop = 48;
      const padRight = 24;
      const padBottom = 24;
      const size = 500;
      const cellW = (size - padLeft - padRight) / cols;
      const cellH = (size - padTop - padBottom) / rows;

      let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Mapa del tresor per caselles">`;

      for (let c = 0; c < cols; c++) {
        const cx = padLeft + c * cellW + cellW / 2;
        const highlight = (state.treasureShowHint || state.treasureSolved) && c === state.treasureTargetX;
        svg += `<rect x="${padLeft + c * cellW + 2}" y="10" width="${cellW - 4}" height="30" rx="8" fill="${highlight ? '#ea580c' : '#ffedd5'}" />`;
        svg += `<text x="${cx}" y="31" text-anchor="middle" font-size="16" font-weight="900" fill="${highlight ? '#ffffff' : '#9a3412'}">${LETTERS[c]}</text>`;
      }

      for (let r = 0; r < rows; r++) {
        const cy = padTop + r * cellH + cellH / 2;
        const highlight = (state.treasureShowHint || state.treasureSolved) && r === state.treasureTargetY;
        svg += `<rect x="10" y="${padTop + r * cellH + 2}" width="34" height="${cellH - 4}" rx="8" fill="${highlight ? '#0d9488' : '#ccfbf1'}" />`;
        svg += `<text x="27" y="${cy + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="${highlight ? '#ffffff' : '#115e59'}">${r + 1}</text>`;
      }

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = padLeft + c * cellW;
          const y = padTop + r * cellH;
          const isTarget = c === state.treasureTargetX && r === state.treasureTargetY;
          const isWrongClick =
            state.treasureLastClick &&
            !state.treasureSolved &&
            state.treasureLastClick.x === c &&
            state.treasureLastClick.y === r;

          let fill = '#fffbeb';
          if ((state.treasureShowHint || state.treasureSolved) && (c === state.treasureTargetX || r === state.treasureTargetY)) {
            fill = '#fef3c7';
          }
          if (isTarget && (state.treasureChallengeKind === 'write' || state.treasureSolved)) {
            fill = '#fde047';
          }
          if (isWrongClick) {
            fill = '#fee2e2';
          }

          svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="#f59e0b" stroke-width="1.5" class="grid-cell-hit" data-c="${c}" data-r="${r}" />`;

          if (isWrongClick) {
            svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 7}" text-anchor="middle" font-size="20" pointer-events="none">❌</text>`;
          }

          if (isTarget && (state.treasureChallengeKind === 'write' || state.treasureSolved)) {
            svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 10}" text-anchor="middle" font-size="26" pointer-events="none">${state.treasureItem.emoji}</text>`;
          }
        }
      }

      svg += `</svg>`;
      container.innerHTML = svg;

      container.querySelectorAll('.grid-cell-hit').forEach((el) => {
        el.addEventListener('click', () => {
          handleTreasureMapClick(parseInt(el.dataset.c, 10), parseInt(el.dataset.r, 10));
        });
      });
    }
  }

  // ==================== MODE 3: DIBUIX SECRET (UNEIX ELS PUNTS) ====================
  const DRAWINGS = {
    star: {
      name: 'Estrella Màgica ⭐',
      fill: '#fde047',
      stroke: '#ca8a04',
      points: [
        [4, 8], [5, 5], [8, 5], [6, 3], [7, 0],
        [4, 2], [1, 0], [2, 3], [0, 5], [3, 5], [4, 8]
      ]
    },
    rocket: {
      name: 'Coet Espacial 🚀',
      fill: '#93c5fd',
      stroke: '#1d4ed8',
      points: [
        [4, 8], [6, 6], [6, 3], [8, 1], [6, 1],
        [6, 0], [2, 0], [2, 1], [0, 1], [2, 3],
        [2, 6], [4, 8]
      ]
    },
    boat: {
      name: 'Vaixell Pirata ⛵',
      fill: '#fed7aa',
      stroke: '#c2410c',
      points: [
        [4, 8], [4, 3], [7, 3], [4, 8], [4, 2],
        [8, 2], [6, 0], [2, 0], [0, 2], [4, 2]
      ]
    },
    crown: {
      name: 'Corona Reial 👑',
      fill: '#fef08a',
      stroke: '#d97706',
      points: [
        [1, 1], [1, 6], [3, 4], [4, 7], [5, 4],
        [7, 6], [7, 1], [1, 1]
      ]
    },
    heart: {
      name: 'Cor Geomètric ❤️',
      fill: '#fecdd3',
      stroke: '#e11d48',
      points: [
        [4, 1], [1, 4], [1, 6], [2, 7], [3, 7],
        [4, 6], [5, 7], [6, 7], [7, 6], [7, 4], [4, 1]
      ]
    }
  };

  function initDrawingMode() {
    state.drawProgressIdx = 0;
    state.drawCompleted = false;
    updateDrawingUI();
    renderDrawingGrid();
  }

  function updateDrawingUI() {
    const drawing = DRAWINGS[state.currentDrawingKey];
    const pts = drawing.points;
    const nextCoordEl = document.getElementById('drawNextCoord');
    const listEl = document.getElementById('drawPointsList');

    if (state.drawCompleted) {
      nextCoordEl.textContent = 'Completat! 🎉';
    } else {
      const [nx, ny] = pts[state.drawProgressIdx];
      nextCoordEl.textContent = `(${nx}, ${ny})`;
    }

    listEl.innerHTML = pts
      .map(([x, y], idx) => {
        let cls = 'point-chip';
        let icon = `${idx + 1}.`;
        if (idx < state.drawProgressIdx || state.drawCompleted) {
          cls += ' done';
          icon = '✅';
        } else if (idx === state.drawProgressIdx) {
          cls += ' current';
          icon = '👉';
        }
        return `<span class="${cls}"><span>${icon}</span> (${x}, ${y})</span>`;
      })
      .join('');
  }

  function handleDrawingPointClick(x, y) {
    if (state.drawCompleted) return;
    const drawing = DRAWINGS[state.currentDrawingKey];
    const [targetX, targetY] = drawing.points[state.drawProgressIdx];
    const feedback = document.getElementById('drawFeedback');

    if (x === targetX && y === targetY) {
      state.drawProgressIdx += 1;
      playSound('click');
      addScore(5);

      if (state.drawProgressIdx >= drawing.points.length) {
        state.drawCompleted = true;
        playSound('success');
        launchConfetti();
        addScore(20);
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `🎨 <strong>Fantàstic!</strong> Has completat la figura <strong>${drawing.name}</strong> unint totes les coordenades en ordre! (+20 punts extra)`;
      } else {
        const [nx, ny] = drawing.points[state.drawProgressIdx];
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `✅ Punt <strong>(${x}, ${y})</strong> connectat! Ara busca el punt <strong>(${nx}, ${ny})</strong>.`;
      }
      updateDrawingUI();
      renderDrawingGrid();
    } else {
      playSound('error');
      resetStreak();
      feedback.className = 'feedback-box error';
      if (x === targetY && y === targetX && targetX !== targetY) {
        feedback.innerHTML = `⚠️ Has clicat <strong>(${x}, ${y})</strong> i busquem <strong>(${targetX}, ${targetY})</strong>! Recorda: 1r Horitzontal ➡️, 2n Vertical ⬆️.`;
      } else {
        feedback.innerHTML = `❌ Aquest és el punt <strong>(${x}, ${y})</strong>. Ara toca clicar el punt <strong>(${targetX}, ${targetY})</strong>!`;
      }
    }
  }

  function renderDrawingGrid() {
    const container = document.getElementById('drawGridContainer');
    const drawing = DRAWINGS[state.currentDrawingKey];
    const pts = drawing.points;

    const maxN = 8;
    const padLeft = 58;
    const padBottom = 56;
    const padTop = 34;
    const padRight = 34;
    const size = 500;
    const plotW = size - padLeft - padRight;
    const plotH = size - padTop - padBottom;
    const step = plotW / maxN;

    const toX = (x) => padLeft + x * step;
    const toY = (y) => size - padBottom - y * step;
    const originX = toX(0);
    const originY = toY(0);

    let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Quadrícula del dibuix secret">`;
    svg += `<rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="#ffffff" rx="4"/>`;

    for (let i = 0; i <= maxN; i++) {
      const gx = toX(i);
      const gy = toY(i);
      svg += `<line x1="${gx}" y1="${padTop}" x2="${gx}" y2="${originY}" stroke="${i === 0 ? '#334155' : '#e2e8f0'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
      svg += `<line x1="${originX}" y1="${gy}" x2="${size - padRight}" y2="${gy}" stroke="${i === 0 ? '#334155' : '#e2e8f0'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
      svg += `<text x="${gx}" y="${originY + 26}" text-anchor="middle" font-size="15" font-weight="800" fill="#ea580c">${i}</text>`;
      svg += `<text x="${originX - 18}" y="${gy + 5}" text-anchor="end" font-size="15" font-weight="800" fill="#0d9488">${i}</text>`;
    }

    // Polygon fill when completed
    if (state.drawCompleted) {
      const polyPoints = pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(' ');
      svg += `<polygon points="${polyPoints}" fill="${drawing.fill}" fill-opacity="0.7" stroke="${drawing.stroke}" stroke-width="4" stroke-linejoin="round" />`;
    } else if (state.drawProgressIdx > 1) {
      // Partial polyline
      const activePts = pts.slice(0, state.drawProgressIdx);
      const polyPoints = activePts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(' ');
      svg += `<polyline points="${polyPoints}" fill="none" stroke="${drawing.stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;
    }

    // Completed vertices
    for (let i = 0; i < state.drawProgressIdx; i++) {
      const [px, py] = pts[i];
      svg += `<circle cx="${toX(px)}" cy="${toY(py)}" r="7" fill="${drawing.stroke}" pointer-events="none" />`;
    }

    // Clickable grid points
    for (let x = 0; x <= maxN; x++) {
      for (let y = 0; y <= maxN; y++) {
        const cx = toX(x);
        const cy = toY(y);
        svg += `<circle cx="${cx}" cy="${cy}" r="16" fill="transparent" class="grid-point-hit" data-x="${x}" data-y="${y}" />`;
        svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="#94a3b8" pointer-events="none" />`;
      }
    }

    svg += `</svg>`;
    container.innerHTML = svg;

    container.querySelectorAll('.grid-point-hit').forEach((el) => {
      el.addEventListener('click', () => {
        handleDrawingPointClick(parseInt(el.dataset.x, 10), parseInt(el.dataset.y, 10));
      });
    });
  }

  // ==================== MODE 4: ROBOT EXPLORADOR ====================
  function generateRobotLevel() {
    state.robotWon = false;
    state.robotStart = { x: 1, y: 1 };
    state.robotPos = { x: 1, y: 1 };
    state.robotPath = [{ x: 1, y: 1 }];

    // Randomize star and goal so they don't overlap
    const sx = 2 + Math.floor(Math.random() * 4); // 2..5
    const sy = 2 + Math.floor(Math.random() * 5); // 2..6
    state.robotStar = { x: sx, y: sy, collected: false };

    let gx = 6 + Math.floor(Math.random() * 2); // 6..7
    let gy = 5 + Math.floor(Math.random() * 3); // 5..7
    if (gx === sx && gy === sy) gx = 7;
    state.robotGoal = { x: gx, y: gy };

    // Place 4 volcano obstacles not blocking start, star, or goal
    const forbidden = new Set([
      `${state.robotStart.x},${state.robotStart.y}`,
      `${sx},${sy}`,
      `${gx},${gy}`
    ]);
    state.robotObstacles = [];
    while (state.robotObstacles.length < 4) {
      const ox = Math.floor(Math.random() * 8) + 1;
      const oy = Math.floor(Math.random() * 8) + 1;
      const key = `${ox},${oy}`;
      if (!forbidden.has(key)) {
        forbidden.add(key);
        state.robotObstacles.push({ x: ox, y: oy });
      }
    }

    const feedback = document.getElementById('robotFeedback');
    feedback.className = 'feedback-box';
    feedback.innerHTML = `Guia el robot 🤖 des de <strong>(1, 1)</strong>, passa per l'estrella ⭐ a <strong>(${sx}, ${sy})</strong> i arriba a la bateria 🔋 a <strong>(${gx}, ${gy})</strong>!`;

    updateRobotUI();
    renderRobotGrid();
  }

  function resetRobotPosition() {
    state.robotWon = false;
    state.robotPos = { ...state.robotStart };
    state.robotStar.collected = false;
    state.robotPath = [{ ...state.robotStart }];
    const feedback = document.getElementById('robotFeedback');
    feedback.className = 'feedback-box';
    feedback.textContent = 'Robot reiniciat a la posició de sortida!';
    updateRobotUI();
    renderRobotGrid();
  }

  function moveRobot(dir) {
    if (state.robotWon) return;

    let nx = state.robotPos.x;
    let ny = state.robotPos.y;

    if (dir === 'right') nx += 1;
    else if (dir === 'left') nx -= 1;
    else if (dir === 'up') ny += 1;
    else if (dir === 'down') ny -= 1;

    const feedback = document.getElementById('robotFeedback');

    // Boundary check (0..8)
    if (nx < 0 || nx > 8 || ny < 0 || ny > 8) {
      playSound('error');
      feedback.className = 'feedback-box error';
      feedback.textContent = '⚠️ El robot no pot sortir dels límits de la quadrícula (0 a 8)!';
      return;
    }

    // Obstacle check
    const hitObstacle = state.robotObstacles.some((o) => o.x === nx && o.y === ny);
    if (hitObstacle) {
      playSound('error');
      resetStreak();
      feedback.className = 'feedback-box error';
      feedback.innerHTML = `🌋 <strong>Compte!</strong> A la coordenada <strong>(${nx}, ${ny})</strong> hi ha un volcà actiu! Esquiva'l per un altre camí.`;
      return;
    }

    // Valid move
    state.robotPos = { x: nx, y: ny };
    state.robotPath.push({ x: nx, y: ny });
    playSound('click');

    // Check star collection
    if (!state.robotStar.collected && nx === state.robotStar.x && ny === state.robotStar.y) {
      state.robotStar.collected = true;
      playSound('success');
      addScore(10);
      feedback.className = 'feedback-box success';
      feedback.innerHTML = `⭐ <strong>Estrella recollida a (${nx}, ${ny})!</strong> Ara dirigeix-te cap a la bateria 🔋 a <strong>(${state.robotGoal.x}, ${state.robotGoal.y})</strong>!`;
    } else if (nx === state.robotGoal.x && ny === state.robotGoal.y) {
      if (!state.robotStar.collected) {
        feedback.className = 'feedback-box error';
        feedback.innerHTML = `🔋 Has arribat a la bateria, però abans has de recollir l'estrella ⭐ a <strong>(${state.robotStar.x}, ${state.robotStar.y})</strong>!`;
      } else {
        state.robotWon = true;
        playSound('success');
        launchConfetti();
        addScore(20);
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `🎉 <strong>Missió completada!</strong> El robot ha arribat a <strong>(${nx}, ${ny})</strong> amb l'estrella! (+20 punts)`;
      }
    } else {
      feedback.className = 'feedback-box';
      feedback.innerHTML = `El robot s'ha desplaçat a la coordenada <strong>(${nx}, ${ny})</strong>.`;
    }

    updateRobotUI();
    renderRobotGrid();
  }

  function updateRobotUI() {
    document.getElementById('robotCurrentPos').textContent = `(${state.robotPos.x}, ${state.robotPos.y})`;
    document.getElementById('robotStartCoord').textContent = `(${state.robotStart.x}, ${state.robotStart.y})`;
    document.getElementById('robotStarCoord').textContent =
      state.robotStar.collected ? '✅ Recollida!' : `(${state.robotStar.x}, ${state.robotStar.y})`;
    document.getElementById('robotGoalCoord').textContent = `(${state.robotGoal.x}, ${state.robotGoal.y})`;

    const logEl = document.getElementById('robotRouteLog');
    logEl.innerHTML = state.robotPath
      .map((pt, idx) => `<span class="route-step-badge">${idx === 0 ? '🚩' : '➡️'} (${pt.x}, ${pt.y})</span>`)
      .join('');
    logEl.scrollTop = logEl.scrollHeight;
  }

  function renderRobotGrid() {
    const container = document.getElementById('robotGridContainer');
    const maxN = 8;
    const padLeft = 58;
    const padBottom = 56;
    const padTop = 34;
    const padRight = 34;
    const size = 500;
    const plotW = size - padLeft - padRight;
    const plotH = size - padTop - padBottom;
    const step = plotW / maxN;

    const toX = (x) => padLeft + x * step;
    const toY = (y) => size - padBottom - y * step;
    const originX = toX(0);
    const originY = toY(0);

    let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Quadrícula del robot explorador">`;
    svg += `<rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="#f0fdf4" rx="4"/>`;

    for (let i = 0; i <= maxN; i++) {
      const gx = toX(i);
      const gy = toY(i);
      svg += `<line x1="${gx}" y1="${padTop}" x2="${gx}" y2="${originY}" stroke="${i === 0 ? '#334155' : '#bbf7d0'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
      svg += `<line x1="${originX}" y1="${gy}" x2="${size - padRight}" y2="${gy}" stroke="${i === 0 ? '#334155' : '#bbf7d0'}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
      svg += `<text x="${gx}" y="${originY + 26}" text-anchor="middle" font-size="15" font-weight="800" fill="#ea580c">${i}</text>`;
      svg += `<text x="${originX - 18}" y="${gy + 5}" text-anchor="end" font-size="15" font-weight="800" fill="#0d9488">${i}</text>`;
    }

    // Draw robot trail
    if (state.robotPath.length > 1) {
      const pts = state.robotPath.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ');
      svg += `<polyline points="${pts}" fill="none" stroke="#3b82f6" stroke-width="5" stroke-dasharray="8,5" stroke-linecap="round" stroke-linejoin="round" />`;
    }

    // Obstacles
    state.robotObstacles.forEach((o) => {
      svg += `<text x="${toX(o.x)}" y="${toY(o.y) + 8}" text-anchor="middle" font-size="24">🌋</text>`;
    });

    // Star
    if (!state.robotStar.collected) {
      svg += `<text x="${toX(state.robotStar.x)}" y="${toY(state.robotStar.y) + 8}" text-anchor="middle" font-size="25">⭐</text>`;
    }

    // Goal Battery
    svg += `<text x="${toX(state.robotGoal.x)}" y="${toY(state.robotGoal.y) + 8}" text-anchor="middle" font-size="25">🔋</text>`;

    // Robot Position
    const rx = toX(state.robotPos.x);
    const ry = toY(state.robotPos.y);
    svg += `<circle cx="${rx}" cy="${ry}" r="20" fill="#dbeafe" stroke="#2563eb" stroke-width="3" />`;
    svg += `<text x="${rx}" y="${ry + 9}" text-anchor="middle" font-size="25">🤖</text>`;

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // ==================== MODE 5: RADAR D'ILLES (CASELLES A-G, 1-7) ====================
  const FLEET_OBJECTS = [
    { emoji: '⛵', name: 'el veler' },
    { emoji: '🚢', name: 'el vaixell escola' },
    { emoji: '🚤', name: 'la llanxa ràpida' },
    { emoji: '🛟', name: 'la boia de salvament' },
    { emoji: '🐋', name: 'la balena blava' }
  ];

  function initFleetGame() {
    state.fleetTargets = [];
    state.fleetProbes = {};
    const used = new Set();

    FLEET_OBJECTS.forEach((obj) => {
      let c, r, key;
      do {
        c = Math.floor(Math.random() * state.fleetSize);
        r = Math.floor(Math.random() * state.fleetSize);
        key = `${c},${r}`;
      } while (used.has(key));
      used.add(key);
      state.fleetTargets.push({ c, r, emoji: obj.emoji, name: obj.name, found: false });
    });

    updateFleetUI();
    renderFleetGrid();

    const feedback = document.getElementById('fleetFeedback');
    feedback.className = 'feedback-box';
    feedback.innerHTML = 'Sondeja qualsevol casella clicant-la o triant la lletra de columna i el número de fila!';
  }

  function fireRadarProbe(c, r) {
    const key = `${c},${r}`;
    const coordLabel = `(${LETTERS[c]}, ${r + 1})`;
    const feedback = document.getElementById('fleetFeedback');

    if (state.fleetProbes[key]) {
      feedback.className = 'feedback-box';
      feedback.innerHTML = `Ja havies sondejat la casella <strong>${coordLabel}</strong>! Prova'n una altra.`;
      return;
    }

    // Sync select dropdowns with clicked cell
    document.getElementById('radarColSelect').value = String(c);
    document.getElementById('radarRowSelect').value = String(r);

    const hitTarget = state.fleetTargets.find((t) => t.c === c && t.r === r);
    if (hitTarget) {
      hitTarget.found = true;
      state.fleetProbes[key] = 'hit';
      playSound('success');
      addScore(15);

      const foundCount = state.fleetTargets.filter((t) => t.found).length;
      if (foundCount === state.fleetTargets.length) {
        launchConfetti();
        addScore(25);
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `🏆 <strong>Rescat completat!</strong> Has localitzat tots els objectius del radar! (+25 punts extra)`;
      } else {
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `🎉 <strong>Localitzat a ${coordLabel}!</strong> Has rescatat ${hitTarget.name} ${hitTarget.emoji}! (+15 punts)`;
      }
    } else {
      // Check if any unfound target is within distance 1 (Chebyshev distance === 1)
      const isHot = state.fleetTargets.some(
        (t) => !t.found && Math.abs(t.c - c) <= 1 && Math.abs(t.r - r) <= 1
      );
      playSound('click');

      if (isHot) {
        state.fleetProbes[key] = 'hot';
        feedback.className = 'feedback-box';
        feedback.innerHTML = `🔥 <strong>Aigua calenta a ${coordLabel}!</strong> El radar detecta un objectiu just al voltant d'aquesta casella!`;
      } else {
        state.fleetProbes[key] = 'cold';
        feedback.className = 'feedback-box';
        feedback.innerHTML = `🌊 <strong>Aigua freda a ${coordLabel}.</strong> No hi ha cap embarcació a les caselles del costat.`;
      }
    }

    updateFleetUI();
    renderFleetGrid();
  }

  function updateFleetUI() {
    const foundCount = state.fleetTargets.filter((t) => t.found).length;
    document.getElementById('fleetFoundCount').textContent = `${foundCount} / ${state.fleetTargets.length}`;
  }

  function renderFleetGrid() {
    const container = document.getElementById('fleetGridContainer');
    const N = state.fleetSize; // 7
    const padLeft = 52;
    const padTop = 48;
    const padRight = 24;
    const padBottom = 24;
    const size = 500;
    const cellW = (size - padLeft - padRight) / N;
    const cellH = (size - padTop - padBottom) / N;

    let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Radar marítim de caselles A-G i 1-7">`;

    // Column headers A..G
    for (let c = 0; c < N; c++) {
      const cx = padLeft + c * cellW + cellW / 2;
      svg += `<rect x="${padLeft + c * cellW + 2}" y="10" width="${cellW - 4}" height="30" rx="8" fill="#ffedd5" />`;
      svg += `<text x="${cx}" y="31" text-anchor="middle" font-size="16" font-weight="900" fill="#ea580c">${LETTERS[c]}</text>`;
    }

    // Row headers 1..7
    for (let r = 0; r < N; r++) {
      const cy = padTop + r * cellH + cellH / 2;
      svg += `<rect x="10" y="${padTop + r * cellH + 2}" width="34" height="${cellH - 4}" rx="8" fill="#ccfbf1" />`;
      svg += `<text x="27" y="${cy + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="#0d9488">${r + 1}</text>`;
    }

    // Grid cells
    for (let c = 0; c < N; c++) {
      for (let r = 0; r < N; r++) {
        const x = padLeft + c * cellW;
        const y = padTop + r * cellH;
        const key = `${c},${r}`;
        const status = state.fleetProbes[key];

        let fill = '#f0f9ff';
        let icon = '';

        if (status === 'hit') {
          fill = '#dcfce7';
          const target = state.fleetTargets.find((t) => t.c === c && t.r === r);
          icon = target ? target.emoji : '⛵';
        } else if (status === 'hot') {
          fill = '#ffedd5';
          icon = '🔥';
        } else if (status === 'cold') {
          fill = '#e0f2fe';
          icon = '🌊';
        }

        svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="#7dd3fc" stroke-width="1.5" class="grid-cell-hit" data-c="${c}" data-r="${r}" />`;

        if (icon) {
          svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 9}" text-anchor="middle" font-size="25" pointer-events="none">${icon}</text>`;
        } else {
          svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="#94a3b8" pointer-events="none">${LETTERS[c]}${r + 1}</text>`;
        }
      }
    }

    svg += `</svg>`;
    container.innerHTML = svg;

    container.querySelectorAll('.grid-cell-hit').forEach((el) => {
      el.addEventListener('click', () => {
        fireRadarProbe(parseInt(el.dataset.c, 10), parseInt(el.dataset.r, 10));
      });
    });
  }

  // ==================== EVENT LISTENERS & INITIALIZATION ====================
  function initEvents() {
    // Avatar switcher
    const avatarBtn = document.getElementById('avatarBtn');
    avatarBtn.addEventListener('click', () => {
      state.avatarIdx = (state.avatarIdx + 1) % AVATARS.length;
      document.getElementById('currentAvatar').textContent = AVATARS[state.avatarIdx];
      playSound('click');
    });

    // Sound toggle
    const soundBtn = document.getElementById('soundToggle');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
      if (state.soundEnabled) playSound('click');
    });

    // Mode tabs navigation
    document.querySelectorAll('.mode-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        state.activeMode = mode;
        playSound('click');

        document.querySelectorAll('.mode-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.mode-panel').forEach((p) => p.classList.remove('active'));
        document.getElementById(`mode-${mode}`).classList.add('active');
      });
    });

    // Mode 1: Explore type switches & quick-try buttons
    document.getElementById('expTypePoints').addEventListener('click', (e) => {
      state.exploreType = 'points';
      e.currentTarget.classList.add('active');
      document.getElementById('expTypeCells').classList.remove('active');
      playSound('click');
      renderExploreMode();
    });

    document.getElementById('expTypeCells').addEventListener('click', (e) => {
      state.exploreType = 'cells';
      e.currentTarget.classList.add('active');
      document.getElementById('expTypePoints').classList.remove('active');
      playSound('click');
      renderExploreMode();
    });

    document.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [gx, gy] = btn.dataset.goto.split(',').map(Number);
        state.exploreType = 'points';
        document.getElementById('expTypePoints').classList.add('active');
        document.getElementById('expTypeCells').classList.remove('active');
        state.exploreX = gx;
        state.exploreY = gy;
        playSound('click');
        renderExploreMode();
      });
    });

    // Mode 2: Treasure Hunt controls
    document.getElementById('trTypePoints').addEventListener('click', (e) => {
      state.treasureType = 'points';
      e.currentTarget.classList.add('active');
      document.getElementById('trTypeCells').classList.remove('active');
      playSound('click');
      generateTreasureMission();
    });

    document.getElementById('trTypeCells').addEventListener('click', (e) => {
      state.treasureType = 'cells';
      e.currentTarget.classList.add('active');
      document.getElementById('trTypePoints').classList.remove('active');
      playSound('click');
      generateTreasureMission();
    });

    document.getElementById('trCheckBtn').addEventListener('click', checkTreasureWrittenAnswer);
    document.getElementById('trNextBtn').addEventListener('click', () => {
      playSound('click');
      generateTreasureMission();
    });

    document.getElementById('trHintBtn').addEventListener('click', () => {
      state.treasureShowHint = true;
      playSound('click');
      renderTreasureGrid();
    });

    // Mode 3: Drawing controls
    document.getElementById('drawingSelect').addEventListener('change', (e) => {
      state.currentDrawingKey = e.target.value;
      playSound('click');
      initDrawingMode();
    });

    document.getElementById('drawResetBtn').addEventListener('click', () => {
      playSound('click');
      initDrawingMode();
    });

    // Mode 4: Robot controls + keyboard arrows
    document.querySelectorAll('.dpad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        moveRobot(btn.dataset.dir);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (state.activeMode !== 'robot') return;
      if (e.key === 'ArrowUp') { e.preventDefault(); moveRobot('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveRobot('down'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); moveRobot('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); moveRobot('right'); }
    });

    document.getElementById('robotResetBtn').addEventListener('click', () => {
      playSound('click');
      resetRobotPosition();
    });

    document.getElementById('robotNewLevelBtn').addEventListener('click', () => {
      playSound('click');
      generateRobotLevel();
    });

    // Mode 5: Fleet radar controls
    document.getElementById('radarFireBtn').addEventListener('click', () => {
      const c = parseInt(document.getElementById('radarColSelect').value, 10);
      const r = parseInt(document.getElementById('radarRowSelect').value, 10);
      fireRadarProbe(c, r);
    });

    document.getElementById('fleetNewGameBtn').addEventListener('click', () => {
      playSound('click');
      initFleetGame();
    });
  }

  // Initialize all modes on page load
  initEvents();
  updateScoreUI();
  renderExploreMode();
  generateTreasureMission();
  initDrawingMode();
  generateRobotLevel();
  initFleetGame();
})();
