/**
 * Mur d'apps · Vibe Coding — part del servidor (Google Apps Script)
 *
 * Totes les dades es guarden en el full de càlcul de Google Drive on hi ha
 * enganxat aquest codi (Extensions > Apps Script). És l'ÚNIC fitxer que cal a
 * Apps Script. Hi ha dues pestanyes:
 *   - «Col·leccions»: una fila per curs o sessió (la crees i la tanques tu).
 *   - «Apps»: una fila per app compartida pels docents.
 * Per moderar, només cal esborrar o editar files directament al full.
 */

// Identificador del full (el tros llarg de l'adreça docs.google.com/spreadsheets/d/…/edit).
// Buit = el full on està enganxat aquest codi (Extensions > Apps Script).
const ID_FULL = '';
function llibre_() {
  return ID_FULL ? SpreadsheetApp.openById(ID_FULL) : SpreadsheetApp.getActive();
}

const FULL_APPS = 'Apps';
const FULL_COL = 'Col·leccions';
const CAP_APPS = ['id', 'data', 'colleccio', 'titol', 'url', 'descripcio', 'autor', 'eina', 'etapa', 'emoji', 'prompt', 'likes'];
const CAP_COL = ['id', 'titol', 'descripcio', 'emoji', 'oberta', 'enllac'];
// Llocs acceptats per a les apps (ha de coincidir amb ENLLACOS d'index.html).
const ENLLACOS = [
  ['Gemini', /^https:\/\/(gemini\.google\.com|g\.co\/gemini)\/[^\s<>"']*$/i],
  ['Google Sites', /^https:\/\/sites\.google\.com\/[^\s<>"']+$/i],
  ['GitHub', /^https:\/\/([a-z0-9-]+\.github\.io(\/[^\s<>"']*)?|github\.com\/[^\s<>"']+)$/i],
  ['ja.cat', /^https:\/\/ja\.cat\/[^\s<>"']+$/i]
];
function einaDe_(url) {
  const l = ENLLACOS.find(e => e[1].test(url));
  return l ? l[0] : '';
}

/*
 * La pàgina del mur és a GitHub Pages i parla amb aquest script com a API:
 *   GET  …/exec                      → totes les col·leccions i apps (JSON)
 *   POST …/exec  {accio:'afegeix', …} → afegeix una app
 *   POST …/exec  {accio:'like', id, delta} → suma o resta un «m'agrada»
 * Aquí no cal cap fitxer HTML.
 */
function json_(dades) {
  return ContentService.createTextOutput(JSON.stringify(dades)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  try {
    return json_({ ok: true, dades: getData() });
  } catch (e) {
    return json_({ ok: false, error: e.message });
  }
}

function doPost(e) {
  try {
    const cos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (cos.accio === 'afegeix') return json_({ ok: true, item: addItem(cos.dades) });
    if (cos.accio === 'like') return json_({ ok: true, likes: like(cos.id, cos.delta) });
    return json_({ ok: false, error: 'Acció desconeguda.' });
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/** Executa-la un cop des de l'editor: crea les pestanyes i demana els permisos. */
function configura() {
  prepara_();
  try { llibre_().toast('Mur d\'apps preparat ✔', 'Vibe Coding', 5); } catch (e) { /* sense full obert */ }
  Logger.log('Mur d\'apps preparat ✔ (' + llibre_().getName() + ')');
}

function prepara_() {
  const ss = llibre_();
  if (!ss.getSheetByName(FULL_COL)) {
    const col = ss.insertSheet(FULL_COL);
    col.appendRow(CAP_COL);
    col.appendRow(['vibe-coding-1', 'Curs de Vibe Coding', 'Compartim les apps que hem creat amb Gemini durant el curs.', '🚀', 'SÍ', '']);
    col.setFrozenRows(1);
    col.getRange(1, 1, 1, CAP_COL.length).setFontWeight('bold');
  }
  if (!ss.getSheetByName(FULL_APPS)) {
    const apps = ss.insertSheet(FULL_APPS);
    apps.appendRow(CAP_APPS);
    apps.setFrozenRows(1);
    apps.getRange(1, 1, 1, CAP_APPS.length).setFontWeight('bold');
  }
}

function llegeix_(full) {
  const files = full.getDataRange().getValues();
  const cap = files.shift().map(c => String(c).trim());
  return files.map(f => {
    const o = {};
    cap.forEach((c, i) => { o[c] = f[i]; });
    return o;
  });
}

function colleccions_() {
  return llegeix_(llibre_().getSheetByName(FULL_COL))
    .filter(c => String(c.id).trim() && String(c.titol).trim())
    .map(c => ({
      id: String(c.id).trim(),
      titol: String(c.titol),
      descripcio: String(c.descripcio || ''),
      emoji: String(c.emoji || '📁'),
      oberta: !/^no$/i.test(String(c.oberta).trim()),
      // Enllaç d'una pàgina de Google Sites on hi ha el mur (per al codi QR). Opcional.
      enllac: /^https:\/\/[^\s<>"']+$/i.test(String(c.enllac || '').trim()) ? String(c.enllac).trim() : ''
    }));
}

/** Retorna totes les col·leccions i apps. */
function getData() {
  prepara_();
  const apps = llegeix_(llibre_().getSheetByName(FULL_APPS))
    .filter(a => String(a.id).trim() && String(a.titol).trim() && /^https:\/\//i.test(String(a.url)))
    .map(a => ({
      id: String(a.id),
      data: a.data instanceof Date ? a.data.toISOString() : String(a.data || ''),
      colleccio: String(a.colleccio),
      titol: String(a.titol),
      url: String(a.url),
      descripcio: String(a.descripcio || ''),
      autor: String(a.autor || ''),
      eina: String(a.eina || ''),
      etapa: String(a.etapa || ''),
      emoji: String(a.emoji || '🧩'),
      prompt: String(a.prompt || ''),
      likes: Number(a.likes) || 0
    }));
  return { colleccions: colleccions_(), apps: apps };
}

function net_(valor, max) {
  return String(valor == null ? '' : valor).replace(/\s+/g, ' ').trim().slice(0, max);
}

function netLlarg_(valor, max) {
  return String(valor == null ? '' : valor).trim().slice(0, max);
}

/** Evita que un text que comença per = + - @ s'interpreti com a fórmula. */
function segur_(valor) {
  return (typeof valor === 'string' && /^[=+\-@]/.test(valor)) ? "'" + valor : valor;
}

/** Afegeix una app nova al mur. */
function addItem(d) {
  d = d || {};
  const titol = net_(d.titol, 80);
  const url = String(d.url || '').trim().slice(0, 500);
  if (!titol) throw new Error('Falta el títol de l\'app.');
  const eina = einaDe_(url);
  if (!eina) throw new Error('L\'enllaç ha de ser de Gemini, Google Sites, GitHub (github.com o …github.io) o ja.cat, i començar per https://');
  const colId = net_(d.colleccio, 60);
  const col = colleccions_().find(c => c.id === colId);
  if (!col) throw new Error('Aquesta col·lecció no existeix.');
  if (!col.oberta) throw new Error('Aquesta col·lecció ja està tancada.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ara = new Date();
    const item = {
      id: Utilities.getUuid().replace(/-/g, '').slice(0, 10),
      data: ara,
      colleccio: colId,
      titol: titol,
      url: url,
      descripcio: netLlarg_(d.descripcio, 400),
      autor: net_(d.autor, 40),
      eina: eina,
      etapa: net_(d.etapa, 30),
      emoji: net_(d.emoji, 8) || '🧩',
      prompt: netLlarg_(d.prompt, 2000),
      likes: 0
    };
    llibre_().getSheetByName(FULL_APPS)
      .appendRow(CAP_APPS.map(k => k === 'data' ? ara : segur_(item[k])));
    item.data = ara.toISOString();
    return item;
  } finally {
    lock.releaseLock();
  }
}

/** Suma (delta = 1) o resta (delta = -1) un «m'agrada». */
function like(id, delta) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const full = llibre_().getSheetByName(FULL_APPS);
    const n = Math.max(full.getLastRow() - 1, 1);
    const ids = full.getRange(2, 1, n, 1).getValues();
    const i = ids.findIndex(f => String(f[0]) === String(id));
    if (i < 0) throw new Error('No s\'ha trobat l\'app.');
    const cel = full.getRange(i + 2, CAP_APPS.indexOf('likes') + 1);
    const total = Math.max(0, (Number(cel.getValue()) || 0) + (Number(delta) < 0 ? -1 : 1));
    cel.setValue(total);
    return total;
  } finally {
    lock.releaseLock();
  }
}
