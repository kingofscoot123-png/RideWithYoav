(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const tiltWrap = document.querySelector(".yoav-tilt");
  const tiltInner = document.querySelector(".yoav-tilt-inner");
  const panel = document.querySelector(".yoav-panel");
  const lines = [...document.querySelectorAll(".yoav-line")];
  const counters = [...document.querySelectorAll(".facts [data-count]")];

  if (tiltWrap && tiltInner && canHover && !reduced) {
    const reset = () => {
      tiltInner.style.transform = "rotateX(0deg) rotateY(0deg)";
      tiltInner.style.boxShadow = "";
    };

    tiltWrap.addEventListener("mousemove", (event) => {
      const rect = tiltWrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotY = x * -14;
      const rotX = y * 10;
      tiltInner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      tiltInner.style.boxShadow = `${-x * 28}px ${22 + y * 18}px 48px rgba(15, 20, 12, 0.5)`;
    });

    tiltWrap.addEventListener("mouseleave", reset);
  }

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    if (reduced) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    el.textContent = `0${suffix}`;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const playYoav = () => {
    lines.forEach((line, i) => {
      line.style.transitionDelay = `${i * 140}ms`;
      line.classList.add("is-in");
    });
    counters.forEach(animateCount);
  };

  if (!panel) return;

  if (reduced) {
    playYoav();
    return;
  }

  panel.classList.add("is-armed");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        playYoav();
        io.disconnect();
      });
    },
    { threshold: 0.28 }
  );

  io.observe(panel);
})();
