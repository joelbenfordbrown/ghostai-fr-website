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
     • ~160 tiny stars radiating outward from screen centre —
       slow near centre, faster toward edges — creates a
       parallax depth illusion of flying through space
     • Shapes: crisp sharp dot (most) + delicate 4-point cross
     • Twinkle = slow sine-wave breath (8–30s cycle) — no flicker
     • Colours set once at star birth, never changed mid-flight
     • Occasional shooting stars every 3–7 seconds (up to 2 at once)
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
    pointerEvents: "none",   // never intercepts clicks or touch
    zIndex: "0",             // sits behind all existing content
    display: "block",
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  if (getComputedStyle(document.body).position === "static") {
    document.body.style.position = "relative";
  }
  const ctx = canvas.getContext("2d");

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let cx = W / 2;  // centre origin point — stars radiate outward from here
  let cy = H / 2;

  window.addEventListener("resize", () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }, { passive: true });

  /* ── Palette ─────────────────────────────────────────────────
     Colour picked ONCE per star at birth. Never randomised again.
     Weighted toward vivid signature greens so stars read as
     clearly green against the warm cream background, not grey.  */
  const PALETTE = [
    [66,  161,  26],  // #42a11a — signature green (most common)
    [66,  161,  26],  // #42a11a — repeated to increase frequency
    [82,  195,  35],  // bright lime green
    [82,  195,  35],  // repeated to increase frequency
    [54,  140,  18],  // deep forest green
    [100, 200,  60],  // vivid spring green
    [130, 215,  80],  // medium bright green
    [180, 235, 130],  // pale but still green — not white
  ];
  function randRGB() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  /* ── Star ────────────────────────────────────────────────────
     Movement model: each star is born near the screen centre
     and travels outward along a fixed angle — like the viewer
     is flying forward through space. Speed scales gently with
     distance from centre, creating a natural parallax effect.

     Twinkle = opacity breathing via sine wave:
       opacity = midAlpha + sin(phase) × amplitude
       twinkleRate 0.003–0.008 rad/frame → full cycle = 8–30s
       At 60fps: completely imperceptible as flicker — just alive.
  */
  class Star {
    constructor(scatter) { this.birth(scatter); }

    birth(scatter) {
      /* Random outward angle — determines direction of travel */
      this.angle = Math.random() * Math.PI * 2;

      /* Distance from centre.
         scatter=true  → spread across full canvas on first load.
         scatter=false → always born near centre, travels outward. */
      const maxD = Math.sqrt(cx * cx + cy * cy);
      this.dist  = scatter
        ? Math.random() * maxD * 0.9
        : Math.random() * maxD * 0.12;

      this.speed   = 0.08 + Math.random() * 0.22;  // base outward speed
      this.r       = 0.4  + Math.random() * 1.0;   // tiny — 0.4 to 1.4px
      this.isCross = Math.random() < 0.15;          // 15% are 4-point crosses

      /* Colour locked at birth — never changes */
      this.rgb = randRGB();

      /* Sine-wave twinkle parameters */
      this.phase       = Math.random() * Math.PI * 2;
      this.twinkleRate = 0.003 + Math.random() * 0.008;
      this.midAlpha    = 0.30 + Math.random() * 0.35;  // 0.30–0.65 — vivid but not harsh
      this.amplitude   = 0.08 + Math.random() * 0.12;  // gentle breathing range
    }

    update() {
      const maxD = Math.sqrt(cx * cx + cy * cy);
      /* Outward movement with gentle acceleration — reads as depth */
      this.dist += this.speed * (0.6 + this.dist / (maxD * 1.5));
      this.phase += this.twinkleRate;
      /* Recycle star back to centre when it exits the screen */
      if (this.dist > maxD * 1.1) this.birth(false);
    }

    draw() {
      /* Convert polar coords to screen x,y */
      const x = cx + Math.cos(this.angle) * this.dist;
      const y = cy + Math.sin(this.angle) * this.dist;

      /* Fade in near centre so stars don't pop into existence */
      const maxD   = Math.sqrt(cx * cx + cy * cy);
      const fadeIn = Math.min(1, this.dist / (maxD * 0.08));
      const alpha  = (this.midAlpha + Math.sin(this.phase) * this.amplitude) * fadeIn;
      const [r, g, b] = this.rgb;

      ctx.save();
      ctx.globalAlpha = Math.min(alpha, 0.78); // hard ceiling — never garish

      if (!this.isCross) {
        /* Crisp dot — no halo, no glow, clean sharp point of light */
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
     Graceful diagonal streak with a fading gradient tail.
     Fires every 3–7 seconds; up to 2 active simultaneously.   */
  class ShootingStar {
    constructor() { this.active = false; }

    fire() {
      if (this.active) return;
      this.x     = Math.random() * W * 0.8 + W * 0.05;
      this.y     = Math.random() * H * 0.3;
      const deg  = 15 + Math.random() * 35;   // gentle downward diagonal angle
      const spd  = 4   + Math.random() * 4;
      this.vx    = Math.cos(deg * Math.PI / 180) * spd;
      this.vy    = Math.sin(deg * Math.PI / 180) * spd;
      this.alpha = 0.5  + Math.random() * 0.2; // starts gently, not harsh
      this.tail  = 40   + Math.random() * 60;
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x    += this.vx;
      this.y    += this.vy;
      this.alpha -= 0.011;                      // slow graceful fade
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
      grad.addColorStop(0, `rgba(160,225,120,0)`);
      grad.addColorStop(1, `rgba(100,200,60,${this.alpha.toFixed(2)})`);
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
     Stars spread across full canvas on load so the field looks
     populated immediately rather than building from centre.    */
  const COUNT  = Math.min(160, Math.floor((W * H) / 6000));
  const stars  = Array.from({ length: COUNT }, () => new Star(true));

  /* Two shooting stars — can occasionally be active together */
  const meteors = [new ShootingStar(), new ShootingStar()];

  function scheduleMeteor() {
    setTimeout(() => {
      const idle = meteors.find(m => !m.active);
      if (idle) idle.fire();
      scheduleMeteor();
    }, 3000 + Math.random() * 4000); // fires every 3–7 seconds
  }
  scheduleMeteor();

  /* ── Animation loop ──────────────────────────────────────────*/
  let rafId;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }
    meteors.forEach(m => { m.update(); m.draw(); });
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
