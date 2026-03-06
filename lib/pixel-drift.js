(() => {
  const MIN_INTERVAL_MS = 5000;
  const MAX_INTERVAL_MS = 14000;
  const MIN_EFFECT_MS = 750;
  const MAX_EFFECT_MS = 1800;
  const MIN_PIXEL_SCALE = 0.28;
  const MAX_PIXEL_SCALE = 0.45;
  const INITIAL_TRIGGER_DELAY_MS = 2200;

  const images = Array.from(document.querySelectorAll("img")).filter(
    (img) => !img.classList.contains("site-logo")
  );
  if (!images.length) return;

  const stateByImage = new WeakMap();
  let cycleRunning = false;

  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.round(rand(min, max));

  function getState(img) {
    if (!stateByImage.has(img)) {
      stateByImage.set(img, {
        active: false,
        pixelSrc: null,
        width: 0,
        height: 0,
      });
    }
    return stateByImage.get(img);
  }

  function isVisible(img) {
    const rect = img.getBoundingClientRect();
    return (
      rect.width > 20 &&
      rect.height > 20 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight
    );
  }

  function waitForImage(img) {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve(true);
    return new Promise((resolve) => {
      const done = () => resolve(img.naturalWidth > 0);
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  async function buildPixelVersion(img) {
    const loaded = await waitForImage(img);
    if (!loaded) return null;

    const rect = img.getBoundingClientRect();
    const targetWidth = Math.max(24, Math.round(rect.width || img.naturalWidth || 0));
    const targetHeight = Math.max(24, Math.round(rect.height || img.naturalHeight || 0));
    if (!targetWidth || !targetHeight) return null;

    const pixelScale = rand(MIN_PIXEL_SCALE, MAX_PIXEL_SCALE);
    const smallWidth = Math.max(8, Math.round(targetWidth * pixelScale));
    const smallHeight = Math.max(8, Math.round(targetHeight * pixelScale));

    const tinyCanvas = document.createElement("canvas");
    tinyCanvas.width = smallWidth;
    tinyCanvas.height = smallHeight;

    const tinyCtx = tinyCanvas.getContext("2d");
    if (!tinyCtx) return null;
    tinyCtx.imageSmoothingEnabled = true;
    tinyCtx.drawImage(img, 0, 0, smallWidth, smallHeight);

    const pixelCanvas = document.createElement("canvas");
    pixelCanvas.width = targetWidth;
    pixelCanvas.height = targetHeight;

    const pixelCtx = pixelCanvas.getContext("2d");
    if (!pixelCtx) return null;
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(tinyCanvas, 0, 0, targetWidth, targetHeight);

    try {
      return {
        src: pixelCanvas.toDataURL("image/webp", 0.82),
        width: targetWidth,
        height: targetHeight,
      };
    } catch (error) {
      try {
        return {
          src: pixelCanvas.toDataURL("image/png"),
          width: targetWidth,
          height: targetHeight,
        };
      } catch (fallbackError) {
        return null;
      }
    }
  }

  async function triggerPixelDrift(img) {
    const state = getState(img);
    if (state.active || img.dataset.effectBusy === "1") return;

    const rect = img.getBoundingClientRect();
    const width = Math.round(rect.width || 0);
    const height = Math.round(rect.height || 0);
    const needsRebuild =
      !state.pixelSrc ||
      Math.abs(width - state.width) > 24 ||
      Math.abs(height - state.height) > 24;

    if (needsRebuild) {
      const built = await buildPixelVersion(img);
      if (!built || !built.src) return;
      state.pixelSrc = built.src;
      state.width = built.width;
      state.height = built.height;
    }

    const originalSrc = img.getAttribute("src");
    const originalSrcset = img.getAttribute("srcset");
    if (!originalSrc) return;

    state.active = true;
    img.dataset.effectBusy = "1";
    img.classList.add("pixel-drift-active");
    if (originalSrcset !== null) img.removeAttribute("srcset");
    img.setAttribute("src", state.pixelSrc);

    window.setTimeout(() => {
      if (img.isConnected) {
        if (originalSrcset !== null) img.setAttribute("srcset", originalSrcset);
        img.setAttribute("src", originalSrc);
        img.classList.remove("pixel-drift-active");
      }
      state.active = false;
      img.dataset.effectBusy = "0";
    }, randInt(MIN_EFFECT_MS, MAX_EFFECT_MS));
  }

  async function runCycle() {
    if (cycleRunning || document.hidden) return;
    cycleRunning = true;

    try {
      const visible = images.filter((img) => img.isConnected && isVisible(img));
      const pool = visible.length ? visible : images.filter((img) => img.isConnected);
      if (!pool.length) return;
      const target = pool[randInt(0, pool.length - 1)];
      await triggerPixelDrift(target);
    } finally {
      cycleRunning = false;
    }
  }

  function scheduleNextCycle() {
    const delay = randInt(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    window.setTimeout(async () => {
      await runCycle();
      scheduleNextCycle();
    }, delay);
  }

  window.setTimeout(() => {
    void runCycle();
  }, INITIAL_TRIGGER_DELAY_MS);
  scheduleNextCycle();
})();
