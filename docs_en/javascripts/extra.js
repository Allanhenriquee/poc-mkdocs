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
}

/* ============================================================
   Typed Text Effect
   ============================================================ */

const TYPED_WORDS = [
  'Orders Platform',
  'Payments API',
  'Backend Services',
  '.NET Architecture'
];

const TYPED_MIN_CHARS = 4;

function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const wrapper = el.parentElement;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  el.textContent = TYPED_WORDS[0].charAt(0);
  charIndex = 1;

  function swapWord() {
    wrapper.style.transition = 'opacity 0.18s ease';
    wrapper.style.opacity = '0';

    _typedTimer = setTimeout(() => {
      wordIndex = (wordIndex + 1) % TYPED_WORDS.length;
      charIndex = 0;
      isDeleting = false;
      el.textContent = TYPED_WORDS[wordIndex].charAt(0);
      charIndex = 1;
      wrapper.style.opacity = '1';

      _typedTimer = setTimeout(type, 220);
    }, 200);
  }

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
      if (charIndex <= TYPED_MIN_CHARS) {
        swapWord();
        return;
      }
      charIndex--;
      el.textContent = currentWord.slice(0, charIndex);
    }

    const speed = isDeleting ? 45 : 90;
    _typedTimer = setTimeout(type, speed);
  }

  _typedTimer = setTimeout(type, 400);
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

  _scrollObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        _scrollObs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px 80px 0px'
  });

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
        const f = (i + 1) * 8;
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
   ============================================================ */

if (typeof document$ !== 'undefined') {
  document$.subscribe(boot);
} else {
  document.addEventListener('DOMContentLoaded', boot);
}
