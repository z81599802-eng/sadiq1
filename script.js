(function () {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function updateHeaderState() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function trapFocus(event) {
    if (!mobileNav.classList.contains('open')) {
      return;
    }

    const focusable = mobileNav.querySelectorAll('a');
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeMobileMenu() {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.focus();
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      return;
    }

    if (event.key === 'Tab') {
      trapFocus(event);
    }
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      const focusTarget = mobileNav.querySelector('a');
      focusTarget?.focus();
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('keydown', handleKeydown);
    }
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  });

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
})();
