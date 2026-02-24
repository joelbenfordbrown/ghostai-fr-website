/* =============================================================
   GhostAI — Sparkle Background Effect
   ─────────────────────────────────────────────────────────────
   HOW TO ADD:  paste just before your closing </body> tag:
     <script src="ghostai-sparkle.js"></script>

   HOW TO REMOVE:  comment out or delete that one line.
   No other file is ever touched.
   ─────────────────────────────────────────────────────────────
   WHAT IT DOES:
     • Fixed <canvas> behind all content (z-index 0,
       pointer-events none — invisible to all clicks/touch)
     • Stars radiate outward from screen centre — creates the
       illusion of moving through space / parallax depth
     • Crisp sharp points only — no halos, no blobs
     • Twinkle = slow sine-wave breath — never flickers
     • Colours set once at star birth, never changed mid-flight
     • Occasional shooting stars — graceful diagonal streaks
     • Respects prefers-reduced-motion (static, no animation)
     • Auto-resizes; pauses on hidden tab (battery friendly)
   ============================================================= */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Canvas ─────────────────────────────────────────────────── */
  const canvas = document.createElement("canvas");
  canvas.id = "ghostai-sparkle-canvas";
  Object.assign(canvas.style, {
    position: "fixed", top: "0", left: "0",
    width: "100%", height: "100%",
    pointerEvents: "none",
    zIndex: "0",
    display: "block",
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  if (getComputedStyle(document.body).position === "static") {
    document.body.style.position = "relative";
  }
  const ctx = canvas.getContext("2d");

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let cx = W / 2;  // origin point — centre of screen
  let cy = H / 2;

  window.addEventListener("resize", () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }, { passive: true });

  /* ── Palette ─────────────────────────────────────────────────
     Vivid greens centred on the site's signature #42a11a.
     Colour picked ONCE per star at birth — never changed again.
     Weighted toward saturated greens so stars read as clearly
     green against the warm cream background, not grey-green.   */
  const PALETTE = [
    [66,  161,  26],  // #42a11a — signature green (most common)
    [66,  161,  26],  // repeated to increase weighting
    [78,  185,  30],  // bright lime
    [78,  185,  30],  // repeated to increase weighting
    [52,  138,  18],  // deep forest green
    [100, 200,  55],  // vivid spring green
    [120, 215,  70],  // lighter vivid green
    [150, 225, 100],  // pale but still clearly green
  ];
  function randRGB() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  /* ── Star ────────────────────────────────────────────────────
     Each star is born near the screen centre and travels
     outward along a fixed angle — like flying through space.

     Movement model:
       • Starts slow near centre (distant stars)
       • Accelerates gently as it moves outward (closer stars)
       • This speed differential creates parallax depth
       • Recycled back to centre when it exits the screen

     Twinkle = sine wave on opacity:
       opacity = midAlpha + sin(phase) × amplitude
       Full cycle: 8–30 seconds — imperceptible as flicker,
       just reads as the star being alive and breathing.        */
  class Star {
    constructor(scatter) { this.birth(scatter); }

    birth(scatter) {
      /* Random direction from centre — fixed for star's lifetime */
      this.angle = Math.random() * Math.PI * 2;

      /* scatter=true on init: spread across full canvas.
         scatter=false on recycle: always re-born near centre.  */
      const maxD = Math.sqrt(cx * cx + cy * cy);
      this.dist  = scatter
        ? Math.random() * maxD * 0.9    // initial full spread
        : Math.random() * maxD * 0.12;  // recycled — near centre

      this.speed   = 0.08 + Math.random() * 0.22;  // base outward speed
      this.r       = 0.4  + Math.random() * 1.0;   // radius: 0.4–1.4px tiny
      this.isCross = Math.random() < 0.15;          // 15% are 4-point crosses

      /* Colour — set once, never changes */
      this.rgb = randRGB();

      /* Twinkle parameters */
      this.phase       = Math.random() * Math.PI * 2;
      this.twinkleRate = 0.003 + Math.random() * 0.008; // 8–30s full cycle
      this.midAlpha    = 0.30 + Math.random() * 0.35;   // 0.30–0.65 — visible
      this.amplitude   = 0.08 + Math.random() * 0.12;   // gentle breathing
    }

    update() {
      const maxD = Math.sqrt(cx * cx + cy * cy);

      /* Outward movement — accelerates with distance for depth feel */
      this.dist += this.speed * (0.6 + this.dist / (maxD * 1.5));
      this.phase += this.twinkleRate;

      /* Recycle when star exits visible area */
      if (this.dist > maxD * 1.1) this.birth(false);
    }

    draw() {
      /* Convert polar (angle + distance) to screen x,y */
      const x = cx + Math.cos(this.angle) * this.dist;
      const y = cy + Math.sin(this.angle) * this.dist;

      /* Fade in near centre so stars don't abruptly pop into view */
      const maxD   = Math.sqrt(cx * cx + cy * cy);
      const fadeIn = Math.min(1, this.dist / (maxD * 0.08));

      const alpha = (this.midAlpha + Math.sin(this.phase) * this.amplitude) * fadeIn;
      const [r, g, b] = this.rgb;

      ctx.save();
      ctx.globalAlpha = Math.min(alpha, 0.78); // hard ceiling — never harsh

      if (!this.isCross) {
        /* Crisp dot — no halo, no glow, just a clean sharp point */
        ctx.beginPath();
        ctx.arc(x, y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();
      } else {
        /* Delicate 4-point star cross */
        const arm = this.r * 2.0;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth   = Math.max(0.3, this.r * 0.45);
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(x - arm, y); ctx.lineTo(x + arm, y);
        ctx.moveTo(x, y - arm); ctx.lineTo(x, y + arm);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /* ── Shooting star ───────────────────────────────────────────
     Graceful diagonal streaks with a fading gradient tail.
     Fires every 3–7 seconds; up to 2 active at once.          */
  class ShootingStar {
    constructor() { this.active = false; }

    fire() {
      if (this.active) return;
      this.x     = Math.random() * W * 0.8 + W * 0.05;
      this.y     = Math.random() * H * 0.3;
      const deg  = 15 + Math.random() * 35;   // gentle downward diagonal
      const spd  = 4  + Math.random() * 4;
      this.vx    = Math.cos(deg * Math.PI / 180) * spd;
      this.vy    = Math.sin(deg * Math.PI / 180) * spd;
      this.alpha = 0.5 + Math.random() * 0.2; // starts gentle, not harsh
      this.tail  = 40 + Math.random() * 60;
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x    += this.vx;
      this.y    += this.vy;
      this.alpha -= 0.011;                     // slow graceful fade
      if (this.alpha <= 0 || this.x > W + 80 || this.y > H + 80) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      const steps = this.tail / Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const tx    = this.x - this.vx * steps;
      const ty    = this.y - this.vy * steps;
      const grad  = ctx.createLinearGradient(tx, ty, this.x, this.y);
      grad.addColorStop(0, `rgba(120,200,60,0)`);
      grad.addColorStop(1, `rgba(66,161,26,${this.alpha.toFixed(2)})`);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.4;
      ctx.lineCap     = "round";
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Shooting star (right to left) ──────────────────────────
     Identical twin of ShootingStar — fires from the right side
     and travels right-to-left. Completely independent system.  */
  class ShootingStarRight {
    constructor() { this.active = false; }

    fire() {
      if (this.active) return;
      this.x     = W - (Math.random() * W * 0.8 + W * 0.05);
      this.y     = Math.random() * H * 0.3;
      const deg  = 15 + Math.random() * 35;
      const spd  = 4  + Math.random() * 4;
      this.vx    = -Math.cos(deg * Math.PI / 180) * spd;
      this.vy    =  Math.sin(deg * Math.PI / 180) * spd;
      this.alpha = 0.5 + Math.random() * 0.2;
      this.tail  = 40 + Math.random() * 60;
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x    += this.vx;
      this.y    += this.vy;
      this.alpha -= 0.011;
      if (this.alpha <= 0 || this.x < -80 || this.y > H + 80) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      const steps = this.tail / Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const tx    = this.x - this.vx * steps;
      const ty    = this.y - this.vy * steps;
      const grad  = ctx.createLinearGradient(tx, ty, this.x, this.y);
      grad.addColorStop(0, `rgba(120,200,60,0)`);
      grad.addColorStop(1, `rgba(66,161,26,${this.alpha.toFixed(2)})`);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.4;
      ctx.lineCap     = "round";
      ctx.stroke();
      ctx.restore();
    }
  }
   
   /* ── Initialise ──────────────────────────────────────────────
     Stars scattered across full canvas on load so it looks
     populated immediately — not building from centre.          */
  const COUNT  = Math.min(160, Math.floor((W * H) / 6000));
  const stars  = Array.from({ length: COUNT }, () => new Star(true));

  /* Two shooting stars — can occasionally overlap for richness */
  const meteors = [new ShootingStar(), new ShootingStar()];
   const meteorsRight = [new ShootingStarRight(), new ShootingStarRight()];

  function scheduleMeteor() {
    setTimeout(() => {
      const idle = meteors.find(m => !m.active);
      if (idle) idle.fire();
      scheduleMeteor();
    }, 3000 + Math.random() * 4000); // every 3–7 seconds
  }
  scheduleMeteor();
   function scheduleMeteorRight() {
    setTimeout(() => {
      const idle = meteorsRight.find(m => !m.active);
      if (idle) idle.fire();
      scheduleMeteorRight();
    }, 3000 + Math.random() * 4000);
  }
  scheduleMeteorRight();

  /* ── Animation loop ──────────────────────────────────────────  */
  let rafId;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }
    meteors.forEach(m => { m.update(); m.draw(); });
     meteorsRight.forEach(m => { m.update(); m.draw(); });
    rafId = requestAnimationFrame(animate);
  }

  if (reducedMotion) {
    /* Static render only for users who prefer reduced motion */
    for (let i = 0; i < stars.length; i++) stars[i].draw();
  } else {
    animate();
  }

  /* Pause when browser tab is hidden — battery & CPU friendly */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else if (!reducedMotion) { animate(); }
  });

  /* ── END ghostai-sparkle.js ── */
})();
