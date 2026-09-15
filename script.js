document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Particle background ---------- */
  (function () {
    var canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var width, height;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DENSITY = 5000; // px^2 per particle for higher density
    var LINK_DIST = 160;
    var SPEED = 0.3;

    function getParticleColor() {
      var val = getComputedStyle(document.documentElement).getPropertyValue("--particle-color").trim();
      return val || "44, 95, 138";
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
      var count = Math.min(140, Math.round((width * window.innerHeight) / DENSITY));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED
        });
      }
    }

    function step() {
      var color = getParticleColor();
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + color + ", 0.75)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(" + color + ", " + (0.35 * (1 - dist / LINK_DIST)) + ")";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    step();
  })();

  /* ---------- Theme (light/dark) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}

  if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.setAttribute("data-theme", "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "dark");
      }
      try { localStorage.setItem("theme", isDark ? "light" : "dark"); } catch (e) {}
    });
  }

  /* ---------- Expandable experience rows ---------- */
  document.querySelectorAll(".entry.expandable").forEach(function (entry) {
    var button = entry.querySelector(".entry-row");
    var detail = entry.querySelector(".entry-detail");
    if (!button || !detail) return;

    button.addEventListener("click", function () {
      var isOpen = entry.getAttribute("data-open") === "true";
      if (isOpen) {
        entry.setAttribute("data-open", "false");
        button.setAttribute("aria-expanded", "false");
        detail.style.maxHeight = "0px";
      } else {
        entry.setAttribute("data-open", "true");
        button.setAttribute("aria-expanded", "true");
        detail.style.maxHeight = detail.scrollHeight + "px";
      }
    });
  });

  /* ---------- Dock active state on scroll ---------- */
  var dockButtons = document.querySelectorAll(".dock-btn[data-section]");
  var sections = [];
  dockButtons.forEach(function (btn) {
    var id = btn.getAttribute("data-section");
    var section = document.getElementById(id);
    if (section) sections.push({ id: id, el: section, btn: btn });
  });

  function setActiveDockButton() {
    var scrollPos = window.scrollY + 140;
    var currentId = sections.length ? sections[0].id : null;

    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollPos) currentId = s.id;
    });

    dockButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-section") === currentId);
    });
  }

  window.addEventListener("scroll", setActiveDockButton);
  setActiveDockButton();
});
