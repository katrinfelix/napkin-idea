/* ================================================
   Главная логика: навигация, XP, геймификация
   ================================================ */
let xp = 0, stk = 0, curSec = 0, selectedNiche = null, chosenOffer = null, delegState = {};
const xpMap = { 1: 10, 2: 10, 3: 10, 4: 20, 5: 25, 6: 20, 7: 15, 8: 15, 9: 20 };
const totalSteps = 9;
const achs = [
  { at: 1, i: '🌱', n: 'Ниша выбрана!' },
  { at: 4, i: '💎', n: 'Оффер создан!' },
  { at: 5, i: '💰', n: 'Финмодель готова!' },
  { at: 6, i: '📡', n: 'Каналы найдены!' },
  { at: 9, i: '🏆', n: 'Бизнес-паспорт!' }
];

/* ===== Niche Grid Init ===== */
function initNicheGrid() {
  const g = document.getElementById('nicheGrid');
  Object.entries(DB).forEach(([k, v]) => {
    const d = document.createElement('div');
    d.className = 'niche-card'; d.dataset.key = k;
    d.setAttribute('data-tilt', '');
    d.setAttribute('data-tilt-max', '6');
    d.setAttribute('data-tilt-speed', '400');
    d.innerHTML = `<span class="nc-icon">${v.icon}</span><div class="nc-name">${v.name}</div><div class="nc-sub">${v.audiences[0].substring(0, 28)}...</div>`;
    d.onclick = () => {
      document.querySelectorAll('.niche-card').forEach(c => c.classList.remove('selected'));
      d.classList.add('selected'); selectedNiche = k; playSound(800, .05, .1);
    };
    g.appendChild(d);
  });
  // Init tilt on new cards after they exist
  setTimeout(initTilt, 100);
}

function initGameBar() {
  const g = document.getElementById('gsteps'); g.innerHTML = '';
  for (let i = 1; i <= totalSteps; i++) {
    const s = document.createElement('div');
    s.className = 'gs'; s.id = 'gs' + i;
    g.appendChild(s);
  }
}

/* ===== Navigation ===== */
function startGame() {
  document.getElementById('heroS').style.display = 'none';
  document.getElementById('qArea').style.display = '';
  document.getElementById('gbar').classList.add('on');
  initGameBar(); initNicheGrid(); goSec(1);
}

function backHero() {
  document.getElementById('heroS').style.display = '';
  document.getElementById('qArea').style.display = 'none';
  document.getElementById('gbar').classList.remove('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goSec(n) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(n === 'result' ? 'sResult' : 's' + n);
  if (el) { el.classList.add('active'); el.style.animation = 'none'; void el.offsetHeight; el.style.animation = ''; }
  curSec = n;
  for (let i = 1; i <= totalSteps; i++) {
    const s = document.getElementById('gs' + i);
    if (s) s.className = 'gs' + (i < n ? ' done' : i == n ? ' cur' : '');
  }
  window.scrollTo({ top: document.getElementById('qArea').offsetTop - 70, behavior: 'smooth' });
}

function next(n) {
  addXP(xpMap[n - 1] || 10);
  if (n === 2) genAud();
  if (n === 3) genProb();
  if (n === 4) genOffers();
  if (n === 5) initPricing();
  if (n === 6) genRadar();
  if (n === 7) genComp();
  if (n === 8) genDeleg();
  achs.forEach(a => { if (a.at === n - 1 && !a.done) { a.done = true; setTimeout(() => showAchievement(a.i, a.n), 600); } });
  goSec(n); popReaction(); spawnFloats();
}

function prev(n) { goSec(n); }

/* ===== XP System ===== */
function addXP(v) {
  xp += v; stk++;
  document.getElementById('xpL').textContent = xp + ' XP';
  document.getElementById('gxp').textContent = '★ ' + xp;
  document.getElementById('xpF').style.width = Math.min(100, (xp / 165) * 100) + '%';
  const lv = xp < 20 ? 1 : xp < 50 ? 2 : xp < 90 ? 3 : xp < 130 ? 4 : 5;
  document.getElementById('lvlB').textContent = 'Lvl ' + lv;
  document.getElementById('streak').textContent = '🔥 ' + stk;
  playSound(600 + xp, .03, .15);
}

/* ===== Passport ===== */
function showPassport() {
  addXP(xpMap[9] || 20);
  achs.forEach(a => { if (a.at === 9 && !a.done) { a.done = true; setTimeout(() => showAchievement(a.i, a.n), 600); } });
  buildPassport();
  goSec('result');
  confetti(); popReaction();
}

/* ===== PNG Export ===== */
function dlPNG() {
  if (typeof html2canvas !== 'undefined') {
    html2canvas(document.getElementById('passCard'), {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
      scale: 2
    }).then(c => {
      const a = document.createElement('a');
      a.download = 'business-passport.png';
      a.href = c.toDataURL(); a.click();
    });
  } else {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => dlPNG();
    document.head.appendChild(s);
  }
}
