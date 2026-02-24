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
     • ~160 drifting stars across three parallax speed layers
     • Shapes: soft glowing dot (most) + delicate 4-point cross
     • Twinkle = slow sine-wave breath (7–26s cycle) — no flicker
     • Colours set once at star birth, never changed mid-flight
     • Occasional shooting star every 5–12s (one at a time)
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
    pointerEvents: "none", zIndex: "0", display: "block",
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  if (getComputedStyle(document.body).position === "static") {
    document.body.style.position = "relative";
  }
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ── Palette ─────────────────────────────────────────────────
     Colour picked ONCE per star at birth. Never randomised again.
     This is the fix for the strobing in earlier versions.        */
  const PALETTE = [
    [66,  161, 26],   // #42a11a — signature green
    [78,  185, 30],   // lime
    [50,  130, 16],   // deep forest
    [110, 200, 72],   // spring
    [155, 218, 118],  // sage
    [200, 238, 175],  // pale mint
    [228, 250, 215],  // whisper
    [245, 255, 240],  // near-white
  ];
  function randRGB() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  /* ── Star ────────────────────────────────────────────────────
     opacity = midAlpha + sin(phase) × amplitude
     twinkleRate ~0.004–0.014 rad/frame → full cycle = 7–26s
     At 60fps: imperceptible as flicker, just feels alive.

     v3 tuning (vs v2):
       midAlpha  0.22–0.52  (was 0.09–0.33) — properly visible
       amplitude 0.08–0.18  (was 0.04–0.12) — gentle swell
       radius    0.5–1.8px  (was 0.25–1.3px) — slightly bigger
       count     ~160        (was ~105)        — richer field
  */
  class Star {
    constructor(startY) { this.birth(startY); }

    birth(startY) {
      this.x       = Math.random() * canvas.width;
      this.y       = (startY !== undefined) ? startY : -4;
      this.r       = 0.5 + Math.random() * 1.3;
      this.isCross = Math.random() < 0.15;

      const layer  = Math.floor(Math.random() * 3);
      const spds   = [0.05, 0.14, 0.28];
      this.vy      = spds[layer] * (0.75 + Math.random() * 0.5);
      this.vx      = (Math.random() - 0.5) * 0.03;

      this.rgb         = randRGB();
      this.phase       = Math.random() * Math.PI * 2;
      this.twinkleRate = 0.004 + Math.random() * 0.010;
      this.midAlpha    = 0.22 + Math.random() * 0.30;
      this.amplitude   = 0.08 + Math.random() * 0.10;
    }

    update() {
      this.y     += this.vy;
      this.x     += this.vx;
      this.phase += this.twinkleRate;
      if (this.y > canvas.height + 8 || this.x < -8 || this.x > canvas.width + 8) {
        this.birth();
      }
    }

    draw() {
      const alpha = this.midAlpha + Math.sin(this.phase) * this.amplitude;
      const [r, g, b] = this.rgb;

      ctx.save();
      ctx.globalAlpha = Math.min(alpha, 0.72); // hard ceiling — never garish

      if (!this.isCross) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();

        if (this.r > 0.7) {
          const halo = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
          halo.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
          halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
      } else {
        const arm = this.r * 2.2;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth   = Math.max(0.4, this.r * 0.5);
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(this.x - arm, this.y); ctx.lineTo(this.x + arm, this.y);
        ctx.moveTo(this.x, this.y - arm); ctx.lineTo(this.x, this.y + arm);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /* ── Shooting star ───────────────────────────────────────────
     One at a time, gentle fade over ~50 frames, fires every
     5–12 seconds.                                              */
  class ShootingStar {
    constructor() { this.active = false; }

    fire() {
      if (this.active) return;
      this.x     = Math.random() * canvas.width  * 0.65 + canvas.width * 0.05;
      this.y     = Math.random() * canvas.height * 0.28;
      const deg  = 15 + Math.random() * 35;
      const spd  = 3.5 + Math.random() * 3.5;
      this.vx    = Math.cos(deg * Math.PI / 180) * spd;
      this.vy    = Math.sin(deg * Math.PI / 180) * spd;
      this.alpha = 0.5 + Math.random() * 0.2;
      this.tail  = 40 + Math.random() * 60;
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x    += this.vx;
      this.y    += this.vy;
      this.alpha -= 0.011;
      if (this.alpha <= 0 || this.x > canvas.width + 80 || this.y > canvas.height + 80) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      const steps = this.tail / Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const tx = this.x - this.vx * steps;
      const ty = this.y - this.vy * steps;
      const grad = ctx.createLinearGradient(tx, ty, this.x, this.y);
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

  /* ── Init ────────────────────────────────────────────────── */
  const COUNT  = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 5500));
  const stars  = Array.from({ length: COUNT }, () => new Star(Math.random() * canvas.height));
  const meteor = new ShootingStar();

  function scheduleMeteor() {
    setTimeout(() => { meteor.fire(); scheduleMeteor(); }, 5000 + Math.random() * 7000);
  }
  scheduleMeteor();

  /* ── Loop ────────────────────────────────────────────────── */
  let rafId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stars.length; i++) { stars[i].update(); stars[i].draw(); }
    meteor.update(); meteor.draw();
    rafId = requestAnimationFrame(animate);
  }

  if (reducedMotion) {
    for (let i = 0; i < stars.length; i++) stars[i].draw();
  } else {
    animate();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else if (!reducedMotion) { animate(); }
  });

  /* ── END ghostai-sparkle.js ── */
})();
