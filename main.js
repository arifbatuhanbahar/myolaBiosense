/**
 * Myola BioSense — site etkileşim katmanı
 * scroll-snap navigasyon, parçacık hero, sayaçlar, tilt, form
 */
(function () {
  "use strict";

  var root = document.getElementById("snap-root");
  var slides = root ? Array.prototype.slice.call(root.querySelectorAll(".slide")) : [];
  var dots = document.querySelectorAll(".dot-nav__btn");
  var canvas = document.getElementById("hero-canvas");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var progressFill = document.getElementById("progress-fill");
  var progressCount = document.getElementById("progress-count");
  var kbdHint = document.getElementById("kbd-hint");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollAnimId = null;

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function updateProgress(idx) {
    if (!slides.length) return;
    var total = slides.length;
    var pct = ((idx + 1) / total) * 100;
    if (progressFill) progressFill.style.width = pct + "%";
    if (progressCount) progressCount.textContent = pad2(idx + 1) + " / " + pad2(total);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /** Kontrollü yumuşak kaydırma — scroll-snap ile uyumlu */
  function scrollToSlide(id) {
    var el = document.getElementById(id);
    if (!el || !root) return;
    if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    var start = root.scrollTop;
    var rect = el.getBoundingClientRect();
    var rootRect = root.getBoundingClientRect();
    var target = start + (rect.top - rootRect.top);
    var dist = target - start;
    if (Math.abs(dist) < 2) return;
    var dur = reduceMotion ? 200 : Math.min(950, Math.max(520, Math.abs(dist) * 0.42));
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      root.scrollTop = start + dist * easeInOutCubic(p);
      if (p < 1) scrollAnimId = requestAnimationFrame(step);
      else scrollAnimId = null;
    }
    scrollAnimId = requestAnimationFrame(step);
  }

  function setActiveDot(activeId) {
    dots.forEach(function (btn) {
      var t = btn.getAttribute("data-target");
      var isActive = t === activeId;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function onScrollSnap() {
    if (!root || !slides.length) return;
    var mid = root.scrollTop + root.clientHeight * 0.4;
    var active = slides[0].id;
    var activeIdx = 0;
    slides.forEach(function (s, i) {
      if (s.offsetTop <= mid) {
        active = s.id;
        activeIdx = i;
      }
    });
    setActiveDot(active);
    updateProgress(activeIdx);
  }

  /* Klavye ipucu — ilk ziyarette göster, navigasyonda gizle */
  var kbdHintDismissed = false;
  function hideKbdHint() {
    if (kbdHintDismissed || !kbdHint) return;
    kbdHintDismissed = true;
    kbdHint.classList.remove("is-visible");
    kbdHint.classList.add("is-hidden");
  }
  if (kbdHint && !reduceMotion) {
    setTimeout(function () {
      if (!kbdHintDismissed) kbdHint.classList.add("is-visible");
    }, 900);
    setTimeout(hideKbdHint, 9000);
  }

  /* Dot nav + ankraj linkleri */
  dots.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-target");
      if (id) scrollToSlide(id);
      hideKbdHint();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (id && document.getElementById(id)) {
        e.preventDefault();
        scrollToSlide(id);
      }
    });
  });

  if (root) {
    root.addEventListener("scroll", function () {
      window.requestAnimationFrame(onScrollSnap);
    });
    onScrollSnap();
  }

  /* Klavye: ↑ ↓ Page navigasyonu */
  window.addEventListener("keydown", function (e) {
    if (!root || !slides.length) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    var keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
    if (keys.indexOf(e.key) === -1) return;

    var mid = root.scrollTop + root.clientHeight * 0.4;
    var idx = 0;
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].offsetTop <= mid) idx = i;
    }

    var nextIdx = idx;
    if (e.key === "ArrowDown" || e.key === "PageDown") nextIdx = Math.min(slides.length - 1, idx + 1);
    else if (e.key === "ArrowUp" || e.key === "PageUp") nextIdx = Math.max(0, idx - 1);
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = slides.length - 1;

    if (nextIdx !== idx) {
      e.preventDefault();
      scrollToSlide(slides[nextIdx].id);
      hideKbdHint();
    }
  });

  /* Slayt giriş animasyonu */
  if (!reduceMotion && root && slides.length && "IntersectionObserver" in window) {
    var slideIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-inview");
        });
      },
      { root: root, threshold: 0.35, rootMargin: "-6% 0px -6% 0px" }
    );
    slides.forEach(function (s) {
      slideIo.observe(s);
    });
    if (slides[0]) slides[0].classList.add("is-inview");
  } else if (slides.length) {
    slides.forEach(function (s) {
      s.classList.add("is-inview");
    });
  }

  /* Reveal ögeleri */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: root, threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* İstatistik sayaçları */
  function animateCounters() {
    var counters = document.querySelectorAll(".counter");
    counters.forEach(function (node) {
      var target = parseInt(node.getAttribute("data-target"), 10);
      if (isNaN(target)) return;
      var dur = 1400;
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var statsSlide = document.querySelector(".slide--stats");
  if (statsSlide && "IntersectionObserver" in window && !reduceMotion) {
    var once = false;
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !once) {
            once = true;
            animateCounters();
            sio.disconnect();
          }
        });
      },
      { root: root, threshold: 0.4 }
    );
    sio.observe(statsSlide);
  } else if (statsSlide) {
    animateCounters();
  }

  /* 3D tilt kartlar */
  if (!reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty("--mx", x + "%");
        card.style.setProperty("--my", y + "%");
        var rx = ((y - 50) / 50) * -5;
        var ry = ((x - 50) / 50) * 5;
        card.style.transform =
          "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateZ(0)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* Kahraman: parçacık + çizgi ağı */
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W = 0;
    var H = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var LINK_DIST = 140;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function initParticles() {
      particles = [];
      var n = Math.min(70, Math.max(28, Math.floor(W / 26)));
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          a: Math.random() * 0.4 + 0.25,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = W + 8;
        else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8;
        else if (p.y > H + 8) p.y = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 245, 212, " + p.a + ")";
        ctx.fill();
      }
      /* İnce bağlantı çizgileri */
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var pa = particles[a];
          var pb = particles[b];
          var dx = pa.x - pb.x;
          var dy = pa.y - pb.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            var alpha = (1 - d / LINK_DIST) * 0.18;
            ctx.strokeStyle = "rgba(139, 92, 246, " + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    var resizeTo = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTo);
      resizeTo = setTimeout(function () {
        resize();
        initParticles();
      }, 120);
    });
    requestAnimationFrame(tick);
  }

  /* İletişim formu — FormSubmit.co üzerinden gerçek e-posta gönderimi (AJAX) */
  if (form && formStatus) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var message = (fd.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        formStatus.textContent = "Lütfen ad, e-posta ve mesaj alanlarını doldurun.";
        formStatus.classList.remove("is-success");
        formStatus.classList.add("is-error");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Gönderiliyor…";
      }
      formStatus.classList.remove("is-success", "is-error");
      formStatus.textContent = "";

      var endpoint = "https://formsubmit.co/ajax/arifbatuhanbahar@gmail.com";
      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: "Myola BioSense — yeni iletişim mesajı",
          _template: "table",
          _captcha: "false"
        })
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (r) {
          if (r.ok) {
            formStatus.textContent =
              "Teşekkürler, " + name.split(" ")[0] + " — mesajınız iletildi.";
            formStatus.classList.add("is-success");
            form.reset();
          } else {
            formStatus.textContent =
              "Gönderim başarısız oldu. Lütfen doğrudan e-posta gönderin: arifbatuhanbahar@gmail.com";
            formStatus.classList.add("is-error");
          }
        })
        .catch(function () {
          formStatus.textContent =
            "Bağlantı hatası. Lütfen doğrudan e-posta gönderin: arifbatuhanbahar@gmail.com";
          formStatus.classList.add("is-error");
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }
})();
