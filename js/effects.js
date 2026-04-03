/* ================================================
   Custom Three.js Particle System + Interactive 3D
   No wrappers — raw Three.js like the pros
   ================================================ */

let scene, camera, renderer, particles, geometryShapes, clock;
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

function init3D() {
  const canvas = document.getElementById('vanta-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth, H = window.innerHeight;

  // Scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  clock = new THREE.Clock();

  // ─── PARTICLE FIELD (800 particles, flowing like PEN AI) ───
  const PARTICLE_COUNT = 800;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const seeds = new Float32Array(PARTICLE_COUNT); // for individual animation

  const palette = [
    [0.54, 0.36, 0.96], // violet #8b5cf6
    [0.75, 0.52, 0.99], // light violet #c084fc
    [0.92, 0.29, 0.60], // pink #ec4899
    [0.02, 0.71, 0.83], // cyan #06b6d4
    [0.06, 0.73, 0.51], // green #10b981
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribute in a wide cloud with concentration in center
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2 + Math.pow(Math.random(), 0.5) * 25;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6; // flatten Y
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.5 - 5;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];

    sizes[i] = Math.random() * 2.5 + 0.5;
    seeds[i] = Math.random() * 100;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for glowing particles
  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Flowing wave motion
        pos.x += sin(uTime * 0.3 + position.y * 0.1 + position.z * 0.05) * 0.8;
        pos.y += cos(uTime * 0.2 + position.x * 0.08) * 0.6;
        pos.z += sin(uTime * 0.15 + position.x * 0.06 + position.y * 0.04) * 0.4;

        // Mouse attraction
        float dist = length(pos.xy - uMouse * 15.0);
        float attraction = 1.0 / (1.0 + dist * 0.1);
        pos.xy += (uMouse * 15.0 - pos.xy) * attraction * 0.05;

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;
        gl_PointSize = size * uPixelRatio * (80.0 / -mvPos.z);

        // Fade with distance
        vAlpha = smoothstep(100.0, 10.0, -mvPos.z) * (0.4 + sin(uTime + position.x) * 0.2);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = exp(-d * 4.0); // soft glow falloff
        gl_FragColor = vec4(vColor, vAlpha * glow);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particles = new THREE.Points(pGeo, particleMat);
  scene.add(particles);

  // ─── WIREFRAME SHAPES (floating geometry) ───
  geometryShapes = [];
  const shapeDefs = [
    { geo: new THREE.IcosahedronGeometry(1.5, 1), color: 0x8b5cf6 },
    { geo: new THREE.OctahedronGeometry(1.2, 0), color: 0xec4899 },
    { geo: new THREE.TorusGeometry(1.0, 0.3, 8, 16), color: 0x06b6d4 },
    { geo: new THREE.TetrahedronGeometry(1.0, 0), color: 0xc084fc },
    { geo: new THREE.TorusKnotGeometry(0.7, 0.25, 64, 8), color: 0x10b981 },
  ];

  shapeDefs.forEach((def, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: def.color, wireframe: true, transparent: true, opacity: 0.08
    });
    const mesh = new THREE.Mesh(def.geo, mat);
    const angle = (i / shapeDefs.length) * Math.PI * 2;
    const radius = 12 + Math.random() * 8;
    mesh.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10 - 8
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.003,
      rotY: (Math.random() - 0.5) * 0.004,
      floatSpeed: Math.random() * 0.0004 + 0.0002,
      floatOffset: Math.random() * Math.PI * 2
    };
    scene.add(mesh);
    geometryShapes.push(mesh);
  });

  // ─── CENTRAL GLOW ORB ───
  const glowGeo = new THREE.SphereGeometry(3, 32, 32);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        vec3 color = mix(vec3(0.54, 0.36, 0.96), vec3(0.92, 0.29, 0.60), sin(uTime * 0.5) * 0.5 + 0.5);
        gl_FragColor = vec4(color, intensity * 0.15);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.z = -5;
  scene.add(glow);
  window._glowOrb = glow;

  // Mouse tracking
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / W - 0.5) * 2;
    targetY = (e.clientY / H - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate3D();
}

function animate3D() {
  requestAnimationFrame(animate3D);
  const t = clock.getElapsedTime();

  // Smooth mouse follow
  mouseX += (targetX - mouseX) * 0.03;
  mouseY += (targetY - mouseY) * 0.03;

  // Update particle shader
  if (particles) {
    particles.material.uniforms.uTime.value = t;
    particles.material.uniforms.uMouse.value.set(mouseX, -mouseY);
    particles.rotation.y = mouseX * 0.1;
    particles.rotation.x = mouseY * 0.05;
  }

  // Floating shapes
  geometryShapes.forEach(mesh => {
    mesh.rotation.x += mesh.userData.rotX;
    mesh.rotation.y += mesh.userData.rotY;
    mesh.position.y += Math.sin(t + mesh.userData.floatOffset) * mesh.userData.floatSpeed * 3;
  });

  // Glow orb pulse
  if (window._glowOrb) {
    window._glowOrb.material.uniforms.uTime.value = t;
    window._glowOrb.scale.setScalar(1 + Math.sin(t * 0.8) * 0.1);
  }

  // Camera subtle sway
  camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, -5);

  renderer.render(scene, camera);
}

/* ═══ Vanilla Tilt ═══ */
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    VanillaTilt.init(el, { max: 8, speed: 400, glare: true, 'max-glare': 0.15, perspective: 1000 });
  });
}

/* ═══ Sound ═══ */
function playSound(freq, vol, dur) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = 'sine'; gain.gain.value = vol;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

/* ═══ Confetti ═══ */
function confetti() {
  const colors = ['#8b5cf6','#c084fc','#ec4899','#f59e0b','#10b981','#06b6d4'];
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

/* ═══ Floating emojis ═══ */
function spawnFloats() {
  const em = ['⭐','💜','🔥','⚡','🚀'];
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('div');
    el.className = 'femoji';
    el.textContent = em[Math.floor(Math.random() * em.length)];
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.top = (Math.random() * 40 + 30) + '%';
    el.style.animationDelay = (Math.random() * .3) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

/* ═══ Reaction pop ═══ */
function popReaction() {
  const el = document.getElementById('react');
  el.textContent = ['⭐','🔥','💥','🎉','🚀'][Math.floor(Math.random() * 5)];
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}

/* ═══ Achievement ═══ */
function showAchievement(icon, name) {
  const el = document.getElementById('ach');
  document.getElementById('achI').textContent = icon;
  document.getElementById('achN').textContent = name;
  el.classList.add('show');
  playSound(1200, .04, .3);
  setTimeout(() => el.classList.remove('show'), 3500);
}

/* ═══ Init ═══ */
document.addEventListener('DOMContentLoaded', () => {
  init3D();
  initTilt();
});
