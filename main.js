/* ============================================================
   MAIN — navigation behavior, mobile menu, scroll reveal,
   active link highlighting, contact/social wiring from config.
   ============================================================ */
(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menu.hidden = open;
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });

  /* ---------- Contact wiring (from config) ---------- */
  var wa = document.getElementById('whatsappBtn');
  if (wa && cfg.whatsappNumber) {
    wa.href = 'https://wa.me/' + cfg.whatsappNumber +
      (cfg.whatsappMessage ? '?text=' + encodeURIComponent(cfg.whatsappMessage) : '');
  }
  var phone = document.getElementById('phoneLink');
  if (phone && cfg.phoneTel) {
    phone.href = 'tel:' + cfg.phoneTel;
    phone.textContent = cfg.phoneDisplay || cfg.phoneTel;
  }

  /* ---------- Social icons (shared renderer) ---------- */
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h3.1c.2 1.9 1.3 3.6 3.3 4.1v3.2c-1.3 0-2.6-.4-3.7-1.1v7.1c0 4.2-3 7.3-7 7.3-3.7 0-6.8-2.8-6.8-6.6 0-4 3.4-6.9 7.4-6.5v3.3c-2-.3-4 .8-4 3.2 0 1.9 1.5 3.3 3.3 3.3 2 0 3.5-1.5 3.5-3.9V2z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.8h2.6l.4-3h-3V8.2c0-.9.3-1.5 1.6-1.5h1.5V4.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H7.8v3h2.8V21h3z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C16.3 5 12 5 12 5s-4.3 0-7.1.2c-.4.1-1.3.1-2.1.9C2.2 6.7 2 8.2 2 8.2S1.8 10 1.8 11.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.3.9 1.7.2 6.9.2 6.9.2s4.3 0 7.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7C22.2 10 22 8.2 22 8.2zM9.9 15.1V8.6l6 3.3-6 3.2z"/></svg>'
  };
  var LABELS = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube' };

  function renderSocials(elId) {
    var host = document.getElementById(elId);
    if (!host || !cfg.socials) return;
    Object.keys(cfg.socials).forEach(function (key) {
      var url = cfg.socials[key];
      var a = document.createElement(url ? 'a' : 'span');
      a.className = 'soc' + (url ? '' : ' soc-disabled');
      a.innerHTML = ICONS[key] || '';
      a.setAttribute('aria-label', LABELS[key] || key);
      if (url) {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.title = 'Link coming soon';
      }
      host.appendChild(a);
    });
  }
  renderSocials('contactSocials');
  renderSocials('footerSocials');

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // Observe cards rendered by player.js too
    var grid = document.getElementById('portfolioGrid');
    if (grid) {
      var mo = new MutationObserver(function () {
        grid.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { io.observe(el); });
      });
      mo.observe(grid, { childList: true });
    }
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = ['work', 'services', 'about', 'contact'];
  var links = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Analytics placeholder ----------
     Paste your measurement ID in config.js (analyticsId).
     Nothing loads while it stays empty. */
  if (cfg.analyticsId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.analyticsId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.analyticsId);
  }
})();
