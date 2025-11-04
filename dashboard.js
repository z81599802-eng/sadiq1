(function () {
  'use strict';

  const body = document.body;
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const desktopToggle = document.querySelector('[data-sidebar-toggle="desktop"]');
  const mobileToggle = document.querySelector('[data-sidebar-toggle="mobile"]');
  const desktopIconSlot = desktopToggle ? desktopToggle.querySelector('[data-icon-slot="desktop"]') : null;
  const mobileIconSlot = mobileToggle ? mobileToggle.querySelector('[data-icon-slot="mobile"]') : null;
  const mobileQuery = window.matchMedia('(max-width: 960px)');
  const storageKey = 'wissen-dashboard-sidebar-open';
  let isOpen = !mobileQuery.matches;

  const ensureIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  const renderIcon = (slot, iconName) => {
    if (!slot || !window.lucide || !window.lucide.icons) {
      return;
    }

    const icon = window.lucide.icons[iconName];
    if (!icon) {
      return;
    }

    slot.innerHTML = icon.toSvg({
      'aria-hidden': 'true',
      focusable: 'false',
    });
  };

  const getStoredSidebarState = () => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === null) {
        return null;
      }

      return stored === 'true';
    } catch (error) {
      return null;
    }
  };

  const setStoredSidebarState = (value) => {
    try {
      window.localStorage.setItem(storageKey, String(value));
    } catch (error) {
      // Storage can be blocked; ignore to avoid breaking navigation.
    }
  };

  const updateToggleIcons = () => {
    renderIcon(desktopIconSlot, isOpen ? 'panel-left-close' : 'panel-left-open');
    renderIcon(mobileIconSlot, isOpen ? 'x' : 'text-align-start');

    if (desktopToggle) {
      desktopToggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    }
  };

  const syncBodyState = (open, { persist = true } = {}) => {
    isOpen = open;
    body.classList.toggle('sidebar-open', open);
    body.classList.toggle('sidebar-collapsed', !open);

    const mobileActive = mobileQuery.matches;
    body.classList.toggle('no-scroll', mobileActive && open);

    if (overlay) {
      overlay.classList.toggle('visible', mobileActive && open);
    }

    updateToggleIcons();

    if (persist) {
      if (mobileActive) {
        setStoredSidebarState(false);
      } else {
        setStoredSidebarState(open);
      }
    }
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
    if (mobileQuery.matches) {
      syncBodyState(false);
    } else {
      const storedPreference = getStoredSidebarState();
      syncBodyState(storedPreference ?? true);
    }
    highlightActiveLink();
  };

  const handleBreakpointChange = (event) => {
    if (event.matches) {
      syncBodyState(false, { persist: false });
    } else {
      const storedPreference = getStoredSidebarState();
      syncBodyState(storedPreference ?? true, { persist: false });
    }
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
    updateToggleIcons();
  });
})();
