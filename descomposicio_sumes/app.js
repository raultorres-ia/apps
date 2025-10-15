// Estat general
const state = {
  score: { correct: 0, attempts: 0, streak: 0 },
  descomp: { n: null, level: 'mitja' },
  sumes: { a: null, b: null, digits: 3 },
};

// Utilitats
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function updateScore(delta) {
  if (delta === true) { state.score.correct++; state.score.streak++; }
  if (delta !== null) { state.score.attempts++; }
  if (delta === false) { state.score.streak = 0; }
  $$('[data-score="correct"]').forEach(el=> el.textContent = state.score.correct);
  $$('[data-score="attempts"]').forEach(el=> el.textContent = state.score.attempts);
  $$('[data-score="streak"]').forEach(el=> el.textContent = state.score.streak);
}

function switchTab(name){
  $$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
  $$('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===`tab-${name}`));
}

// DESCOMPOSICIÓ
function descompBounds(level){
  if(level==='facil') return [0,99];
  if(level==='dificil') return [500,999];
  return [100,499];
}

function newDescomp(){
  const level = $('#descomp-diff').value;
  state.descomp.level = level;
  const [lo,hi] = descompBounds(level);
  const n = Math.floor(Math.random()*(hi-lo+1))+lo;
  state.descomp.n = n;
  $('#descomp-number').textContent = n;
  $('#centenes').value = '';
  $('#desenes').value = '';
  $('#unitats').value = '';
  setFeedback('#descomp-feedback');
  $('#descomp-expanded').textContent = '';
  renderAbacus(0,0,0);
}

function checkDescomp(){
  const n = state.descomp.n;
  if(n==null) return;
  const c = parseInt($('#centenes').value||'0',10);
  const d = parseInt($('#desenes').value||'0',10);
  const u = parseInt($('#unitats').value||'0',10);
  if([c,d,u].some(v => Number.isNaN(v))) return;
  if(c<0||d<0||u<0||c>9||d>9||u>9){
    setFeedback('#descomp-feedback','Introdueix nombres entre 0 i 9', false);
    return;
  }
  const value = c*100 + d*10 + u;
  const ok = value === n;
  setFeedback('#descomp-feedback', ok ? 'Molt bé! 🎉' : 'Encara no. Torna-ho a provar!', ok);
  $('#descomp-expanded').textContent = `${n} = ${c*100} + ${d*10} + ${u}`;
  updateScore(ok);
}

function hintDescomp(){
  const n = state.descomp.n;
  if(n==null) return;
  const c = Math.floor(n/100), d = Math.floor((n%100)/10), u = n%10;
  setFeedback('#descomp-feedback', `Pensa en ${c} centenes, ${d} desenes i ${u} unitats.`, null);
}

// SUMES
function randomWithDigits(d){
  if(d===2) return Math.floor(Math.random()*90)+10; // 10..99
  return Math.floor(Math.random()*900)+100; // 100..999
}

function newSum(){
  const digits = parseInt($('#sumes-digits').value,10);
  state.sumes.digits = digits;
  const a = randomWithDigits(digits);
  const b = randomWithDigits(digits);
  state.sumes.a = a; state.sumes.b = b;
  $('#sum-a').textContent = a;
  $('#sum-b').textContent = b;
  $('#sum-answer').value = '';
  setFeedback('#sumes-feedback');
}

function checkSum(){
  const {a,b} = state.sumes;
  if(a==null||b==null) return;
  const ans = ($('#sum-answer').value||'').replace(/\s+/g,'');
  if(!/^\d+$/.test(ans)){
    setFeedback('#sumes-feedback','Escriu un nombre vàlid.', false);
    return;
  }
  const ok = parseInt(ans,10) === (a+b);
  setFeedback('#sumes-feedback', ok ? 'Genial! 🎉' : `Revisa-ho: prova de sumar unitats, desenes i centenes.`, ok);
  updateScore(ok);
}



// ÀBAC (descomposició)
function bead(count){
  const frag = document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const b = document.createElement('div');
    b.className = 'bead';
    frag.appendChild(b);
  }
  return frag;
}

function renderAbacus(c, d, u) {
  const cTrack = $('[data-abacus-col="C"]');
  const dTrack = $('[data-abacus-col="D"]');
  const uTrack = $('[data-abacus-col="U"]');

  if (cTrack) {
    cTrack.innerHTML = '';
    cTrack.appendChild(bead(clamp(c || 0, 0, 9)));
  }
  if (dTrack) {
    dTrack.innerHTML = '';
    dTrack.appendChild(bead(clamp(d || 0, 0, 9)));
  }
  if (uTrack) {
    uTrack.innerHTML = '';
    uTrack.appendChild(bead(clamp(u || 0, 0, 9)));
  }
}

// Feedback helper
function setFeedback(sel, text='', ok=null){
  const el = $(sel);
  el.textContent = text;
  el.classList.remove('ok','ko');
  if(ok===true) el.classList.add('ok');
  if(ok===false) el.classList.add('ko');
}

// Navegació pestanyes
$$('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> switchTab(btn.dataset.tab));
});

// Descomp events
$('#descomp-diff').addEventListener('change', newDescomp);
$('#descomp-new').addEventListener('click', newDescomp);
$('#descomp-check').addEventListener('click', checkDescomp);
$('#descomp-help').addEventListener('click', hintDescomp);
$('#descomp-next').addEventListener('click', newDescomp);
['#centenes','#desenes','#unitats'].forEach(sel=>{
  $(sel).addEventListener('keyup', (e)=>{ if(e.key==='Enter') checkDescomp(); });
});

// SUMES UI helpers (columnes)
function toDigits3(n){
  const s = String(n).padStart(3,' ');
  return { h: s[s.length-3]||' ', t: s[s.length-2]||' ', u: s[s.length-1]||' ' };
}

function renderSum(){
  const {a,b} = state.sumes;
  const ad = toDigits3(a||'');
  const bd = toDigits3(b||'');
  $('#a-h').textContent = ad.h; $('#a-t').textContent = ad.t; $('#a-u').textContent = ad.u;
  $('#b-h').textContent = bd.h; $('#b-t').textContent = bd.t; $('#b-u').textContent = bd.u;
  $('#ans-h').value = ''; $('#ans-t').value = ''; $('#ans-u').value = '';
  // Ajusta layout 2 o 3 xifres (oculta centenes dels sumands i la porta)
  const grid = $('#sum-grid');
  if(state.sumes.digits===2){
    grid.classList.add('two-digits');
    $('#carry-h').setAttribute('disabled','');
  } else {
    grid.classList.remove('two-digits');
    $('#carry-h').removeAttribute('disabled');
  }
}

function newSum(){
  const digits = parseInt($('#sumes-digits').value,10);
  state.sumes.digits = digits;
  const a = randomWithDigits(digits);
  const b = randomWithDigits(digits);
  state.sumes.a = a; state.sumes.b = b;
  renderSum();
  setFeedback('#sumes-feedback');
  setTimeout(()=> $('#ans-u').focus(), 0);
}

function readAnsInputs(){
  const h = $('#ans-h').value.trim();
  const t = $('#ans-t').value.trim();
  const u = $('#ans-u').value.trim();
  const hv = h==='' ? 0 : parseInt(h,10);
  const tv = t==='' ? 0 : parseInt(t,10);
  const uv = u==='' ? 0 : parseInt(u,10);
  if([hv,tv,uv].some(v=> Number.isNaN(v) || v<0 || v>9)) return null;
  return hv*100 + tv*10 + uv;
}

function checkSum(){
  const {a,b} = state.sumes;
  if(a==null||b==null) return;
  const val = readAnsInputs();
  if(val==null){
    setFeedback('#sumes-feedback','Escriu dígits vàlids (0–9).', false);
    return;
  }
  const ok = val === (a+b);
  setFeedback('#sumes-feedback', ok ? 'Genial! 🎉' : `Revisa les columnes i les portes.`, ok);
  updateScore(ok);
}

// Sumes events
$('#sumes-digits').addEventListener('change', newSum);
$('#sumes-new').addEventListener('click', newSum);
$('#sumes-check').addEventListener('click', checkSum);

$('#sumes-next').addEventListener('click', newSum);
['#ans-h','#ans-t','#ans-u'].forEach(sel=>{
  const inputEl = $(sel);
  inputEl.addEventListener('input', (e)=>{
    // Solo un dígito 0-9
    const v = (e.target.value||'').replace(/\D/g,'');
    e.target.value = v.slice(0,1);
    if(e.target.value.length===1){
      // Auto-salto U->D->C
      if(e.target.id==='ans-u') $('#ans-t').focus();
      else if(e.target.id==='ans-t') $('#ans-h').focus();
    }
  });
  inputEl.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){ checkSum(); }
    if(e.key==='ArrowUp' || e.key==='ArrowDown'){
      e.preventDefault();
      const cur = parseInt(e.target.value||'0',10);
      const base = Number.isNaN(cur)?0:cur;
      const delta = e.key==='ArrowUp'? 1 : -1;
      const next = (base + delta + 10) % 10;
      e.target.value = String(next);
      // Auto-salto cuando ya hay valor
      if(e.target.id==='ans-u') $('#ans-t').focus();
      else if(e.target.id==='ans-t') $('#ans-h').focus();
    }
    if(e.key==='Backspace' && e.target.value===''){
      if(e.target.id==='ans-h') $('#ans-t').focus();
      else if(e.target.id==='ans-t') $('#ans-u').focus();
    }
  });
});

// Limita llevades a un dígit
['#carry-h','#carry-t','#carry-u'].forEach(sel=>{
  const el = $(sel);
  if(!el) return;
  el.addEventListener('input', (e)=>{
    const v = (e.target.value||'').replace(/\D/g,'');
    e.target.value = v.slice(0,1);
    if(e.target.value.length===1){
      if(e.target.id==='carry-u') $('#carry-t').focus();
      else if(e.target.id==='carry-t') $('#carry-h').focus();
    }
  });
  el.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowUp' || e.key==='ArrowDown'){
      e.preventDefault();
      const cur = parseInt(e.target.value||'0',10);
      const base = Number.isNaN(cur)?0:cur;
      const delta = e.key==='ArrowUp'? 1 : -1;
      const next = (base + delta + 10) % 10;
      e.target.value = String(next);
      if(e.target.id==='carry-u') $('#carry-t').focus();
      else if(e.target.id==='carry-t') $('#carry-h').focus();
    }
    if(e.key==='Backspace' && e.target.value===''){
      if(e.target.id==='carry-h') $('#carry-t').focus();
      else if(e.target.id==='carry-t') $('#carry-u').focus();
    }
  });
});

// Descomp: actualitza àbac en escriure
['#centenes','#desenes','#unitats'].forEach((sel,idx)=>{
  $(sel).addEventListener('input', ()=>{
    const c = parseInt($('#centenes').value||'0',10);
    const d = parseInt($('#desenes').value||'0',10);
    const u = parseInt($('#unitats').value||'0',10);
    renderAbacus(Number.isNaN(c)?0:c, Number.isNaN(d)?0:d, Number.isNaN(u)?0:u);
  });
});


function handleArrowClick(event) {
  const button = event.currentTarget;
  const inputId = button.dataset.for;
  const action = button.dataset.action;
  const input = $(`#${inputId}`);
  if (!input) return;

  let value = parseInt(input.value || '0', 10);
  if (action === 'increment') {
    value = (value + 1) % 10;
  } else {
    value = (value - 1 + 10) % 10;
  }
  input.value = value;

  // Trigger input event to update abacus
  const inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent);
}

// Inicialització
$$('.arrow-btn').forEach(btn => {
  btn.addEventListener('click', handleArrowClick);
});
newDescomp();
newSum();
updateScore(null);
// --- Afegits: millores de sumes ---
// Genera operands evitant desbordament a milers quan són 3 xifres
function genOperands(d){
  if(d===2){
    const a = Math.floor(Math.random()*90)+10;
    const b = Math.floor(Math.random()*90)+10;
    return [a,b];
  }
  let a = Math.floor(Math.random()*800)+100; // 100..899 per garantir marge
  let maxB = 999 - a;
  if(maxB < 100){ a = 100; maxB = 899; }
  const b = Math.floor(Math.random()*(maxB-100+1))+100;
  return [a,b];
}

// Sobreescriu newSum per usar genOperands i focalitzar unitats
function newSum(){
  const digits = parseInt($('#sumes-digits').value,10);
  state.sumes.digits = digits;
  const [a,b] = genOperands(digits);
  state.sumes.a = a; state.sumes.b = b;
  if(typeof renderSum === 'function'){
    renderSum();
  } else {
    $('#sum-a').textContent = a;
    $('#sum-b').textContent = b;
    $('#sum-answer').value = '';
  }
  setFeedback('#sumes-feedback');
  setTimeout(()=> $('#ans-u') ? $('#ans-u').focus() : undefined, 0);
}



// Bloqueja autosalt (captura) i manté només un dígit als camps de sumes
['#ans-h','#ans-t','#ans-u','#carry-h','#carry-t','#carry-u'].forEach(sel=>{
  const el = document.querySelector(sel);
  if(!el) return;
  el.addEventListener('input', (e)=>{
    const v = (e.target.value||'').toString().replace(/\D/g,'');
    e.target.value = v.slice(0,1);
    e.stopImmediatePropagation();
  }, true);
  el.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowUp' || e.key==='ArrowDown' || e.key==='Backspace'){
      // Deixa el comportament per defecte (increment/decrement o esborrar) però evita els listeners antics
      e.stopImmediatePropagation();
    }
  }, true);
});
