/* Colour bleed.
   Every so often one image forgets it is black and white: colour floods in
   quickly, holds for a moment, then drains back out slowly. Sits in the same
   family as pixel-drift.js and shares its `dataset.effectBusy` mutex, so two
   effects never grab the same image at once.

   Needs a stylesheet that routes desaturation through the --img-gray custom
   property, e.g.
       filter: grayscale(var(--img-gray, 1)) contrast(1.4);
       transition: filter var(--img-gray-ms, 900ms) ease;
   The alt-*.css variants do this. On a stylesheet that does not, the script
   is inert rather than wrong. */
(() => {
  const MIN_INTERVAL_MS = 6000;
  const MAX_INTERVAL_MS = 16000;

  const BLEED_IN_MS = [220, 430];     // colour arrives fast
  const HOLD_MS = [420, 1150];        // and lingers
  const DRAIN_MS = [1500, 2700];      // then leaves slowly

  const PARTIAL_CHANCE = 0.25;        // sometimes it only half-remembers
  const PARTIAL_GRAY = [0.3, 0.55];

  const INITIAL_DELAY_MS = 3400;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const images = Array.from(document.querySelectorAll("img")).filter(
    (img) => !img.classList.contains("site-logo")
  );
  if (!images.length) return;

  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.round(rand(min, max));
  const pick = (range) => rand(range[0], range[1]);

  function isVisible(img) {
    const rect = img.getBoundingClientRect();
    return (
      rect.width > 20 &&
      rect.height > 20 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight
    );
  }

  /* Only act where the stylesheet actually desaturates: otherwise there is
     no black and white to bleed out of. */
  function usesGrayscale(img) {
    const filter = getComputedStyle(img).filter;
    return filter && filter !== "none" && filter.includes("grayscale");
  }

  function setGray(img, value, ms) {
    img.style.setProperty("--img-gray-ms", Math.round(ms) + "ms");
    img.style.setProperty("--img-gray", String(value));
  }

  function clearGray(img) {
    img.style.removeProperty("--img-gray");
    img.style.removeProperty("--img-gray-ms");
  }

  function bleed(img) {
    if (img.dataset.effectBusy === "1") return;
    if (!usesGrayscale(img)) return;

    img.dataset.effectBusy = "1";

    const target =
      Math.random() < PARTIAL_CHANCE ? pick(PARTIAL_GRAY) : 0;
    const inMs = pick(BLEED_IN_MS);
    const holdMs = pick(HOLD_MS);
    const outMs = pick(DRAIN_MS);

    setGray(img, target, inMs);

    window.setTimeout(() => {
      if (!img.isConnected) {
        img.dataset.effectBusy = "0";
        return;
      }
      setGray(img, 1, outMs);
      window.setTimeout(() => {
        if (img.isConnected) clearGray(img);
        img.dataset.effectBusy = "0";
      }, outMs + 80);
    }, inMs + holdMs);
  }

  function runCycle() {
    if (document.hidden) return;
    const visible = images.filter((img) => img.isConnected && isVisible(img));
    const pool = visible.length ? visible : images.filter((img) => img.isConnected);
    if (!pool.length) return;
    bleed(pool[randInt(0, pool.length - 1)]);
  }

  function scheduleNextCycle() {
    window.setTimeout(() => {
      runCycle();
      scheduleNextCycle();
    }, randInt(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
  }

  window.setTimeout(runCycle, INITIAL_DELAY_MS);
  scheduleNextCycle();
})();
