// Dades de la taula extretes del PDF
const ACTIVITATS = [
  { id: 'dutxa', nom: 'Dutxa', consum: 70 },
  { id: 'bany', nom: 'Bany', consum: 300 },
  { id: 'rentar-mans', nom: 'Rentar mans', consum: 2 },
  { id: 'rentar-dents', nom: 'Rentar dents', consum: 2 },
  { id: 'diposit-wc', nom: 'Dipòsit WC', consum: 4 },
  { id: 'rentadora', nom: 'Rentadora', consum: 90 },
  { id: 'rentaplats', nom: 'Rentaplats', consum: 30 },
  { id: 'cuina-beure', nom: 'Cuina i beure per persona', consum: 3 },
  { id: 'rentar-plats-ma', nom: 'Rentar plats a mà', consum: 15 },
];

function clampNum(n) {
  if (isNaN(n) || !isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function formatLitres(n) {
  return new Intl.NumberFormat('ca-ES').format(n);
}

function buildTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  for (const a of ACTIVITATS) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${a.nom}</strong></td>
      <td class="center">${a.consum}</td>
      <td class="center"><input type="number" min="0" step="1" inputmode="numeric" aria-label="${a.nom} dissabte" data-id="${a.id}" data-day="ds" /></td>
      <td class="center"><input type="number" min="0" step="1" inputmode="numeric" aria-label="${a.nom} diumenge" data-id="${a.id}" data-day="dg" /></td>
      <td class="center"><span class="value" id="fam-${a.id}">0</span></td>
    `;
    tbody.appendChild(tr);
  }
}

function buildCards() {
  const cards = document.getElementById('cards');
  cards.innerHTML = '';
  for (const a of ACTIVITATS) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="title">${a.nom}</div>
      <div class="muted">Consum per ús: <span class="chip">${a.consum} L</span></div>
      <div class="row-3">
        <label>Dissabte
          <input type="number" min="0" step="1" inputmode="numeric" aria-label="${a.nom} dissabte" data-id="${a.id}" data-day="ds" />
        </label>
        <label>Diumenge
          <input type="number" min="0" step="1" inputmode="numeric" aria-label="${a.nom} diumenge" data-id="${a.id}" data-day="dg" />
        </label>
        <div class="total-box">
          <span class="muted">Consum familiar</span>
          <span class="litres" id="fam-${a.id}-card">0 L</span>
        </div>
      </div>
    `;
    cards.appendChild(el);
  }
}

function recompute() {
  // Llegeix totes les entrades i usa el màxim valor entre duplicats (taula/cards)
  const inputs = Array.from(document.querySelectorAll('input[data-id]'));
  const perAct = new Map(); // {id: {ds: n, dg: n}}
  for (const inp of inputs) {
    const id = inp.getAttribute('data-id');
    const day = inp.getAttribute('data-day');
    const n = clampNum(Number(inp.value));
    if (!perAct.has(id)) perAct.set(id, { ds: 0, dg: 0 });
    const ref = perAct.get(id);
    ref[day] = Math.max(ref[day], n);
  }

  let total = 0;
  for (const a of ACTIVITATS) {
    const uses = perAct.get(a.id) || { ds: 0, dg: 0 };
    const sumUses = clampNum(uses.ds) + clampNum(uses.dg);
    const fam = sumUses * a.consum;
    total += fam;

    // Taula
    const elTable = document.getElementById(`fam-${a.id}`);
    if (elTable) elTable.textContent = formatLitres(fam);
    // Targeta
    const elCard = document.getElementById(`fam-${a.id}-card`);
    if (elCard) elCard.textContent = `${formatLitres(fam)} L`;
  }
  const totalEl = document.getElementById('totalLitres');
  if (totalEl) totalEl.textContent = formatLitres(total);
}

function wireInputs() {
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (!t.hasAttribute('data-id')) return;
    // Sanititza al vol
    const n = clampNum(Number(t.value));
    if (String(n) !== t.value) t.value = String(n);
    // Sincronitza l'altre input (taula/cards) amb el mateix id i dia
    const id = t.getAttribute('data-id');
    const day = t.getAttribute('data-day');
    const sel = `input[data-id="${id}"][data-day="${day}"]`;
    document.querySelectorAll(sel).forEach((el) => {
      if (el !== t) el.value = String(n);
    });
    recompute();
  });
}

function restoreState() {
  try {
    const raw = localStorage.getItem('consum-aigua-v1');
    if (!raw) return;
    const state = JSON.parse(raw);
    for (const { id, ds, dg } of state || []) {
      const sels = [
        `input[data-id="${id}"][data-day="ds"]`,
        `input[data-id="${id}"][data-day="dg"]`,
      ];
      const [inDs, inDg] = sels.map((s) => document.querySelector(s));
      if (inDs) inDs.value = String(clampNum(ds));
      if (inDg) inDg.value = String(clampNum(dg));
    }
  } catch (_) { /* ignore */ }
}

function saveState() {
  const inputs = Array.from(document.querySelectorAll('input[data-id]'));
  const map = new Map();
  for (const inp of inputs) {
    const id = inp.getAttribute('data-id');
    const day = inp.getAttribute('data-day');
    const n = clampNum(Number(inp.value));
    if (!map.has(id)) map.set(id, { id, ds: 0, dg: 0 });
    map.get(id)[day] = n;
  }
  localStorage.setItem('consum-aigua-v1', JSON.stringify(Array.from(map.values())));
}

function wireReset() {
  const btn = document.getElementById('resetBtn');
  btn?.addEventListener('click', () => {
    document.querySelectorAll('input[data-id]').forEach((inp) => (inp.value = ''));
    recompute();
    saveState();
  });
}

function autoSave() {
  let t;
  document.addEventListener('input', (ev) => {
    if (!(ev.target instanceof HTMLInputElement)) return;
    clearTimeout(t);
    t = setTimeout(saveState, 150);
  });
}

function init() {
  buildTable();
  buildCards();
  wireInputs();
  wireReset();
  restoreState();
  recompute();
  autoSave();
}

document.addEventListener('DOMContentLoaded', init);
