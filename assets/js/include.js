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
    setFooterYear();
  }

  /* Keep the copyright year current without anyone remembering to */
  function setFooterYear() {
    const year = document.getElementById('footerYear');
    if (year) year.textContent = String(new Date().getFullYear());
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

  /* What the site search can find. Lives here so every page
     searches the same thing — previously only the homepage worked. */
  const SEARCH_INDEX = [
    { title: 'Home',                      text: 'Where creativity lives, results matter', url: '/' },
    { title: 'About',                     text: 'Our story, values and team',             url: '/about' },
    { title: 'Our Work',                  text: 'Campaigns that moved culture',           url: '/work' },
    { title: 'Film & Entertainment',      text: 'Premieres, blockbuster launches, PR',    url: '/film' },
    { title: 'Corporate Campaigns',       text: 'MTN, Bolt, GAC Motors, Africa Re',       url: '/corporate' },
    { title: 'Consumer Brand Campaigns',  text: 'Purna Gummies, Dogtas Furniture',        url: '/consumer' },
    { title: 'Magazines',                 text: 'Savvy Magazine editions and covers',     url: '/magazines' },
    { title: 'Send a Brief',              text: 'Contact us, start a project',            url: '/contact' }
  ];

  /* Search modal */
  function initSearch() {
    const trigger = document.getElementById('navSearch');
    const overlay = document.getElementById('searchOverlay');
    const modal   = document.getElementById('searchModal');
    const close   = document.getElementById('searchClose');
    const input   = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!trigger || !modal) return;

    const setOpen = (open) => {
      if (overlay) overlay.classList.toggle('open', open);
      modal.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        if (input) setTimeout(() => input.focus(), 250);
      } else {
        if (input) input.value = '';
        if (results) results.innerHTML = '';
      }
    };

    const escapeHtml = (s) => s.replace(/[&<>"']/g, c => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));

    const search = (query) => {
      if (!results) return;
      const q = query.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }

      const hits = SEARCH_INDEX.filter(i =>
        i.title.toLowerCase().includes(q) || i.text.toLowerCase().includes(q));

      results.innerHTML = hits.length
        ? hits.map(i =>
            '<a href="' + i.url + '" class="search-result-item">' +
              '<h3>' + escapeHtml(i.title) + '</h3>' +
              '<p>' + escapeHtml(i.text) + '</p>' +
            '</a>').join('')
        : '<p style="color:rgba(255,255,255,.6);margin-top:2rem">No results found</p>';
    };

    trigger.addEventListener('click', () => setOpen(true));
    if (close) close.addEventListener('click', () => setOpen(false));
    if (input) input.addEventListener('input', e => search(e.target.value));
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
