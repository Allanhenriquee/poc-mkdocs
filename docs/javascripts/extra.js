/* ============================================================
   Typed Text Effect
   ============================================================ */

const TYPED_WORDS = ['Plataforma de Pedidos', 'API de Pagamentos', 'Serviços Backend', 'Arquitetura .NET'];

function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  // Inject cursor element
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  el.parentNode.insertBefore(cursor, el.nextSibling);

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function type() {
    const currentWord = TYPED_WORDS[wordIndex];

    if (!isDeleting) {
      el.textContent = currentWord.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentWord.length) {
        isPaused = true;
        setTimeout(() => { isPaused = false; isDeleting = true; type(); }, 1800);
        return;
      }
    } else {
      el.textContent = currentWord.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % TYPED_WORDS.length;
      }
    }

    if (!isPaused) {
      const speed = isDeleting ? 55 : 100;
      setTimeout(type, speed);
    }
  }

  setTimeout(type, 800);
}

/* ============================================================
   Counter Animation
   ============================================================ */

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ============================================================
   Scroll Fade-In Animations
   ============================================================ */

function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   Subtle Parallax on Hero Orbs
   ============================================================ */

function initParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;

  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 10;
        orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
      ticking = false;
    });
  });
}

/* ============================================================
   Boot — runs on every page navigation (instant loading)
   ============================================================ */

function boot() {
  initTyped();
  initCounters();
  initScrollAnimations();
  initParallax();
}

// MkDocs Material instant loading fires this custom event
document.addEventListener('DOMContentLoaded', boot);
document.addEventListener('DOMContentSwitch', boot); // instant navigation
