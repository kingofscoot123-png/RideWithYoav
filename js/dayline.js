(() => {
  const track = document.querySelector(".dayline-track");
  const pin = document.querySelector(".dayline-pin");
  const cards = [...document.querySelectorAll(".dayline-card")];
  const dots = [...document.querySelectorAll(".dayline-dots li")];
  if (!track || !pin || cards.length < 2) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    track.classList.add("is-static");
    track.classList.remove("is-live");
    cards.forEach((card) => card.classList.add("is-on"));
    dots.forEach((dot) => dot.classList.add("is-on"));
    return;
  }

  track.classList.remove("is-static");
  track.classList.add("is-live");

  const steps = cards.length;
  const fade = 0.24;
  let ticking = false;

  const paint = (card, opacity, y) => {
    card.style.opacity = String(opacity);
    card.style.transform = `translate3d(0, ${y}px, 0)`;
    card.classList.toggle("is-on", opacity > 0.55);
  };

  const render = () => {
    ticking = false;
    const range = Math.max(1, track.offsetHeight - pin.offsetHeight);
    let progress = -track.getBoundingClientRect().top / range;
    if (!Number.isFinite(progress)) progress = 0;
    progress = Math.max(0, Math.min(1, progress));
    const scaled = progress * (steps - 0.0001);
    const index = Math.min(steps - 1, Math.floor(scaled));
    const local = scaled - index;

    let from = index;
    let to = index;
    let mix = 0;
    if (local > 1 - fade && index < steps - 1) {
      mix = (local - (1 - fade)) / fade;
      to = index + 1;
    }

    cards.forEach((card, i) => {
      if (i === from && i === to) paint(card, 1, 0);
      else if (i === from) paint(card, 1 - mix, -28 * mix);
      else if (i === to) paint(card, mix, 32 * (1 - mix));
      else paint(card, 0, i < index ? -28 : 32);
    });

    const active = mix > 0.5 ? to : from;
    dots.forEach((dot, i) => dot.classList.toggle("is-on", i === active));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  render();
})();
