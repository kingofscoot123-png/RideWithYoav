(() => {
  const header = document.getElementById("header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const sticky = document.getElementById("sticky-cta");
  const register = document.getElementById("register");
  const form = document.getElementById("reg-form");
  const success = document.getElementById("form-success");
  const errorEl = document.getElementById("form-error");
  const successName = document.getElementById("success-name");
  const resetBtn = document.getElementById("success-reset");
  const images = window.RWY_IMAGES || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("img[data-key]").forEach((img) => {
    const key = img.dataset.key;
    if (images[key]) img.src = images[key];

    img.addEventListener("error", () => {
      if (images.fallback && img.src !== images.fallback) {
        img.src = images.fallback;
      }
    }, { once: true });
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);

      if (sticky && register) {
        const heroH = document.querySelector(".hero")?.offsetHeight || 500;
        const regTop = register.getBoundingClientRect().top;
        const regBottom = register.getBoundingClientRect().bottom;
        const inRegister = regTop < window.innerHeight * 0.7 && regBottom > 80;
        sticky.classList.toggle("is-on", window.scrollY > heroH * 0.55 && !inRegister);
      }
      ticking = false;
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeNav = () => {
    header?.classList.remove("is-nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "פתיחת תפריט");
  };

  navToggle?.addEventListener("click", () => {
    const open = !header.classList.contains("is-nav-open");
    header.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
  });

  siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeNav();
  });

  const reveals = [...document.querySelectorAll(".reveal")];

  if (reducedMotion) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      errorEl.hidden = false;
      form.reportValidity();
      return;
    }
    errorEl.hidden = true;
    const data = new FormData(form);
    successName.textContent = `${data.get("name")} · ${data.get("phone")}`;
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  resetBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    success.hidden = true;
    form.hidden = false;
    form.reset();
  });
})();
