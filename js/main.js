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
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

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

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

// Close menu on link click
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

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
document.querySelectorAll(spotSelectors).forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--mx', `-200px`);
    card.style.setProperty('--my', `-200px`);
  });
});

// ===== MULTILINGUAL GREETING =====
// Cycles through Oscar's spoken languages — English, Cantonese, Japanese, Spanish.
const greetings = ["Hi, I'm", "你好，我係", "こんにちは、僕は", "Hola, soy"];
const greetEl = document.querySelector('.hero__greeting');
let gIdx = 0;
if (greetEl) {
  setInterval(() => {
    greetEl.style.opacity = '0';
    setTimeout(() => {
      gIdx = (gIdx + 1) % greetings.length;
      greetEl.textContent = greetings[gIdx];
      greetEl.style.opacity = '1';
    }, 350);
  }, 3500);
}

// ===== STAT COUNT-UP =====
function animateCount(el, target, duration = 1400) {
  const suffix = el.textContent.replace(/[\d.,\s]/g, '');
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
  '%cI\'m Oscar — Software Engineer & QA Automation, available Bay Area or remote.\n' +
  '%c\nLinkedIn: linkedin.com/in/oscar-leung\nGitHub:   github.com/oscar-leung' +
  '\n\n%cP.S. Try the Konami code 😉  ↑ ↑ ↓ ↓ ← → ← → B A',
  'color:#38bdf8;font-size:16px;font-weight:bold;',
  'color:#e6ecf5;font-size:12px;line-height:1.6;',
  'color:#94a3b8;font-family:monospace;font-size:11px;',
  'color:#f472b6;font-size:11px;font-style:italic;'
);
