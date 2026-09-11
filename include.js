/* ============================================================
   SAVVY MEDIA AFRICA - partial loader + global nav behaviour
   Single source of truth for header/footer injection and all
   nav, mobile-menu and search interaction. Pages must NOT
   re-bind these handlers; listen for the `headerLoaded` event
   instead (see window.SAVVY_SEARCH_INDEX for page search data).
   ============================================================ */
(function () {
  'use strict';

  var navInitDone = false;

  /* ---------- partial injection ---------- */

  function loadIncludes() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    if (!nodes.length) {
      initNav();
      return;
    }

    var jobs = nodes.map(function (el) {
      var file = el.getAttribute('data-include');
      if (!file) return Promise.resolve();

      var path = file.charAt(0) === '/' ? file : '/' + file;

      return fetch(path)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) {
          el.innerHTML = html;
        })
        .catch(function (err) {
          /* Fail quietly for visitors - an empty slot is far better
             than an error panel. Details go to the console only. */
          el.innerHTML = '';
          if (window.console) console.error('[include] ' + path + ': ' + err.message);
        });
    });

    Promise.all(jobs).then(function () {
      document.dispatchEvent(new CustomEvent('headerLoaded'));
      initNav();
    });
  }

  /* ---------- helpers ---------- */

  var scrollLockY = 0;

  function lockScroll() {
    scrollLockY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.overflow = '';
    /* iOS can drift the scroll position while the body is locked. */
    window.scrollTo(0, scrollLockY);
  }

  function markActiveLink() {
    var here = window.location.pathname.replace(/\/+$/, '') || '/';
    var links = document.querySelectorAll('.nav-links a, .mobile-menu a');
    Array.prototype.forEach.call(links, function (a) {
      var href = (a.getAttribute('href') || '').replace(/\/+$/, '') || '/';
      if (href === here) a.classList.add('active');
    });
  }

  function setFooterYear() {
    var y = document.getElementById('footerYear');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- navigation ---------- */

  function initNav() {
    if (navInitDone) return;
    navInitDone = true;

    var nav = document.getElementById('nav');
    var menuBtn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('mobileMenu');
    var overlay = document.getElementById('mobileMenuOverlay');
    var menuClose = document.getElementById('mobileMenuClose');

    var searchBtn = document.getElementById('navSearch');
    var searchOverlay = document.getElementById('searchOverlay');
    var searchModal = document.getElementById('searchModal');
    var searchClose = document.getElementById('searchClose');
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');

    /* sticky nav */
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle('scrolled', window.pageYOffset > 100);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* mobile menu */
    function menuIsOpen() {
      return !!menu && menu.classList.contains('open');
    }

    function openMenu() {
      if (!menu) return;
      menu.classList.add('open');
      if (overlay) overlay.classList.add('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      lockScroll();
      if (menuClose) menuClose.focus();
    }

    function closeMenu() {
      if (!menu) return;
      menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      unlockScroll();
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        menuIsOpen() ? closeMenu() : openMenu();
      });
    }
    if (overlay) overlay.addEventListener('click', closeMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);

    /* Let the link navigate; just dismiss the panel behind it. */
    if (menu) {
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', closeMenu);
      });
    }

    /* search */
    function openSearch() {
      if (!searchModal) return;
      searchModal.classList.add('open');
      if (searchOverlay) searchOverlay.classList.add('open');
      lockScroll();
      if (searchInput) setTimeout(function () { searchInput.focus(); }, 280);
    }

    function closeSearch() {
      if (!searchModal) return;
      searchModal.classList.remove('open');
      if (searchOverlay) searchOverlay.classList.remove('open');
      unlockScroll();
      if (searchInput) searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
    }

    function searchIsOpen() {
      return !!searchModal && searchModal.classList.contains('open');
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    var defaultIndex = [
      { title: 'Home', text: 'Where Creativity Lives, Results Matter', url: '/' },
      { title: 'About', text: 'Our story, values and team', url: '/about' },
      { title: 'Film & Entertainment', text: 'Premieres, PR and viral campaigns', url: '/film' },
      { title: 'Corporate', text: 'Multi-platform campaigns for leading brands', url: '/corporate' },
      { title: 'Consumer Brands', text: 'Culture-led storytelling for emerging brands', url: '/consumer' },
      { title: 'Contact', text: 'Ready to make waves? Send us a brief', url: '/contact' }
    ];

    function runSearch(q) {
      if (!searchResults) return;
      var query = (q || '').trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = '';
        return;
      }
      var index = window.SAVVY_SEARCH_INDEX || defaultIndex;
      var hits = index.filter(function (item) {
        return (item.title + ' ' + (item.text || '')).toLowerCase().indexOf(query) !== -1;
      });

      if (!hits.length) {
        searchResults.innerHTML =
          '<p style="color:rgba(255,255,255,.6);margin-top:1.5rem">No results found</p>';
        return;
      }

      searchResults.innerHTML = hits.map(function (item) {
        return '<a class="search-result-item" href="' + escapeHtml(item.url) + '">' +
               '<h3>' + escapeHtml(item.title) + '</h3>' +
               '<p>' + escapeHtml(item.text || '') + '</p></a>';
      }).join('');
    }

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);
    if (searchInput) {
      searchInput.addEventListener('input', function (e) { runSearch(e.target.value); });
    }

    /* one Escape handler for whichever layer is open */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (searchIsOpen()) closeSearch();
      else if (menuIsOpen()) closeMenu();
    });

    /* reset panels if the viewport grows past the mobile breakpoint */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && menuIsOpen()) closeMenu();
    });

    markActiveLink();
    setFooterYear();
  }

  /* ---------- boot ---------- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }
})();
