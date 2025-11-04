(function () {
  'use strict';

  const body = document.body;
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const desktopToggle = document.querySelector('[data-sidebar-toggle="desktop"]');
  const mobileToggle = document.querySelector('[data-sidebar-toggle="mobile"]');
  const mobileQuery = window.matchMedia('(max-width: 960px)');
  let isOpen = !mobileQuery.matches;

  const ensureIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  const updateToggleIcons = () => {
    const desktopIcon = desktopToggle ? desktopToggle.querySelector('i[data-lucide]') : null;
    const mobileIcon = mobileToggle ? mobileToggle.querySelector('i[data-lucide]') : null;

    if (desktopIcon) {
      desktopIcon.setAttribute('data-lucide', isOpen ? 'panel-left-close' : 'panel-left-open');
    }

    if (mobileIcon) {
      mobileIcon.setAttribute('data-lucide', isOpen ? 'x' : 'text-align-start');
    }

    if (desktopToggle) {
      desktopToggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    }

    ensureIcons();
  };

  const syncBodyState = (open) => {
    isOpen = open;
    body.classList.toggle('sidebar-open', open);
    body.classList.toggle('sidebar-collapsed', !open);

    const mobileActive = mobileQuery.matches;
    body.classList.toggle('no-scroll', mobileActive && open);

    if (overlay) {
      overlay.classList.toggle('visible', mobileActive && open);
    }

    updateToggleIcons();
  };

  const toggleSidebar = () => {
    syncBodyState(!isOpen);
  };

  const highlightActiveLink = () => {
    const pageKey = body.dataset.page;
    if (!pageKey) {
      return;
    }

    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const activeLink = document.querySelector(`.sidebar-link[data-page-target="${pageKey}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  };

  const initialiseState = () => {
    syncBodyState(!mobileQuery.matches);
    highlightActiveLink();
  };

  const handleBreakpointChange = (event) => {
    syncBodyState(!event.matches);
  };

  if (desktopToggle) {
    desktopToggle.addEventListener('click', toggleSidebar);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', () => syncBodyState(false));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileQuery.matches && isOpen) {
      syncBodyState(false);
    }
  });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(handleBreakpointChange);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initialiseState();
    ensureIcons();
  });
})();
