(function () {
  "use strict";

  const navbar = document.querySelector(".navbar");
  const accordionToggles = document.querySelectorAll(".accordion__toggle");

  const activateNavbarGlass = () => {
    if (!navbar) return;
    if (window.scrollY > 24) {
      navbar.classList.add("navbar--scrolled");
    } else {
      navbar.classList.remove("navbar--scrolled");
    }
  };

  const closeOtherPanels = (currentToggle) => {
    accordionToggles.forEach((toggle) => {
      if (toggle !== currentToggle) {
        toggle.setAttribute("aria-expanded", "false");
        const content = toggle.parentElement?.nextElementSibling;
        if (content) {
          content.removeAttribute("data-open");
        }
      }
    });
  };

  const toggleAccordion = (event) => {
    const toggle = event.currentTarget;
    const content = toggle.parentElement?.nextElementSibling;
    if (!content) {
      return;
    }

    const isOpen = content.hasAttribute("data-open");
    if (isOpen) {
      content.removeAttribute("data-open");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      closeOtherPanels(toggle);
      content.setAttribute("data-open", "true");
      toggle.setAttribute("aria-expanded", "true");
    }
  };

  accordionToggles.forEach((toggle) => {
    toggle.addEventListener("click", toggleAccordion);
  });

  const animateElements = () => {
    const observers = [];
    const animatedElements = document.querySelectorAll(
      "[data-animate='fade-up']"
    );

    if (!("IntersectionObserver" in window)) {
      animatedElements.forEach((element) => {
        element.classList.add("is-visible");
      });
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.2,
      }
    );

    animatedElements.forEach((element) => {
      observer.observe(element);
    });

    observers.push(observer);

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  };

  const assignAnimations = () => {
    document
      .querySelectorAll(
        ".hero__column, .feature-grid__item, .support-grid__item, .pricing-card, .accordion__item"
      )
      .forEach((element, index) => {
        element.dataset.animate = "fade-up";
        element.style.setProperty("--stagger", `${index * 60}ms`);
      });
  };

  const init = () => {
    assignAnimations();
    const disconnectAnimations = animateElements();
    activateNavbarGlass();
    window.addEventListener("scroll", activateNavbarGlass, { passive: true });

    window.addEventListener("unload", () => {
      window.removeEventListener("scroll", activateNavbarGlass);
      if (typeof disconnectAnimations === "function") {
        disconnectAnimations();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
