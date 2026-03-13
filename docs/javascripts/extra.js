/* ============================================================
   State — track handles for cleanup between navigations
   ============================================================ */

let _typedTimer   = null;
let _scrollObs    = null;
let _counterObs   = null;
let _mouseFn      = null;
let _resizeFn     = null;

function cleanup() {
  if (_typedTimer)  { clearTimeout(_typedTimer); _typedTimer = null; }
  if (_scrollObs)   { _scrollObs.disconnect();   _scrollObs  = null; }
  if (_counterObs)  { _counterObs.disconnect();  _counterObs = null; }
  if (_mouseFn)     { document.removeEventListener('mousemove', _mouseFn); _mouseFn = null; }
  if (_resizeFn)    { window.removeEventListener('resize', _resizeFn);     _resizeFn = null; }
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

// Minimum chars before doing a fade-swap instead of full deletion.
// Prevents the "cursor on almost-blank line" perception.
const TYPED_MIN_CHARS = 4;

function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const wrapper = el.parentElement; // .hero-title__animated

  // Cursor is rendered via CSS #typed-text::after — no DOM element needed.
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // Set first word immediately so there's never a blank state on load
  el.textContent = TYPED_WORDS[0].charAt(0);
  charIndex = 1;

  function swapWord() {
    // Fade out wrapper, swap word content, fade back in
    wrapper.style.transition = 'opacity 0.18s ease';
    wrapper.style.opacity = '0';

    _typedTimer = setTimeout(() => {
      wordIndex = (wordIndex + 1) % TYPED_WORDS.length;
      charIndex = 0;
      isDeleting = false;
      el.textContent = TYPED_WORDS[wordIndex].charAt(0);
      charIndex = 1;
      wrapper.style.opacity = '1';

      // Small pause after fade-in before continuing to type
      _typedTimer = setTimeout(type, 220);
    }, 200);
  }

  function type() {
    const currentWord = TYPED_WORDS[wordIndex];

    if (!isDeleting) {
      el.textContent = currentWord.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentWord.length) {
        // Full word shown — pause then start deleting
        _typedTimer = setTimeout(() => { isDeleting = true; type(); }, 1800);
        return;
      }
    } else {
      if (charIndex <= TYPED_MIN_CHARS) {
        // Too few chars left — fade-swap to avoid almost-blank line
        swapWord();
        return;
      }
      charIndex--;
      el.textContent = currentWord.slice(0, charIndex);
    }

    const speed = isDeleting ? 45 : 90;
    _typedTimer = setTimeout(type, speed);
  }

  // Short initial delay before animation starts
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

  // Do NOT remove 'visible' here — fresh DOM elements from navigation
  // already start without it; removing it causes visible flash on return.

  _scrollObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        _scrollObs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    // Positive bottom margin: trigger animation before element reaches
    // the viewport so content is already fading in when user scrolls to it
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
   Scalar API iframe — initialized on every navigation
   ============================================================ */

function initScalar() {
  const frame = document.getElementById('scalar-frame');
  if (!frame) return;

  if (!frame.src) {
    frame.src = '../scalar-ui.html';
  }

  const embed = document.getElementById('scalar-embed');

  function adjust() {
    const header = document.querySelector('[data-md-component="header"]');
    const tabs   = document.querySelector('.md-tabs');
    const offset = (header ? header.offsetHeight : 48)
                 + (tabs   ? tabs.offsetHeight   : 0);
    if (embed) embed.style.top = offset + 'px';
  }

  adjust();
  _resizeFn = adjust;
  window.addEventListener('resize', _resizeFn);
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
  initScalar();
}

/* ============================================================
   Hook into MkDocs Material navigation
   ============================================================ */

if (typeof document$ !== 'undefined') {
  document$.subscribe(boot);
} else {
  document.addEventListener('DOMContentLoaded', boot);
}
