/* Savvy Media Africa — partial loader + global navigation
   Loads /partials/header.html and /partials/footer.html into [data-include]
   targets, then wires up nav scroll state, mobile menu and search. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Load partials
  --------------------------------------------------------------- */
  async function loadIncludes() {
    const targets = document.querySelectorAll('[data-include]');

    await Promise.all(
      Array.from(targets).map(async (el) => {
        const file = el.getAttribute('data-include');
        if (!file) return;

        const path = file.startsWith('/') ? file : '/' + file;

        try {
          const response = await fetch(path);
          if (!response.ok) throw new Error('HTTP ' + response.status);
          el.innerHTML = await response.text();
        } catch (err) {
          /* Fail quietly for visitors — never render an error box into
             the page. The gap simply stays empty and the page still works. */
          el.remove();
        }
      })
    );

    document.dispatchEvent(new CustomEvent('headerLoaded'));
    initNavigation();
  }

  /* ---------------------------------------------------------------
     Navigation
  --------------------------------------------------------------- */
  function initNavigation() {
    markCurrentPage();
    initScrollState();
    initMobileMenu();
    initSearch();
  }

  /* Highlight the link for the page you're on */
  function markCurrentPage() {
    const here = window.location.pathname.replace(/\/index\.html$/, '/') || '/';

    document.querySelectorAll('#nav a[href], .mobile-menu a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      if (href === here || (href !== '/' && here.indexOf(href) === 0)) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* Solid nav background once the page scrolls */
  function initScrollState() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const update = () => nav.classList.toggle('scrolled', window.scrollY > 100);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Mobile drawer + collapsible submenus */
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!btn || !menu || !overlay) return;

    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      btn.setAttribute('aria-expanded', String(open));
    };

    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    overlay.addEventListener('click', () => setOpen(false));

    /* Close on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
    });

    /* Submenu toggles, where the header provides them */
    menu.querySelectorAll('.mobile-sub-toggle').forEach((toggle) => {
      const panel = document.getElementById(toggle.getAttribute('aria-controls') || '');

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));

        if (panel) panel.hidden = expanded;

        const parent = toggle.closest('.has-dropdown');
        if (parent) parent.classList.toggle('open', !expanded);

        const indicator = toggle.querySelector('.mobile-sub-indicator');
        if (indicator) indicator.textContent = expanded ? '+' : '−';
      });
    });

    /* Let navigation happen, then close the drawer behind it */
    menu.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => setTimeout(() => setOpen(false), 60));
    });
  }

  /* Search modal */
  function initSearch() {
    const trigger = document.getElementById('navSearch');
    const overlay = document.getElementById('searchOverlay');
    const modal = document.getElementById('searchModal');
    const close = document.getElementById('searchClose');
    const input = document.getElementById('searchInput');
    if (!trigger || !modal) return;

    const setOpen = (open) => {
      if (overlay) overlay.classList.toggle('open', open);
      modal.classList.toggle('open', open);
      if (open && input) input.focus();
    };

    trigger.addEventListener('click', () => setOpen(true));
    if (close) close.addEventListener('click', () => setOpen(false));
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) setOpen(false);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------
     Go
  --------------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }
})();
