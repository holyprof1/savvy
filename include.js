// SIMPLIFIED include.js - debug version
console.log('✅ include.js loaded at', new Date().toLocaleTimeString());

async function loadIncludes() {
  console.log('🔄 Looking for [data-include] elements...');
  
  const includes = document.querySelectorAll('[data-include]');
  console.log(`Found ${includes.length} includes`);

  if (includes.length === 0) {
    console.error('❌ No [data-include] elements found!');
    return;
  }

  for (const el of includes) {
    const file = el.getAttribute('data-include');
    console.log(`Processing: ${file}`);
    
    if (!file) continue;

    // Ensure path starts with /
    const path = file.startsWith('/') ? file : '/' + file;
    console.log(`📂 Fetching from: ${path}`);

    try {
      const response = await fetch(path);
      console.log(`Response status: ${response.status} for ${path}`);
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} for ${path}`);
        el.innerHTML = `<div style="background:#ff4444;color:#fff;padding:2rem;text-align:center;border-radius:8px;margin:2rem;"><h3>Error Loading ${file}</h3><p>HTTP ${response.status}</p><small>Check browser console</small></div>`;
        continue;
      }

      const html = await response.text();
      console.log(`✅ Got ${html.length} bytes for ${path}`);
      
      el.innerHTML = html;
      console.log(`✅ Injected ${path} into DOM`);

    } catch (err) {
      console.error(`❌ Fetch failed for ${path}:`, err.message);
      el.innerHTML = `<div style="background:#ff4444;color:#fff;padding:2rem;text-align:center;border-radius:8px;margin:2rem;"><h3>Network Error</h3><p>${err.message}</p></div>`;
    }
  }

  console.log('✅ All includes processed');
  
  // Tell page that header is ready
  document.dispatchEvent(new CustomEvent('headerLoaded'));
  console.log('📢 Dispatched: headerLoaded');
  
  initializeNavigation();
}

function initializeNavigation() {
  console.log('⚙️ Initializing navigation...');
  
  const nav = document.getElementById('nav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  
  console.log('nav:', !!nav);
  console.log('mobileMenuBtn:', !!mobileMenuBtn);
  console.log('mobileMenu:', !!mobileMenu);
  console.log('mobileMenuOverlay:', !!mobileMenuOverlay);

  // Scroll event
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
    console.log('✅ Scroll handler attached');
  }

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu && mobileMenuOverlay) {
    const toggleMobileMenu = () => {
      mobileMenu.classList.toggle('open');
      mobileMenuOverlay.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : 'auto';
      console.log('📱 Mobile menu toggled');
    };
    
    // Touch + Click support for iOS/Android
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleMobileMenu();
    }, false);

    // Overlay click
    const handleOverlayClick = () => {
      mobileMenu.classList.remove('open');
      mobileMenuOverlay.classList.remove('open');
      document.body.style.overflow = 'auto';
      console.log('📱 Mobile menu closed via overlay');
    };
    
    mobileMenuOverlay.addEventListener('click', handleOverlayClick);
    mobileMenuOverlay.addEventListener('touchend', (e) => {
      if (e.target === mobileMenuOverlay) {
        e.preventDefault();
        handleOverlayClick();
      }
    }, false);

    // Work dropdown toggle FIRST (before general link handlers)
     // Mobile submenu toggle buttons (created in header markup as .mobile-sub-toggle)
    document.querySelectorAll('.mobile-sub-toggle').forEach(btn => {
      const controls = btn.getAttribute('aria-controls');
      const panel = controls ? document.getElementById(controls) : null;
      btn.addEventListener('click', (e) => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (panel) {
          panel.hidden = expanded; // toggle hidden
          // toggle an 'open' class on parent to allow CSS styling
          const parent = btn.closest('.has-dropdown');
          if (parent) parent.classList.toggle('open', !expanded);
        }
        // update indicator character
        const ind = btn.querySelector('.mobile-sub-indicator');
        if (ind) ind.textContent = expanded ? '+' : '−';
        e.stopPropagation();
      }, false);

      // for touch devices: make sure touch doesn't accidentally navigate
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.click();
      }, false);
    });


    // Close on link click (but NOT Work dropdown items)
       // Close on link click (but NOT child items of .has-dropdown that should toggle)
    // Use a short timeout to avoid race conditions on iOS where immediate DOM changes can cancel navigation.
    document.querySelectorAll('.mobile-menu a').forEach(link => {
      // if link is inside a has-dropdown (the dropdown children) we still want clicks to navigate AND keep menu open if needed.
      // We only skip the top-level anchor that is meant to open a submenu toggle — the toggle button handles submenu open/close.
      if (link.closest('.has-dropdown') && link.closest('.has-dropdown').querySelector('.mobile-sub-toggle')) {
        // allow normal navigation for the parent <a> (so tapping "Work" still goes to /work).
        link.addEventListener('click', () => {
          // close menu but delay slightly to let browser perform navigation (fix for iOS).
          setTimeout(() => {
            if (mobileMenu) mobileMenu.classList.remove('open');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
            console.log('📱 Menu closed via link click (delayed)');
          }, 60);
        });
        link.addEventListener('touchend', () => {
          setTimeout(() => {
            if (mobileMenu) mobileMenu.classList.remove('open');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
          }, 60);
        }, false);
        return;
      }

      // Normal links (non-dropdown parents / submenu items) — close after a small delay to ensure navigation works on iOS.
      link.addEventListener('click', () => {
        setTimeout(() => {
          if (mobileMenu) mobileMenu.classList.remove('open');
          if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
          document.body.style.overflow = 'auto';
          console.log('📱 Menu closed via link click (delayed)');
        }, 60);
      });

      link.addEventListener('touchend', () => {
        setTimeout(() => {
          if (mobileMenu) mobileMenu.classList.remove('open');
          if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
          document.body.style.overflow = 'auto';
        }, 60);
      }, false);
    });


    console.log('✅ Mobile menu handlers attached');
  }

  // Search
  const navSearch = document.getElementById('navSearch');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchModal = document.getElementById('searchModal');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  if (navSearch) {
    navSearch.addEventListener('click', () => {
      if (searchOverlay) searchOverlay.classList.add('open');
      if (searchModal) searchModal.classList.add('open');
      if (searchInput) searchInput.focus();
      console.log('🔍 Search opened');
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      if (searchOverlay) searchOverlay.classList.remove('open');
      if (searchModal) searchModal.classList.remove('open');
      console.log('🔍 Search closed');
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('open');
        if (searchModal) searchModal.classList.remove('open');
      }
    });
  }

  console.log('✅ Navigation initialization complete');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadIncludes);
} else {
  loadIncludes();
}

console.log('✅ include.js setup complete');