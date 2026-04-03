/* ================================================
   ✨ WHIMSY INJECTOR — 3D Effects, Sounds, Particles
   ================================================ */

/* Vanta.js 3D Background */
function initVanta() {
  if (typeof VANTA === 'undefined') return;
  try {
    window.vantaEffect = VANTA.TOPOLOGY({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x8b5cf6,
      backgroundColor: document.documentElement.dataset.theme === 'light' ? 0xfaf8ff : 0x06030e
    });
  } catch(e) {
    console.warn('Vanta init failed:', e);
  }
}

/* Vanilla Tilt on cards */
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    VanillaTilt.init(el, {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      perspective: 1000
    });
  });
}

/* Sound effects via Web Audio */
function playSound(freq, vol, dur) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.value = vol;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

/* Confetti burst */
function confetti() {
  const colors = ['#8b5cf6','#c084fc','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'conf';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 8 + 4) + 'px';
    el.style.height = (Math.random() * 8 + 4) + 'px';
    el.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* Floating emojis on step complete */
function spawnFloats() {
  const emojis = ['⭐','💜','🔥','⚡','🚀'];
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('div');
    el.className = 'femoji';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.top = (Math.random() * 40 + 30) + '%';
    el.style.animationDelay = (Math.random() * .3) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

/* Reaction pop in center */
function popReaction() {
  const el = document.getElementById('react');
  el.textContent = ['⭐','🔥','💥','🎉','🚀'][Math.floor(Math.random() * 5)];
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

/* Achievement toast */
function showAchievement(icon, name) {
  const el = document.getElementById('ach');
  document.getElementById('achI').textContent = icon;
  document.getElementById('achN').textContent = name;
  el.classList.add('show');
  playSound(1200, .04, .3);
  setTimeout(() => el.classList.remove('show'), 3500);
}

/* Init all effects on load */
document.addEventListener('DOMContentLoaded', () => {
  initVanta();
  initTilt();
});
