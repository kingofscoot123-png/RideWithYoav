(() => {
  const header = document.getElementById("header");
  const sticky = document.getElementById("sticky-cta");
  const register = document.getElementById("register");
  const heroPhoto = document.querySelector(".hero-photo");
  const form = document.getElementById("reg-form");
  const success = document.getElementById("form-success");
  const errorEl = document.getElementById("form-error");
  const successName = document.getElementById("success-name");
  const resetBtn = document.getElementById("success-reset");
  const images = window.RWY_IMAGES || {};

  document.querySelectorAll("img[data-key]").forEach((img) => {
    const key = img.dataset.key;
    if (images[key]) img.src = images[key];

    img.addEventListener("error", () => {
      if (images.fallback && img.src !== images.fallback) {
        img.src = images.fallback;
      }
    }, { once: true });
  });

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);

    if (heroPhoto && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroPhoto.style.transform = `translateY(${y * 0.12}px)`;
    }

    if (!sticky || !register) return;
    const heroH = document.querySelector(".hero")?.offsetHeight || 500;
    const regTop = register.getBoundingClientRect().top;
    const regBottom = register.getBoundingClientRect().bottom;
    const inRegister = regTop < window.innerHeight * 0.7 && regBottom > 80;
    sticky.classList.toggle("is-on", y > heroH * 0.55 && !inRegister);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

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
