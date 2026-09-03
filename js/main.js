/* Set before anything else can throw: css/style.css only hides .fade-in
   under html.js, so if this file dies the page still renders its content. */
document.documentElement.classList.add('js');

/* One shared motion flag. The cursor and signature blocks already honoured
   this; the older code at the top of the file did not. */
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const POINTER_FINE    = window.matchMedia('(pointer: fine)').matches;

// ===== TYPING EFFECT =====
const roles = [
  'Software Engineer',
  'QA Automation Engineer',
  'SDET',
  'Software Engineer in Test',
  'Python Developer',
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  if (!typedEl) return;
  if (PREFERS_REDUCED) { typedEl.textContent = roles[0]; return; }
  const current = roles[roleIndex];
  if (isDeleting) {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === current.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(type, delay);
}

type();

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

if (hamburger && navLinksEl) {
  const syncMenu = (open) => {
    hamburger.classList.toggle('open', open);
    navLinksEl.classList.toggle('open', open);
    // Without this the button announces identically open or closed.
    hamburger.setAttribute('aria-expanded', String(open));
  };

  hamburger.addEventListener('click', () => {
    syncMenu(!navLinksEl.classList.contains('open'));
  });

  // Close menu on link click
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => syncMenu(false));
  });

  // Escape should close it too, and return focus to the control
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
      syncMenu(false);
      hamburger.focus();
    }
  });
}

// ===== FADE-IN ON SCROLL =====
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in')];
      const index = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => fadeObserver.observe(el));

// ===== SPOTLIGHT HOVER ON CARDS =====
// Tracks mouse and exposes --mx / --my CSS vars; cards use them in their
// background-image radial-gradient for a cursor-following glow.
const spotSelectors = '.skill-card, .project-card, .timeline__content, .beyond-card, .stat-card, .video-card';
if (POINTER_FINE) {
  document.querySelectorAll(spotSelectors).forEach(card => {
    let frame = null;
    card.addEventListener('pointermove', (e) => {
      // Batch to one write per frame — pointermove fires at refresh rate and
      // each write repaints a 420px gradient.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
    card.addEventListener('pointerleave', () => {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      card.style.setProperty('--mx', `-200px`);
      card.style.setProperty('--my', `-200px`);
    });
  });
}

// ===== MULTILINGUAL GREETING =====
// Cycles through Oscar's spoken languages — English, Cantonese, Japanese, Spanish.
// Each greeting carries its own lang tag (WCAG 3.1.2) — without it a screen
// reader pronounces the Cantonese and Japanese with an English phoneme set.
const greetings = [
  { t: "Hi, I'm",        l: 'en'    },
  { t: '你好，我係',      l: 'zh-HK' },
  { t: 'こんにちは、僕は', l: 'ja'    },
  { t: 'Hola, soy',      l: 'es'    },
];
const greetEl = document.querySelector('.hero__greeting');
let gIdx = 0;
if (greetEl) {
  greetEl.lang = greetings[0].l;
  if (!PREFERS_REDUCED) {
    setInterval(() => {
      greetEl.style.opacity = '0';
      setTimeout(() => {
        gIdx = (gIdx + 1) % greetings.length;
        greetEl.textContent = greetings[gIdx].t;
        greetEl.lang = greetings[gIdx].l;
        greetEl.style.opacity = '1';
      }, 350);
    }, 3500);
  }
}

// ===== STAT COUNT-UP =====
function animateCount(el, target, duration = 1400) {
  const suffix = el.textContent.replace(/[\d.,\s]/g, '');
  if (PREFERS_REDUCED) { el.textContent = target + suffix; return; }
  const start = performance.now();
  function step(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const numEl = entry.target.querySelector('.stat-card__num');
    if (!numEl) return;
    const target = parseInt(numEl.textContent, 10);
    if (!isNaN(target)) animateCount(numEl, target);
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-card').forEach(c => statObserver.observe(c));

// ===== 3D TILT ON CARDS =====
// Fine-pointer only: on touch, pointermove fires mid-scroll and the cards
// wobble under the finger. Reduced-motion users get no tilt at all.
if (POINTER_FINE && !PREFERS_REDUCED)
document.querySelectorAll('.project-card, .skill-card').forEach(card => {
  let raf = null;
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform =
        `perspective(900px) translateY(-5px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
  });
  card.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    card.style.transform = '';
  });
});

// ===== MAGNETIC BUTTONS =====
// Primary CTAs gently pull toward the cursor while hovered.
// Fine-pointer + full-motion only, same reasoning as the tilt above.
if (POINTER_FINE && !PREFERS_REDUCED)
document.querySelectorAll('.btn--primary, .nav__link.contact-cta').forEach(btn => {
  const strength = 0.3;
  btn.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width  / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  });
  btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
});

// ===== CONFETTI =====
function getConfettiColors() {
  const css = getComputedStyle(document.documentElement);
  return [
    css.getPropertyValue('--accent').trim()   || '#38bdf8',
    css.getPropertyValue('--accent-2').trim() || '#818cf8',
    css.getPropertyValue('--accent-3').trim() || '#f472b6',
    '#4ade80', '#fbbf24',
  ];
}
function spawnConfetti(x, y, count = 50) {
  if (PREFERS_REDUCED) return; // no surprise motion for reduced-motion users
  const colors = getConfettiColors();
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 220;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance * 0.6 + 120;
    c.style.left = `${x}px`;
    c.style.top  = `${y}px`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.setProperty('--tx',  `${tx}px`);
    c.style.setProperty('--ty',  `${ty}px`);
    c.style.setProperty('--rot', `${Math.random() * 1080 - 540}deg`);
    c.style.setProperty('--dur', `${1.2 + Math.random() * 0.9}s`);
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2400);
  }
}
// Trigger on Hire Me CTAs and on form submit
document.querySelectorAll('.nav__link.contact-cta, .hero__ctas .btn--primary').forEach(el => {
  el.addEventListener('click', () => {
    const rect = el.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
  });
});
document.querySelector('.contact-form')?.addEventListener('submit', () => {
  spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 70);
});

// ===== TOAST HELPER =====
let _toastEl, _toastTimer;
function showToast(msg, duration = 1800) {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.className = 'toast';
    // Live region must exist in the DOM *before* content changes,
    // or screen readers never announce the first toast.
    _toastEl.setAttribute('role', 'status');
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  _toastEl.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => _toastEl.classList.remove('show'), duration);
}

// ===== VIBE SWITCHER =====
const themes = [
  { name: 'cyan',   icon: '🌊', cls: '' },
  { name: 'sunset', icon: '🌅', cls: 'theme-sunset' },
  { name: 'forest', icon: '🌿', cls: 'theme-forest' },
  { name: 'neon',   icon: '💜', cls: 'theme-neon' },
];
let themeIdx = parseInt(localStorage.getItem('vibeIdx') || '0', 10) || 0;
const vibeBtn = document.getElementById('vibeSwitcher');
function applyTheme(idx) {
  themes.forEach(t => t.cls && document.documentElement.classList.remove(t.cls));
  if (themes[idx].cls) document.documentElement.classList.add(themes[idx].cls);
  if (vibeBtn) vibeBtn.textContent = themes[idx].icon;
}
applyTheme(themeIdx);
vibeBtn?.addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % themes.length;
  localStorage.setItem('vibeIdx', themeIdx);
  applyTheme(themeIdx);
  showToast(`Vibe: ${themes[themeIdx].name}`);
});

// ===== KONAMI CODE =====
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
window.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === konami[kIdx]) {
    kIdx++;
    if (kIdx === konami.length) {
      document.body.classList.toggle('party');
      const on = document.body.classList.contains('party');
      showToast(on ? '🎉 Party mode ON' : 'Party mode off');
      if (on) spawnConfetti(window.innerWidth / 2, window.innerHeight / 3, 80);
      kIdx = 0;
    }
  } else {
    kIdx = (key === konami[0]) ? 1 : 0;
  }
});

// ===== BEYOND CARD EASTER EGGS =====
document.querySelectorAll('.beyond-card[data-easter]').forEach(card => {
  card.addEventListener('click', (e) => {
    const kind = card.dataset.easter;
    const rect = card.getBoundingClientRect();
    if (kind === 'frisbee') {
      const f = document.createElement('div');
      f.className = 'flying-frisbee';
      f.textContent = '🥏';
      f.style.left = `${rect.left + rect.width / 2}px`;
      f.style.top  = `${rect.top  + rect.height / 2}px`;
      document.body.appendChild(f);
      setTimeout(() => f.remove(), 2000);
    } else if (kind === 'dice') {
      const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      const roll = Math.floor(Math.random() * 6);
      const d = document.createElement('div');
      d.className = 'dice-roll';
      d.textContent = faces[roll];
      document.body.appendChild(d);
      showToast(`🎲 You rolled a ${roll + 1}`);
      setTimeout(() => d.remove(), 1700);
    } else if (kind === 'camera') {
      const flash = document.createElement('div');
      flash.className = 'camera-flash';
      document.body.appendChild(flash);
      showToast('📸 *click*');
      setTimeout(() => flash.remove(), 600);
    }
  });
});

// ===== CONSOLE MESSAGE =====
console.log(
  '%c👋 Hey there, fellow dev!\n' +
  '%cI\'m Oscar — Software Engineer & QA Automation, available Davis/Sacramento, Bay Area, or remote.\n' +
  '%c\nLinkedIn: linkedin.com/in/oscar-leung\nGitHub:   github.com/oscar-leung' +
  '\n\n%cP.S. Try the Konami code 😉  ↑ ↑ ↓ ↓ ← → ← → B A',
  'color:#38bdf8;font-size:16px;font-weight:bold;',
  'color:#e6ecf5;font-size:12px;line-height:1.6;',
  'color:#94a3b8;font-family:monospace;font-size:11px;',
  'color:#f472b6;font-size:11px;font-style:italic;'
);

/* ---------------------------------------------------------------
   Playful rotating cursor — cycles through emoji for Oscar's
   hobbies and past jobs (frisbee, volleyball, satellites, testing,
   AI, teaching). Skipped for users who prefer reduced motion, and
   reverts to normal over links/buttons so nothing gets harder to click.
   --------------------------------------------------------------- */
(function () {
  if (PREFERS_REDUCED) return;
  if (!POINTER_FINE) return; // touch devices have no cursor

  var emojis = ['🥏', '🏐', '🛰️', '🧪', '🤖', '✏️', '🎮'];
  var i = 0;

  function emojiCursor(e) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
      '<text y="21" font-size="20">' + e + '</text></svg>';
    return 'url(data:image/svg+xml;utf8,' + encodeURIComponent(svg) + ') 4 4, auto';
  }

  function rotate() {
    document.body.style.cursor = emojiCursor(emojis[i]);
    i = (i + 1) % emojis.length;
  }

  rotate();
  setInterval(rotate, 2800);

  // Keep pointer affordance on interactive elements
  var style = document.createElement('style');
  style.textContent = 'a, button, [role="button"], select { cursor: pointer !important; }' +
      ' input:not([type="submit"]):not([type="button"]), textarea { cursor: text !important; }';
  document.head.appendChild(style);
})();

/* ---------------------------------------------------------------
   SIGNATURE ROTATOR
   Alternates three sign-off cards on a timer. Pauses while the
   visitor is hovering, focused inside, or has the tab in the
   background, so a card never swaps out mid-read. Dots jump
   directly and stop the auto-advance — an explicit choice wins.
   --------------------------------------------------------------- */
(function () {
  const root = document.getElementById('sigRotator');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.sig__slide'));
  const dots   = Array.from(root.querySelectorAll('.sig__dot'));
  if (slides.length < 2) return;

  slides.forEach((sl, i) => { sl.inert = i !== 0; });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DWELL   = 7000;
  let idx = 0, timer = null, paused = false, userPicked = false;

  // Slides are stacked in one grid cell and hidden with `visibility`, not
  // `hidden`/`display`, so swapping needs no reflow wait — the whole thing is
  // synchronous. `inert` keeps the offscreen cards out of the tab order
  // without touching layout.
  function show(next) {
    if (next === idx) return;
    const from = slides[idx];
    const to   = slides[next];

    from.classList.remove('is-active');
    from.inert = true;
    to.classList.add('is-active');
    to.inert = false;

    dots[idx]?.classList.remove('is-on');
    dots[next]?.classList.add('is-on');
    idx = next;
  }

  function advance() {
    if (paused || document.hidden) return;
    show((idx + 1) % slides.length);
  }

  function start() {
    stop();
    if (reduced || userPicked) return;
    timer = setInterval(advance, DWELL);
  }
  function stop() { clearInterval(timer); timer = null; }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      userPicked = true;   // visitor is steering now — stop rotating
      stop();
      show(i);
    });
  });

  root.addEventListener('mouseenter', () => { paused = true; });
  root.addEventListener('mouseleave', () => { paused = false; });
  root.addEventListener('focusin',    () => { paused = true; });
  root.addEventListener('focusout',   () => { paused = false; });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  start();

  /* --- Perspective card: tilt toward the pointer --- */
  const card = document.getElementById('sig3d');
  if (card && !reduced && !window.matchMedia('(pointer: coarse)').matches) {
    const REST_X = 8, REST_Y = -14;
    card.parentElement.addEventListener('mousemove', (e) => {
      const b = card.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width  - .5;
      const py = (e.clientY - b.top)  / b.height - .5;
      card.style.setProperty('--rx', (REST_X - py * 16).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (REST_Y + px * 20).toFixed(2) + 'deg');
    });
    card.parentElement.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', REST_X + 'deg');
      card.style.setProperty('--ry', REST_Y + 'deg');
    });
  }

  /* --- Etch-a-sketch: shake to redraw the signature --- */
  const shake = document.getElementById('sketchShake');
  if (shake) {
    shake.addEventListener('click', () => {
      const pad = shake.closest('.sketch');
      if (!pad || pad.classList.contains('is-shaking')) return;
      pad.classList.add('is-shaking');
      // Restart the stroke animation: clear it, force a synchronous reflow,
      // then hand it back. Doing this without requestAnimationFrame matters —
      // rAF is frozen in a backgrounded tab, which would strand the signature
      // mid-reset with no stroke drawn at all.
      const ink = pad.querySelectorAll('.sketch__ink text');
      ink.forEach(t => { t.style.animation = 'none'; });
      void pad.offsetWidth;
      ink.forEach(t => { t.style.animation = ''; });
      setTimeout(() => pad.classList.remove('is-shaking'), 460);
    });
  }
})();
