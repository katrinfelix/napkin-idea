/* ================================================
   Генераторы контента: офферы, радар, конкуренты, делегирование
   ================================================ */

function N() { return selectedNiche ? DB[selectedNiche] : DB.video; }
function fmt(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
function fK(n) { return n >= 1000 ? Math.round(n / 1000) + 'к ₽' : n + ' ₽'; }

/* Audience suggestions */
function genAud() {
  const n = N(); const d = document.getElementById('audSug'); d.innerHTML = '';
  const w = document.createElement('div');
  w.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';
  n.audiences.forEach(a => {
    const b = document.createElement('button'); b.className = 'btn-chip'; b.textContent = a;
    b.onclick = () => { document.getElementById('a2').value = a; document.querySelectorAll('#audSug .btn-chip').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); playSound(700, .04, .1); };
    w.appendChild(b);
  }); d.appendChild(w);
}

/* Problem suggestions */
function genProb() {
  const n = N(); const d = document.getElementById('probSug'); d.innerHTML = '';
  const w = document.createElement('div');
  w.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px';
  n.problems.forEach(p => {
    const b = document.createElement('button'); b.className = 'btn-chip'; b.style.textAlign = 'left'; b.textContent = p;
    b.onclick = () => { document.getElementById('a3').value = p; document.querySelectorAll('#probSug .btn-chip').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); playSound(700, .04, .1); };
    w.appendChild(b);
  }); d.appendChild(w);
}

/* Offer generation */
function genOffers() {
  const n = N(); const aud = document.getElementById('a2').value || n.audiences[0];
  const list = document.getElementById('offersList'); list.innerHTML = '';
  const counts = ['5', '10', '3'];
  n.offers.forEach((tpl, i) => {
    const text = tpl.replace('{audience}', aud.split(',')[0].substring(0, 40)).replace('{count}', counts[i] || '5').replace('{format}', 'Reels');
    const card = document.createElement('div'); card.className = 'offer-card';
    card.innerHTML = `<div class="offer-label">Вариант ${i + 1}</div><div class="offer-text">${text}</div>`;
    card.onclick = () => { document.querySelectorAll('.offer-card').forEach(c => c.classList.remove('chosen')); card.classList.add('chosen'); chosenOffer = text; playSound(900, .04, .15); };
    list.appendChild(card);
  });
  document.getElementById('sloganText').textContent = n.slogans[Math.floor(Math.random() * n.slogans.length)];
}

/* Pricing slider + dashboard */
function initPricing() {
  const n = N(); const sl = document.getElementById('priceSlider');
  sl.min = n.priceRange[0]; sl.max = n.priceRange[2]; sl.value = n.priceRange[1];
  document.getElementById('plMin').textContent = fmt(n.priceRange[0]);
  document.getElementById('plMax').textContent = fmt(n.priceRange[2]);
  document.getElementById('plMid').textContent = 'бенчмарк: ' + fmt(n.priceRange[1]);
  updateDash();
}

function updateDash() {
  const p = +document.getElementById('priceSlider').value;
  const u = +document.getElementById('unitsIn').value || 1;
  const h = +document.getElementById('hrsIn').value || 1;
  const rev = p * u, prof = Math.round(rev * .7), rate = Math.round(prof / (h * u));
  document.getElementById('priceVal').innerHTML = fmt(p);
  document.getElementById('dRev').textContent = fmt(rev);
  document.getElementById('dProf').textContent = fmt(prof);
  document.getElementById('dRate').textContent = fmt(rate);
  // Bar chart
  const bars = document.getElementById('barsChart'); bars.innerHTML = '';
  const months = ['Мес 1', 'Мес 2', 'Мес 3', 'Мес 4', 'Мес 5', 'Мес 6'];
  const growth = [.4, .6, .75, .85, .95, 1];
  months.forEach((m, i) => {
    const val = Math.round(rev * growth[i]);
    bars.innerHTML += `<div class="bar-col"><div class="bar-val">${Math.round(val / 1000)}к</div><div class="bar-fill" style="height:${growth[i] * 100}%"></div><div class="bar-lbl">${m}</div></div>`;
  });
}

/* Marketing Radar */
function genRadar() {
  const n = N(); const svg = document.getElementById('radarSvg'); const list = document.getElementById('radarList');
  const cx = 110, cy = 110, r = 80;
  const labels = ['Соцсети', 'Сарафан', 'Контент', 'Реклама', 'Партнёры', 'Холодные'];
  const scores = n.channels.map(c => c.score / 10);

  let html = `<defs><style>text{font-family:'Space Grotesk';font-size:9px;fill:var(--text-muted)}</style></defs>`;
  for (let ring = 1; ring <= 4; ring++) {
    const rr = r * ring / 4;
    html += `<polygon points="${labels.map((_, i) => { const a = Math.PI * 2 * i / 6 - Math.PI / 2; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(' ')}" fill="none" stroke="var(--border)" stroke-width="1"/>`;
  }
  labels.forEach((_, i) => {
    const a = Math.PI * 2 * i / 6 - Math.PI / 2;
    html += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="var(--border)"/>`;
    html += `<text x="${cx + (r + 14) * Math.cos(a)}" y="${cy + (r + 14) * Math.sin(a)}" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
  });
  const pts = scores.map((s, i) => { const a = Math.PI * 2 * i / 6 - Math.PI / 2; return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`; }).join(' ');
  html += `<polygon points="${pts}" fill="rgba(139,92,246,.12)" stroke="var(--accent)" stroke-width="2"/>`;
  scores.forEach((s, i) => { const a = Math.PI * 2 * i / 6 - Math.PI / 2; html += `<circle cx="${cx + r * s * Math.cos(a)}" cy="${cy + r * s * Math.sin(a)}" r="4" fill="var(--accent)" stroke="var(--text-primary)" stroke-width="1.5"/>`; });
  svg.innerHTML = html;

  list.innerHTML = '';
  n.channels.sort((a, b) => b.score - a.score).slice(0, 4).forEach((c, i) => {
    list.innerHTML += `<div class="radar-item"><div class="radar-item-title"><span>${['🥇', '🥈', '🥉', '📌'][i]}</span>${c.name}<span class="radar-score">${c.score}/10</span></div><div class="radar-item-desc">${c.tip}</div></div>`;
  });
}

/* Competitor analysis */
function genComp() {
  const n = N(); const p = +document.getElementById('priceSlider').value;
  let h = `<table class="comp-table"><thead><tr><th></th><th>Цена</th><th>Скорость</th><th>Качество</th></tr></thead><tbody><tr class="comp-you"><td><span class="comp-you-tag">🌟 Ты</span></td><td>${fmt(p)}</td><td>Быстро</td><td>Высокое</td></tr>`;
  n.competitors.forEach(c => { h += `<tr><td>${c.name}</td><td>${c.price}</td><td>${c.speed}</td><td>${c.quality}</td></tr>`; });
  h += `</tbody></table><div class="q-hint" style="margin-top:16px"><span class="hi">💡</span><span><b>Твоё преимущество:</b> Скорость + персональный подход + гибкость.</span></div>`;
  document.getElementById('compBlock').innerHTML = h;
}

/* Delegation matrix */
function genDeleg() {
  const n = N(); delegState = {};
  const def = { me: [0, 1, 4], asst: [2, 3, 7], auto: [5, 6] };
  n.tasks.forEach((t, i) => { delegState[t] = def.me.includes(i) ? 'me' : def.asst.includes(i) ? 'asst' : 'auto'; });
  renderDeleg();
}

function renderDeleg() {
  const d = document.getElementById('delegCols');
  const cols = { me: [], asst: [], auto: [] };
  Object.entries(delegState).forEach(([t, c]) => cols[c].push(t));
  const ic = { me: '👤', asst: '🤝', auto: '🤖' };
  const lb = { me: 'Я сам', asst: 'Ассистент', auto: 'Автоматизация' };
  const cls = { me: 'dc-me', asst: 'dc-asst', auto: 'dc-auto' };
  d.innerHTML = '';
  ['me', 'asst', 'auto'].forEach(c => {
    let h = `<div class="deleg-col ${cls[c]}"><div class="deleg-col-title">${ic[c]} ${lb[c]}</div>`;
    cols[c].forEach(t => { h += `<div class="deleg-item" onclick="moveDel('${t.replace(/'/g, "\\'")}')">${t}<span class="di-arrow">→</span></div>`; });
    h += `</div>`; d.innerHTML += h;
  });
}

function moveDel(t) {
  const nx = { me: 'asst', asst: 'auto', auto: 'me' };
  delegState[t] = nx[delegState[t]]; renderDeleg(); playSound(600, .03, .1);
}

/* Build passport */
function buildPassport() {
  const n = N();
  document.getElementById('ppNiche').textContent = n.icon + ' ' + n.name;
  document.getElementById('ppOffer').textContent = chosenOffer || n.offers[0].replace('{audience}', 'клиентов').replace('{count}', '5');
  document.getElementById('ppSlogan').textContent = '"' + n.slogans[0] + '"';
  document.getElementById('ppAud').textContent = document.getElementById('a2').value || n.audiences[0];
  document.getElementById('ppProb').textContent = document.getElementById('a3').value || n.problems[0];
  const p = +document.getElementById('priceSlider').value, u = +document.getElementById('unitsIn').value || 1;
  document.getElementById('ppPrice').textContent = fK(p);
  document.getElementById('ppRev').textContent = fK(p * u);
  document.getElementById('ppProfit').textContent = fK(Math.round(p * u * .7));
  document.getElementById('ppSales').textContent = u;
  document.getElementById('ppChannels').textContent = n.channels.sort((a, b) => b.score - a.score).slice(0, 3).map(c => c.name).join(' / ');
  const dd = document.getElementById('ppDeleg'); dd.innerHTML = '';
  Object.entries(delegState).forEach(([t, c]) => {
    const ic = c === 'me' ? '👤' : c === 'asst' ? '🤝' : '🤖';
    dd.innerHTML += `<span style="padding:3px 10px;border-radius:var(--r-full);font-size:11px;font-weight:600;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-secondary)">${ic} ${t}</span>`;
  });
  document.getElementById('ppAction').textContent = document.getElementById('a9').value || '—';
}
