(function () {
  'use strict';

  const body = document.body;
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const desktopToggle = document.querySelector('[data-sidebar-toggle="desktop"]');
  const mobileToggle = document.querySelector('[data-sidebar-toggle="mobile"]');
  const desktopIconSlot = desktopToggle ? desktopToggle.querySelector('[data-icon-slot="desktop"]') : null;
  const mobileIconSlot = mobileToggle ? mobileToggle.querySelector('[data-icon-slot="mobile"]') : null;
  const main = document.querySelector('[data-dynamic-main]');
  const headerTitle = document.querySelector('[data-header-title]');
  const headerSubtitle = document.querySelector('[data-header-subtitle]');
  const announcer = document.querySelector('[data-page-announcer]');
  const mobileQuery = window.matchMedia('(max-width: 960px)');
  const storageKey = 'wissen-dashboard-sidebar-open';
  let isOpen = !mobileQuery.matches;

  const PAGE_CONFIG = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Business pulse',
      placeholder: 'Welcome to Dashboard',
      description: 'Use this space to monitor revenue, demand, and fulfilment KPIs in real time.',
      allowEmbed: true,
      embedHint: 'Drop in your Metabase dashboard iframe once it is ready.',
    },
    'action-list': {
      title: 'Action List',
      subtitle: 'Execution queue',
      placeholder: 'Welcome to Action List',
      description: 'Track priorities and keep the team focused on the highest-impact work.',
      allowEmbed: true,
      embedHint: 'Embed your workflow or SLA tracker once the Metabase view is published.',
    },
    'account-health': {
      title: 'Account Health',
      subtitle: 'Seller compliance',
      placeholder: 'Welcome to Account Health',
      description: 'Stay ahead of policy updates, risk indicators, and compliance follow-ups.',
      allowEmbed: true,
      embedHint: 'Add Metabase compliance scorecards or alert feeds here when available.',
    },
    'ad-spend': {
      title: 'Ad Spend',
      subtitle: 'Marketing performance',
      placeholder: 'Welcome to Ad Spend',
      description: 'Analyse advertising efficiency and uncover optimisation opportunities fast.',
      allowEmbed: true,
      embedHint: 'Integrate spend efficiency charts or campaign pacing dashboards in this slot.',
    },
    inventory: {
      title: 'Inventory',
      subtitle: 'Stock control',
      placeholder: 'Welcome to Inventory',
      description: 'Balance supply and demand with accurate replenishment and coverage insights.',
      allowEmbed: true,
      embedHint: 'Surface aged stock or sell-through analytics by embedding a Metabase iframe.',
    },
    campaigns: {
      title: 'Campaigns',
      subtitle: 'Lifecycle planning',
      placeholder: 'Welcome to Campaigns',
      description: 'Organise launch calendars, briefs, and retrospectives in one workspace.',
      allowEmbed: false,
    },
    profile: {
      title: 'Profile',
      subtitle: 'Account preferences',
      placeholder: 'Welcome to Profile',
      description: 'Manage personal settings, notification choices, and security controls.',
      allowEmbed: false,
    },
  };

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
    renderIcon(mobileIconSlot, isOpen ? 'x' : 'menu');

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

    document.querySelectorAll('.sidebar-link, .profile-link').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const activeLink = document.querySelector(`.sidebar-link[data-page-target="${pageKey}"]`) || document.querySelector(`.profile-link[data-page-target="${pageKey}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  };

  const derivePageHref = (pageKey) => {
    const link = document.querySelector(`[data-page-target="${pageKey}"]`);
    const href = link ? link.getAttribute('href') : null;
    if (href && href.trim().length > 0) {
      return href;
    }

    return `${pageKey}.html`;
  };

  const buildPagePanel = (pageKey, config) => {
    const section = document.createElement('section');
    section.className = 'content-section page-panel';
    const headingId = `page-panel-heading-${pageKey}`;
    section.setAttribute('aria-labelledby', headingId);

    const headingWrapper = document.createElement('header');
    headingWrapper.className = 'panel-heading';

    const heading = document.createElement('h2');
    heading.id = headingId;
    heading.textContent = `${config.title} workspace`;
    headingWrapper.appendChild(heading);

    const supportingCopy = document.createElement('p');
    supportingCopy.className = 'page-supporting-copy';
    supportingCopy.textContent = config.description;

    const panelBody = document.createElement('div');
    panelBody.className = 'panel-body';

    const placeholder = document.createElement('p');
    placeholder.className = 'page-placeholder';
    placeholder.textContent = config.placeholder;
    panelBody.appendChild(placeholder);

    if (config.allowEmbed) {
      const embedSurface = document.createElement('div');
      embedSurface.className = 'embed-surface';
      embedSurface.setAttribute('role', 'group');
      embedSurface.setAttribute('aria-label', `${config.title} analytics embed holder`);
      embedSurface.dataset.embedTarget = pageKey;

      const embedHint = document.createElement('p');
      embedHint.className = 'embed-hint';
      embedHint.textContent = config.embedHint || 'Add your analytics iframe here when it is ready.';
      embedSurface.appendChild(embedHint);

      panelBody.appendChild(embedSurface);
    }

    section.appendChild(headingWrapper);
    section.appendChild(supportingCopy);
    section.appendChild(panelBody);

    return section;
  };

  const setHeaderContent = (config) => {
    if (headerTitle) {
      headerTitle.textContent = config.title;
    }

    if (headerSubtitle) {
      headerSubtitle.textContent = config.subtitle;
    }
  };

  const announcePageChange = (config) => {
    if (!announcer) {
      return;
    }

    window.requestAnimationFrame(() => {
      announcer.textContent = `${config.title} loaded`;
    });
  };

  const focusPanel = (panel) => {
    if (!panel) {
      return;
    }

    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: false });
    panel.addEventListener(
      'blur',
      () => {
        panel.removeAttribute('tabindex');
      },
      { once: true }
    );
  };

  const renderPage = (pageKey, { pushState = false, href, announce = true } = {}) => {
    const config = PAGE_CONFIG[pageKey] || PAGE_CONFIG.dashboard;
    body.dataset.page = pageKey;

    setHeaderContent(config);

    if (main) {
      main.innerHTML = '';
      const panel = buildPagePanel(pageKey, config);
      main.appendChild(panel);
      focusPanel(panel);
    }

    highlightActiveLink();

    document.title = `Wissen Ecom | ${config.title}`;

    if (announce) {
      announcePageChange(config);
    }

    if (pushState) {
      const nextHref = href || derivePageHref(pageKey);
      try {
        window.history.pushState({ page: pageKey }, document.title, nextHref);
      } catch (error) {
        // History updates can be blocked by browser privacy settings.
      }
    }

    if (mobileQuery.matches && isOpen) {
      syncBodyState(false, { persist: false });
    }
  };

  const shouldHandleClientNavigation = (event) => {
    if (event.defaultPrevented) {
      return false;
    }

    if (event.button !== 0) {
      return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return false;
    }

    return true;
  };

  const bindDynamicNavigation = () => {
    document.querySelectorAll('[data-page-target]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetPage = link.getAttribute('data-page-target');
        if (!targetPage || !PAGE_CONFIG[targetPage]) {
          return;
        }

        if (!shouldHandleClientNavigation(event)) {
          return;
        }

        event.preventDefault();
        renderPage(targetPage, { pushState: true, href: link.getAttribute('href') || undefined });
      });
    });
  };

  const getInitialPage = () => {
    const path = window.location.pathname || '';
    const match = path.match(/([\w-]+)\.html$/);
    if (match && PAGE_CONFIG[match[1]]) {
      return match[1];
    }

    if (body.dataset.page && PAGE_CONFIG[body.dataset.page]) {
      return body.dataset.page;
    }

    return 'dashboard';
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

  window.addEventListener('popstate', (event) => {
    const nextPage = (event.state && event.state.page && PAGE_CONFIG[event.state.page]) ? event.state.page : getInitialPage();
    renderPage(nextPage, { pushState: false, announce: false });
  });

  document.addEventListener('DOMContentLoaded', () => {
    initialiseState();
    ensureIcons();
    updateToggleIcons();
    const initialPage = getInitialPage();
    renderPage(initialPage, { pushState: false, announce: false });
    bindDynamicNavigation();
  });
})();
