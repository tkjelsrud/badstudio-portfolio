(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selectors = ["a", "h1", "h2", "h3", ".brand"];
  const targets = Array.from(document.querySelectorAll(selectors.join(",")));
  const timers = new WeakMap();

  const rand = (min, max) => min + Math.random() * (max - min);

  function tick(el) {
    el.style.setProperty("--drift-x", `${rand(-1.1, 1.1).toFixed(2)}px`);
    el.style.setProperty("--drift-y", `${rand(-0.8, 0.8).toFixed(2)}px`);
    el.style.setProperty("--drift-ls", `${rand(-0.02, 0.05).toFixed(3)}em`);
  }

  function start(el) {
    if (timers.has(el)) return;
    el.classList.add("drift-text-target", "is-drifting");
    tick(el);
    const id = window.setInterval(() => tick(el), 95);
    timers.set(el, id);
  }

  function stop(el) {
    const id = timers.get(el);
    if (id) {
      window.clearInterval(id);
      timers.delete(el);
    }
    el.classList.remove("is-drifting");
    el.style.removeProperty("--drift-x");
    el.style.removeProperty("--drift-y");
    el.style.removeProperty("--drift-ls");
  }

  for (const el of targets) {
    el.classList.add("drift-text-target");
    el.addEventListener("mouseenter", () => start(el));
    el.addEventListener("mouseleave", () => stop(el));
    el.addEventListener("focus", () => start(el));
    el.addEventListener("blur", () => stop(el));
  }
})();
