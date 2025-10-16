// Enhanced interactivity: mobile nav toggle, active link on scroll, reveal on scroll, typewriter, current year, theme toggle
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const yearEl = document.getElementById('year');
  const revealElems = document.querySelectorAll('.reveal');
  const typeEl = document.getElementById('type');
  const themeBtn = document.getElementById('theme-toggle');
  const LS_KEY = 'theme'; // 'light' | 'dark'

  /* THEME: read preference, apply, persist */
  function getPreferredTheme() {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // fallback to OS preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    if (themeBtn) {
      themeBtn.textContent = isLight ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
    try { localStorage.setItem(LS_KEY, theme); } catch (e) { /* ignore */ }
  }

  if (themeBtn) {
    // init theme
    applyTheme(getPreferredTheme());
    themeBtn.addEventListener('click', () => {
      const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  } else {
    // ensure theme still applied if no button
    applyTheme(getPreferredTheme());
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('show'));
  }

  // Close mobile menu on link click
  navLinks.forEach(l => l.addEventListener('click', () => links.classList.remove('show')));

  // Smooth offset scroll for anchors (account for sticky nav)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav').offsetHeight || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Reveal on scroll and active nav using IntersectionObserver
  const sections = Array.from(document.querySelectorAll('main section, header #home'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (entry.isIntersecting) {
        // nav active
        navLinks.forEach(n => n.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));

  // Reveal elements (stagger)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElems.forEach((el, i) => {
    el.style.transitionDelay = (i * 80) + 'ms';
    revealObserver.observe(el);
  });

  // Typewriter for hero subtitle (lightweight)
  if (typeEl) {
    const words = JSON.parse(typeEl.getAttribute('data-words') || '[]');
    let w = 0, i = 0, deleting = false;
    const speed = 70, pause = 1400;
    function tick() {
      const current = words[w] || '';
      if (!deleting) {
        typeEl.textContent = current.slice(0, ++i);
        if (i === current.length) {
          deleting = true;
          setTimeout(tick, pause);
        } else {
          setTimeout(tick, speed);
        }
      } else {
        typeEl.textContent = current.slice(0, --i);
        if (i === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          setTimeout(tick, 220);
        } else {
          setTimeout(tick, speed / 1.2);
        }
      }
    }
    if (words.length) tick();
  }

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // back-to-top: show only after scrolled more than half of the page
  const backBtn = document.getElementById('back-to-top');
  function shouldShowBackBtn() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight; // total scrollable px
    if (scrollable <= 0) return false;
    return window.scrollY > (scrollable / 2);
  }
  function updateBackBtn() {
    if (!backBtn) return;
    if (shouldShowBackBtn()) {backBtn.classList.add('show');backBtn.classList.remove('not-show');}
    else {backBtn.classList.remove('show');backBtn.classList.add('not-show');}
  }
  if (backBtn) {
    updateBackBtn();
    window.addEventListener('scroll', updateBackBtn, { passive: true });
    window.addEventListener('resize', updateBackBtn);
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      backBtn.blur();
    });
  }
});