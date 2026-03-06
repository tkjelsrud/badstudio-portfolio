(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SPRITE_URL = "/images/collage_1_1080.jpg";
  const TILE_SIZE = 360;
  const GRID_SIZE = 3;
  const MIN_OVERLAY_MS = 6000;
  const MAX_OVERLAY_MS = 12000;
  const MAX_ACTIVE_BURSTS = 1;
  const MIN_AUTO_INTERVAL_MS = 3200;
  const MAX_AUTO_INTERVAL_MS = 9200;
  const AUTO_TRIGGER_CHANCE = 0.78;
  const AUTO_COOLDOWN_MS = 4200;
  const HOVER_TARGET_BIAS = 0.7;
  const HOVER_TRIGGER_CHANCE = 0.4;
  const HOVER_POLL_MS = 2400;
  const HOVER_COOLDOWN_MS = 9000;
  const SCROLL_REST_MS = 1700;

  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.round(rand(min, max));

  const layer = document.createElement("div");
  layer.className = "sprite-ghost-layer";
  document.body.appendChild(layer);

  const sourceImage = new Image();
  sourceImage.src = SPRITE_URL;

  let tileSources = [];
  let ready = false;
  let activeBursts = 0;
  let hoveredImage = null;
  let lastHoverBurstAt = 0;
  let lastAutoBurstAt = 0;
  let scrollRestTimer = null;

  function buildTiles() {
    const tiles = [];
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sourceImage,
          col * TILE_SIZE,
          row * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          0,
          0,
          TILE_SIZE,
          TILE_SIZE
        );
        try {
          tiles.push(canvas.toDataURL("image/webp", 0.84));
        } catch (error) {
          tiles.push(canvas.toDataURL("image/png"));
        }
      }
    }
    tileSources = tiles;
    ready = tileSources.length > 0;
  }

  if (sourceImage.complete && sourceImage.naturalWidth > 0) {
    buildTiles();
  } else {
    sourceImage.addEventListener("load", buildTiles, { once: true });
  }

  function randomTileSource() {
    if (!tileSources.length) return null;
    return tileSources[randInt(0, tileSources.length - 1)];
  }

  function visibleImageCandidates() {
    return Array.from(document.querySelectorAll("img")).filter((img) => {
      if (!img.isConnected) return false;
      if (img.classList.contains("site-logo")) return false;
      if (img.dataset.effectBusy === "1") return false;
      const rect = img.getBoundingClientRect();
      if (rect.width < 90 || rect.height < 90) return false;
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    });
  }

  function pickTargetImageFromVisible() {
    const candidates = visibleImageCandidates();
    if (!candidates.length) return null;
    if (
      hoveredImage &&
      candidates.includes(hoveredImage) &&
      Math.random() < HOVER_TARGET_BIAS
    ) {
      return hoveredImage;
    }
    return candidates[randInt(0, candidates.length - 1)];
  }

  function spawnOverlayOnImage(target) {
    if (activeBursts >= MAX_ACTIVE_BURSTS) return;
    const spriteSrc = randomTileSource();
    if (!spriteSrc || !target) return;

    const rect = target.getBoundingClientRect();
    if (rect.width < 60 || rect.height < 60) return;

    target.dataset.effectBusy = "1";
    const burst = document.createElement("div");
    burst.className = "sprite-ghost-burst";
    burst.style.left = `${rect.left.toFixed(1)}px`;
    burst.style.top = `${rect.top.toFixed(1)}px`;
    burst.style.width = `${rect.width.toFixed(1)}px`;
    burst.style.height = `${rect.height.toFixed(1)}px`;
    const targetRadius = window.getComputedStyle(target).borderRadius;
    if (targetRadius) burst.style.borderRadius = targetRadius;
    layer.appendChild(burst);

    const fragmentWidth = rect.width / GRID_SIZE;
    const fragmentHeight = rect.height / GRID_SIZE;
    const sharedHue = rand(-48, 48);
    const sharedSat = rand(0.9, 1.55);
    const sharedContrast = rand(0.95, 1.28);
    const nodes = [];

    for (let fragRow = 0; fragRow < GRID_SIZE; fragRow += 1) {
      for (let fragCol = 0; fragCol < GRID_SIZE; fragCol += 1) {
        const node = document.createElement("div");
        node.className = "sprite-ghost-tile";
        node.style.width = `${fragmentWidth.toFixed(2)}px`;
        node.style.height = `${fragmentHeight.toFixed(2)}px`;
        node.style.backgroundImage = `url(${spriteSrc})`;
        node.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`;
        node.style.backgroundPosition = `${((fragCol / (GRID_SIZE - 1)) * 100).toFixed(2)}% ${(
          (fragRow / (GRID_SIZE - 1)) *
          100
        ).toFixed(2)}%`;

        const startJitterX = rand(-18, 18);
        const startJitterY = rand(-14, 14);
        const endJitterX = rand(-8, 8);
        const endJitterY = rand(-7, 7);
        const baseLeft = fragCol * fragmentWidth;
        const baseTop = fragRow * fragmentHeight;

        node.style.left = `${(baseLeft + startJitterX).toFixed(1)}px`;
        node.style.top = `${(baseTop + startJitterY).toFixed(1)}px`;
        node.dataset.endLeft = `${(baseLeft + endJitterX).toFixed(1)}`;
        node.dataset.endTop = `${(baseTop + endJitterY).toFixed(1)}`;

        node.style.setProperty("--ghost-base-opacity", rand(0.08, 0.18).toFixed(2));
        node.style.setProperty("--ghost-peak-opacity", rand(0.28, 0.48).toFixed(2));
        node.style.setProperty("--ghost-jx", `${rand(-2.6, 2.6).toFixed(2)}px`);
        node.style.setProperty("--ghost-jy", `${rand(-2.1, 2.1).toFixed(2)}px`);
        node.style.setProperty("--ghost-jitter-delay", `${rand(0, 170).toFixed(0)}ms`);
        node.style.setProperty("--ghost-fade-ms", `${randInt(260, 980)}ms`);
        node.style.setProperty("--ghost-fade-delay", `${randInt(0, 420)}ms`);
        node.style.filter = `hue-rotate(${(sharedHue + rand(-10, 10)).toFixed(1)}deg) saturate(${(
          sharedSat + rand(-0.15, 0.15)
        ).toFixed(2)}) contrast(${(sharedContrast + rand(-0.12, 0.12)).toFixed(2)})`;

        burst.appendChild(node);
        nodes.push(node);
      }
    }

    if (!nodes.length) {
      target.dataset.effectBusy = "0";
      burst.remove();
      return;
    }

    window.requestAnimationFrame(() => {
      for (const node of nodes) {
        node.classList.add("is-active");
        node.style.left = `${node.dataset.endLeft}px`;
        node.style.top = `${node.dataset.endTop}px`;
      }
    });

    activeBursts += 1;
    const showMs = randInt(MIN_OVERLAY_MS, MAX_OVERLAY_MS);
    window.setTimeout(() => {
      for (const node of nodes) {
        node.classList.remove("is-active");
      }
      window.setTimeout(() => {
        for (const node of nodes) {
          node.remove();
        }
        burst.remove();
      }, 520);
      target.dataset.effectBusy = "0";
      activeBursts = Math.max(0, activeBursts - 1);
    }, showMs);
  }

  function bindHoverTriggers() {
    const imgs = Array.from(document.querySelectorAll("img")).filter(
      (img) => !img.classList.contains("site-logo")
    );
    for (const img of imgs) {
      img.addEventListener("mouseenter", () => {
        hoveredImage = img;
        maybeTriggerHoverBurst(true);
      });
      img.addEventListener("mouseleave", () => {
        if (hoveredImage === img) hoveredImage = null;
      });
      img.addEventListener("focus", () => {
        hoveredImage = img;
        maybeTriggerHoverBurst(true);
      });
      img.addEventListener("blur", () => {
        if (hoveredImage === img) hoveredImage = null;
      });
    }
  }

  function maybeTriggerHoverBurst(force = false) {
    if (!ready || !hoveredImage || document.hidden) return;
    if (layer.classList.contains("is-scroll-rest")) return;
    if (activeBursts >= MAX_ACTIVE_BURSTS) return;
    if (hoveredImage.dataset.effectBusy === "1") return;
    const now = Date.now();
    if (now - lastHoverBurstAt < HOVER_COOLDOWN_MS) return;
    if (!force && Math.random() > HOVER_TRIGGER_CHANCE) return;
    lastHoverBurstAt = now;
    spawnOverlayOnImage(hoveredImage);
  }

  function maybeTriggerAutoBurst() {
    if (!ready || document.hidden) return;
    if (layer.classList.contains("is-scroll-rest")) return;
    if (activeBursts >= MAX_ACTIVE_BURSTS) return;
    const now = Date.now();
    if (now - lastAutoBurstAt < AUTO_COOLDOWN_MS) return;
    if (Math.random() > AUTO_TRIGGER_CHANCE) return;

    const target = pickTargetImageFromVisible();
    if (!target || target.dataset.effectBusy === "1") return;

    lastAutoBurstAt = now;
    spawnOverlayOnImage(target);
  }

  function scheduleAutoBursts() {
    const delay = randInt(MIN_AUTO_INTERVAL_MS, MAX_AUTO_INTERVAL_MS);
    window.setTimeout(() => {
      maybeTriggerAutoBurst();
      scheduleAutoBursts();
    }, delay);
  }

  function markScrollRest() {
    layer.classList.add("is-scroll-rest");
    if (scrollRestTimer) {
      window.clearTimeout(scrollRestTimer);
    }
    scrollRestTimer = window.setTimeout(() => {
      layer.classList.remove("is-scroll-rest");
      scrollRestTimer = null;
    }, SCROLL_REST_MS);
  }

  bindHoverTriggers();
  window.addEventListener("scroll", markScrollRest, { passive: true });
  window.addEventListener("wheel", markScrollRest, { passive: true });
  window.addEventListener("touchmove", markScrollRest, { passive: true });
  window.setInterval(() => maybeTriggerHoverBurst(false), HOVER_POLL_MS);
  scheduleAutoBursts();
})();
