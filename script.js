(function () {
  'use strict';

  const header = document.getElementById('site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const focusableMenuItems = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const supportAction = document.querySelector('.support-action');
  const mobileQuery = window.matchMedia('(max-width: 960px)');

  const trapFocus = (event) => {
    if (!mobileMenu || !mobileMenu.classList.contains('open')) return;

    const first = focusableMenuItems[0];
    const last = focusableMenuItems[focusableMenuItems.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }

    if (event.key === 'Escape') {
      toggleMenu(false);
      if (navToggle) {
        navToggle.focus();
      }
    }
  };

  const toggleMenu = (force) => {
    if (!mobileMenu || !navToggle) return;

    const isOpen = force ?? !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen && focusableMenuItems.length > 0) {
      focusableMenuItems[0].focus();
      document.addEventListener('keydown', trapFocus);
    } else {
      document.removeEventListener('keydown', trapFocus);
    }
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => toggleMenu());
  }

  if (mobileMenu) {
    mobileMenu.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        toggleMenu(false);
      }
    });
  }

  const syncHeaderState = () => {
    if (!header) return;

    const scrolled = window.scrollY > 12 || mobileQuery.matches;
    header.classList.toggle('scrolled', scrolled);
  };

  if (header) {
    syncHeaderState();
  }

  window.addEventListener('scroll', syncHeaderState, { passive: true });
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncHeaderState);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(syncHeaderState);
  }

  if (supportAction) {
    supportAction.addEventListener('click', () => {
      const targetSelector = supportAction.getAttribute('data-target');
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const backToTopButtons = document.querySelectorAll('.back-to-top');

  const scrollToTop = () => {
    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } catch (error) {
        window.scrollTo(0, 0);
      }
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  backToTopButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToTop();
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });

  document.querySelectorAll('.hero, .feature-card, .pricing-card, .faq-item').forEach((element) => {
    element.classList.add('animate-in');
    observer.observe(element);
  });
})();
