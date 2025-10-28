(function () {
  'use strict';

  const header = document.getElementById('site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const focusableMenuItems = mobileMenu.querySelectorAll('a');

  const trapFocus = (event) => {
    if (!mobileMenu.classList.contains('open')) return;

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
      navToggle.focus();
    }
  };

  const toggleMenu = (force) => {
    const isOpen = force ?? !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen && focusableMenuItems.length > 0) {
      focusableMenuItems[0].focus();
      document.addEventListener('keydown', trapFocus);
    } else {
      document.removeEventListener('keydown', trapFocus);
    }
  };

  navToggle.addEventListener('click', () => toggleMenu());

  mobileMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      toggleMenu(false);
    }
  });

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 12;
    header.classList.toggle('scrolled', scrolled);
  }, { passive: true });

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
