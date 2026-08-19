(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const animateCounter = (el, target, suffix, duration, onComplete) => {
    if (reduced) {
      el.textContent = `${target}${suffix}`;
      onComplete?.();
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = `${Math.round(target * easeOutCubic(t))}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
      else onComplete?.();
    };
    requestAnimationFrame(tick);
  };

  /* Hero parallax */
  const heroPhoto = document.querySelector(".hero-photo");

  if (!reduced) {
    let heroTick = false;
    const parallax = () => {
      heroTick = false;
      const y = window.scrollY;
      const limit = window.innerHeight * 1.1;
      if (y < limit && heroPhoto) {
        heroPhoto.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (heroTick) return;
        heroTick = true;
        requestAnimationFrame(parallax);
      },
      { passive: true }
    );
    parallax();
  }

  /* Hero 80 counter */
  const spotsBlock = document.querySelector(".spots");
  const spotsCount = document.querySelector(".spots-count");
  const spotsNudge = document.querySelector(".spots-nudge");

  if (spotsCount && spotsBlock) {
    const target = Number(spotsCount.dataset.countTo || 80);

    const runSpots = () => {
      animateCounter(spotsCount, target, "", 1100, () => {
        spotsNudge?.classList.add("is-on");
      });
    };

    if (reduced) {
      spotsCount.textContent = String(target);
      spotsNudge?.classList.add("is-on");
    } else {
      const spotsIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runSpots();
            spotsIo.disconnect();
          });
        },
        { threshold: 0.55, rootMargin: "0px 0px -8% 0px" }
      );
      spotsIo.observe(spotsBlock);
    }
  }

  /* Day timeline — scroll-synced bike + finish line */
  const timeline = document.querySelector(".day-timeline");
  const trackRail = document.querySelector(".day-track-rail");
  const trackFill = document.querySelector(".day-track-fill");
  const bikeMarker = document.querySelector(".day-bike");
  const finishLine = document.querySelector(".day-finish");
  const dayCards = [...document.querySelectorAll(".day-steps .day-card")];

  const updateTimeline = () => {
    if (!timeline || !trackRail || !trackFill || !bikeMarker || !dayCards.length) return;

    const railRect = trackRail.getBoundingClientRect();
    const anchor = window.innerHeight * 0.42;

    const cardCenters = dayCards.map((card) => {
      const rect = card.getBoundingClientRect();
      return rect.top + rect.height * 0.5;
    });

    const centersOnRail = cardCenters.map((y) => y - railRect.top);
    const startY = centersOnRail[0];
    const endY = centersOnRail[centersOnRail.length - 1];
    const finishY = finishLine
      ? finishLine.offsetTop + finishLine.offsetHeight * 0.35
      : endY + 28;

    let targetY = startY;

    if (anchor >= cardCenters[cardCenters.length - 1]) {
      const overshoot = Math.min(
        (anchor - cardCenters[cardCenters.length - 1]) / (window.innerHeight * 0.18),
        1
      );
      targetY = endY + overshoot * (finishY - endY);
    } else if (anchor > cardCenters[0]) {
      for (let i = 0; i < cardCenters.length - 1; i += 1) {
        if (anchor >= cardCenters[i] && anchor <= cardCenters[i + 1]) {
          const span = cardCenters[i + 1] - cardCenters[i] || 1;
          const ratio = (anchor - cardCenters[i]) / span;
          targetY = centersOnRail[i] + ratio * (centersOnRail[i + 1] - centersOnRail[i]);
          break;
        }
      }
    }

    targetY = Math.max(startY, Math.min(finishY, targetY));

    bikeMarker.style.top = `${targetY}px`;
    trackFill.style.height = `${targetY}px`;

    let activeIndex = 0;
    for (let i = 0; i < cardCenters.length; i += 1) {
      if (anchor >= cardCenters[i] - 24) activeIndex = i;
    }

    dayCards.forEach((card, i) => {
      const inSection = timeline.getBoundingClientRect().top < window.innerHeight * 0.82;
      const revealed = inSection && (i === 0 || anchor >= cardCenters[i - 1] + 48);
      card.classList.toggle("is-revealed", revealed);
      card.classList.toggle("is-active", revealed && i === activeIndex);
    });

    const crossed = targetY >= finishY - 6;
    timeline.classList.toggle("is-finished", crossed);
    bikeMarker.classList.toggle("is-crossed", crossed);
    finishLine?.classList.toggle("is-hit", crossed);
  };

  /* Gallery — one-by-one scroll reveal */
  const galleryFrames = [...document.querySelectorAll(".gallery-scroll .gallery-frame")];

  const updateGallery = () => {
    if (!galleryFrames.length) return;

    const focus = window.innerHeight * 0.46;

    galleryFrames.forEach((frame, i) => {
      const rect = frame.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const inView = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18;
      const active = inView && Math.abs(center - focus) < rect.height * 0.55;
      const passed = rect.bottom < window.innerHeight * 0.28;

      const prevVisible = i === 0 || galleryFrames[i - 1].classList.contains("is-gallery-seen");
      const seen = prevVisible && rect.top < window.innerHeight * 0.78;

      frame.classList.toggle("is-gallery-seen", seen);
      frame.classList.toggle("is-gallery-visible", seen && !passed);
      frame.classList.toggle("is-gallery-active", active);
    });
  };

  /* Included — sequential scroll reveal */
  const incCards = [...document.querySelectorAll(".included-list .inc-card")];

  const updateIncluded = () => {
    if (!incCards.length) return;

    const focus = window.innerHeight * 0.5;

    incCards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const trigger = window.innerHeight * 0.76;
      const prevDone = i === 0 || incCards[i - 1].classList.contains("is-step-visible");
      const revealed = prevDone && rect.top < trigger;
      const active = revealed && Math.abs(center - focus) < rect.height * 0.85;

      card.classList.toggle("is-step-visible", revealed);
      card.classList.toggle("is-step-active", active);
    });
  };

  /* Register nudge */
  const registerSection = document.querySelector(".section-register");
  const registerNudge = document.querySelector(".register-nudge");

  if (registerSection && registerNudge && !reduced) {
    const regIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          registerNudge.classList.toggle("is-on", entry.isIntersecting);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    regIo.observe(registerSection);
  } else if (registerNudge) {
    registerNudge.classList.add("is-on");
  }

  const scrollJobs = [];
  if (timeline && dayCards.length && !reduced) scrollJobs.push(updateTimeline);
  if (galleryFrames.length && !reduced) scrollJobs.push(updateGallery);
  if (incCards.length && !reduced) scrollJobs.push(updateIncluded);

  if (scrollJobs.length) {
    let scrollTick = false;
    const onScrollFrame = () => {
      scrollJobs.forEach((job) => job());
      scrollTick = false;
    };
    const onScroll = () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(onScrollFrame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScrollFrame();
  }

  if (timeline && dayCards.length && reduced) {
    trackFill.style.height = "100%";
    bikeMarker.style.top = `${finishLine?.offsetTop || trackRail.getBoundingClientRect().height}px`;
    dayCards.forEach((c) => c.classList.add("is-active", "is-revealed"));
    timeline.classList.add("is-finished");
  }

  if (galleryFrames.length && reduced) {
    galleryFrames.forEach((f) => {
      f.classList.add("is-gallery-seen", "is-gallery-visible", "is-gallery-active");
    });
  }

  if (incCards.length && reduced) {
    incCards.forEach((c) => {
      c.classList.add("is-step-visible", "is-step-active");
    });
  }

  /* Trust carousel — infinite loop */
  const carousel = document.querySelector(".trust-carousel");
  const track = carousel?.querySelector(".carousel-track");
  const slides = track ? [...track.querySelectorAll(".trust-card")] : [];
  const prevBtn = carousel?.querySelector(".carousel-prev");
  const nextBtn = carousel?.querySelector(".carousel-next");
  const dotsWrap = carousel?.querySelector(".carousel-dots");

  if (carousel && track && slides.length > 1 && dotsWrap) {
    const total = slides.length;
    let index = 0;
    let touchStartX = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `המלצה ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll(".carousel-dot")];

    const goTo = (i) => {
      index = ((i % total) + total) % total;
      track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      slides.forEach((slide, si) => {
        slide.setAttribute("aria-hidden", si === index ? "false" : "true");
      });
      dots.forEach((dot, di) => {
        dot.classList.toggle("is-on", di === index);
        dot.setAttribute("aria-selected", di === index ? "true" : "false");
      });
    };

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goTo(index - 1);
      if (e.key === "ArrowLeft") goTo(index + 1);
    });

    const viewport = carousel.querySelector(".carousel-viewport");

    viewport?.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    viewport?.addEventListener(
      "touchend",
      (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) < 40) return;
        goTo(diff > 0 ? index - 1 : index + 1);
      },
      { passive: true }
    );

    goTo(0);
  }
})();
