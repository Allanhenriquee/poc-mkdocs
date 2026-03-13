/* ============================================================
   State — track handles for cleanup between navigations
   ============================================================ */

let _typedTimer   = null;
let _scrollObs    = null;
let _counterObs   = null;
let _mouseFn      = null;

function cleanup() {
  if (_typedTimer)  { clearTimeout(_typedTimer); _typedTimer = null; }
  if (_scrollObs)   { _scrollObs.disconnect();   _scrollObs  = null; }
  if (_counterObs)  { _counterObs.disconnect();  _counterObs = null; }
  if (_mouseFn)     { document.removeEventListener('mousemove', _mouseFn); _mouseFn = null; }
  document.querySelectorAll('.typed-cursor').forEach(el => el.remove());
}

/* ============================================================
   Typed Text Effect
   ============================================================ */

const TYPED_WORDS = [
  'Plataforma de Pedidos',
  'API de Pagamentos',
  'Serviços Backend',
  'Arquitetura .NET'
];

function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  el.parentNode.insertBefore(cursor, el.nextSibling);

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = TYPED_WORDS[wordIndex];

    if (!isDeleting) {
      el.textContent = currentWord.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentWord.length) {
        _typedTimer = setTimeout(() => { isDeleting = true; type(); }, 1800);
        return;
      }
    } else {
      charIndex--;
      if (charIndex === 0) {
        // Transition directly to first char of next word — never show empty span
        isDeleting = false;
        wordIndex = (wordIndex + 1) % TYPED_WORDS.length;
        charIndex = 1;
      }
      el.textContent = TYPED_WORDS[wordIndex].slice(0, charIndex);
    }

    const speed = isDeleting ? 50 : 95;
    _typedTimer = setTimeout(type, speed);
  }

  _typedTimer = setTimeout(type, 600);
}

/* ============================================================
   Counter Animation
   ============================================================ */

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.hero-stat__number[data-count]');
  if (!counters.length) return;

  _counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        _counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => {
    el.textContent = '0';
    _counterObs.observe(el);
  });
}

/* ============================================================
   Scroll Fade-In Animations
   ============================================================ */

function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  // Reset state so elements animate fresh on each navigation
  elements.forEach(el => el.classList.remove('visible'));

  _scrollObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        _scrollObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(el => _scrollObs.observe(el));
}

/* ============================================================
   Parallax on Hero Orbs
   ============================================================ */

function initParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;

  let ticking = false;

  _mouseFn = (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dx = (e.clientX - window.innerWidth  / 2) / window.innerWidth;
      const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      orbs.forEach((orb, i) => {
        const f = (i + 1) * 10;
        orb.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
      });
      ticking = false;
    });
  };

  document.addEventListener('mousemove', _mouseFn);
}

/* ============================================================
   Boot — called after every page navigation
   ============================================================ */

function boot() {
  cleanup();
  initTyped();
  initCounters();
  initScrollAnimations();
  initParallax();
}

/* ============================================================
   Hook into MkDocs Material navigation
   MkDocs Material exposes `document$` (RxJS BehaviorSubject)
   that fires after every page swap, including the first load.
   This is the correct way to handle instant navigation.
   ============================================================ */

if (typeof document$ !== 'undefined') {
  document$.subscribe(boot);
} else {
  // Fallback for environments without instant loading
  document.addEventListener('DOMContentLoaded', boot);
}
