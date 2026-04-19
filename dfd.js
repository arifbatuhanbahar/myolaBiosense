/**
 * Myola BioSense — Teknik DFD (Seviye 0 ve Seviye 1)
 *
 * Seviye 0: ESP32-S3 uç birimi ile dış varlıklar (hasta/sensör, aktüatör, mobil) arası bağlam.
 * Seviye 1: Uç birim içindeki süreçler — DAQ → Sinyal Filtresi & Füzyon → PID (z-uzayı)
 *            → PWM Sürücü → BLE Paketleme; D1 PID katsayıları, D2 seans tamponu.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var PRODUCT = "Myola BioSense";

  function el(name, attrs, children) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "textContent") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function addArrowMarkers(defs) {
    [
      { id: "dfd-arr-mint", fill: "#00f5d4" },
      { id: "dfd-arr-purple", fill: "#a78bfa" },
      { id: "dfd-arr-gold", fill: "#fbbf24" },
      { id: "dfd-arr-pink", fill: "#f472b6" },
    ].forEach(function (m) {
      var marker = el("marker", {
        id: m.id,
        markerWidth: "10",
        markerHeight: "10",
        refX: "9",
        refY: "5",
        orient: "auto",
        markerUnits: "userSpaceOnUse",
      });
      marker.appendChild(el("path", { d: "M0,1 L10,5 L0,9 Z", fill: m.fill }));
      defs.appendChild(marker);
    });
  }

  function roundedRect(x, y, w, h, r, fill, stroke, sw) {
    return el("rect", {
      x: x, y: y, width: w, height: h, rx: r, ry: r,
      fill: fill || "rgba(255,255,255,0.06)",
      stroke: stroke || "rgba(255,255,255,0.2)",
      "stroke-width": sw != null ? sw : 2,
    });
  }

  /* Dış varlık — kare kutu, 1 veya 2 satır */
  function entitySquare(x, y, w, h, line1, line2) {
    var g = el("g", { class: "dfd-entity" });
    g.appendChild(roundedRect(x, y, w, h, 8, "rgba(0,245,212,0.12)", "rgba(0,245,212,0.55)", 2));
    if (line2) {
      g.appendChild(el("text", {
        x: x + w / 2, y: y + h / 2 - 4,
        "text-anchor": "middle", fill: "#f0f1f5",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "15", "font-weight": "700",
        textContent: line1,
      }));
      g.appendChild(el("text", {
        x: x + w / 2, y: y + h / 2 + 16,
        "text-anchor": "middle", fill: "#b8bdd0",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "12", "font-weight": "500",
        textContent: line2,
      }));
    } else {
      g.appendChild(el("text", {
        x: x + w / 2, y: y + h / 2 + 5,
        "text-anchor": "middle", fill: "#f0f1f5",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "15", "font-weight": "700",
        textContent: line1,
      }));
    }
    return g;
  }

  /* Süreç — yuvarlak köşeli, ID + başlık */
  function processBubble(x, y, w, h, idStr, title) {
    var g = el("g", { class: "dfd-process" });
    g.appendChild(roundedRect(x, y, w, h, 22, "rgba(139,92,246,0.16)", "rgba(167,139,250,0.7)", 2));
    var sepY = y + 36;
    g.appendChild(el("line", {
      x1: x + 10, y1: sepY, x2: x + w - 10, y2: sepY,
      stroke: "rgba(167,139,250,0.55)", "stroke-width": 1.2,
    }));
    g.appendChild(el("text", {
      x: x + w / 2, y: y + 24,
      "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "16", "font-weight": "700",
      textContent: idStr,
    }));
    var lines = title.split("\n");
    var startY = sepY + 20;
    lines.forEach(function (line, i) {
      g.appendChild(el("text", {
        x: x + w / 2, y: startY + i * 16,
        "text-anchor": "middle", fill: "#e8e9ef",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "12.5", "font-weight": "600",
        textContent: line,
      }));
    });
    return g;
  }

  /* Büyük vurgulu süreç (Seviye 0 merkez) */
  function processBig(x, y, w, h, idStr, line1, line2) {
    var g = el("g", { class: "dfd-process dfd-process--big" });
    g.appendChild(roundedRect(x, y, w, h, 26, "rgba(139,92,246,0.18)", "rgba(167,139,250,0.85)", 2.4));
    g.appendChild(el("line", {
      x1: x + 20, y1: y + 56, x2: x + w - 20, y2: y + 56,
      stroke: "rgba(167,139,250,0.65)", "stroke-width": 1.5,
    }));
    g.appendChild(el("text", {
      x: x + w / 2, y: y + 38,
      "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "22", "font-weight": "700",
      textContent: idStr,
    }));
    g.appendChild(el("text", {
      x: x + w / 2, y: y + 86,
      "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "18", "font-weight": "700",
      textContent: line1,
    }));
    g.appendChild(el("text", {
      x: x + w / 2, y: y + 112,
      "text-anchor": "middle", fill: "#b8bdd0",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "13.5", "font-weight": "500",
      textContent: line2,
    }));
    /* ESP32-S3 etiketi — alt orta */
    g.appendChild(el("text", {
      x: x + w / 2, y: y + h - 16,
      "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "12", "font-weight": "700",
      "letter-spacing": "0.12em",
      textContent: "ESP32-S3 · EDGE DEVICE",
    }));
    return g;
  }

  /* Veri deposu */
  function dataStore(x, y, w, h, label) {
    var g = el("g", { class: "dfd-store" });
    g.appendChild(el("path", {
      d: "M " + x + " " + y + " L " + (x + w) + " " + y +
         " L " + (x + w) + " " + (y + h) + " L " + x + " " + (y + h) + " Z",
      fill: "rgba(251,191,36,0.12)",
      stroke: "rgba(251,191,36,0.65)",
      "stroke-width": 2,
    }));
    g.appendChild(el("line", {
      x1: x + 42, y1: y, x2: x + 42, y2: y + h,
      stroke: "rgba(251,191,36,0.75)", "stroke-width": 1.5,
    }));
    var lines = label.split("\n");
    g.appendChild(el("text", {
      x: x + 21, y: y + h / 2 + 5,
      "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "15", "font-weight": "700",
      textContent: lines[0],
    }));
    var rest = lines.slice(1);
    rest.forEach(function (line, i) {
      g.appendChild(el("text", {
        x: x + 42 + (w - 42) / 2, y: y + h / 2 + 5 - (rest.length - 1) * 8 + i * 16,
        "text-anchor": "middle", fill: "#e8e9ef",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "12", "font-weight": "600",
        textContent: line,
      }));
    });
    return g;
  }

  function flowPath(d, cls, markerId) {
    return el("path", {
      d: d,
      class: "dfd-flow " + (cls || "dfd-flow--mint"),
      "marker-end": markerId ? "url(#" + markerId + ")" : "none",
      "vector-effect": "non-scaling-stroke",
    });
  }

  function flowLabel(cx, cy, text, small, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    cx += dx; cy += dy;
    var fs = small ? 11 : 12;
    var padX = 10, padY = 6;
    var approxW = text.length * (small ? 6.0 : 6.8);
    var tw = Math.max(approxW + padX * 2, 68);
    var th = fs + padY * 2;
    var x = cx - tw / 2;
    var y = cy - th / 2;
    var g = el("g", { class: "dfd-label" });
    g.appendChild(el("rect", {
      x: x, y: y, width: tw, height: th, rx: 8,
      fill: "rgba(8,10,22,0.95)",
      stroke: "rgba(0,245,212,0.32)",
      "stroke-width": 1,
    }));
    g.appendChild(el("text", {
      x: cx, y: cy + fs * 0.36,
      "text-anchor": "middle", fill: "#eef0f7",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": fs, "font-weight": "600",
      textContent: text,
    }));
    return g;
  }

  function legendPanel(x, y) {
    var g = el("g", { class: "dfd-legend-svg" });
    g.appendChild(roundedRect(x, y, 230, 96, 10, "rgba(8,10,22,0.82)", "rgba(255,255,255,0.08)", 1));
    var items = [
      { color: "#00f5d4", label: "Dış varlık · biyo-sinyal akışı" },
      { color: "#a78bfa", label: "Süreç (ESP32-S3 görevi) · BLE" },
      { color: "#fbbf24", label: "Aktüatör kontrolü · veri deposu" },
    ];
    items.forEach(function (it, i) {
      var cy = y + 22 + i * 22;
      g.appendChild(el("circle", { cx: x + 18, cy: cy, r: 5, fill: it.color }));
      g.appendChild(el("text", {
        x: x + 32, y: cy + 4,
        fill: "#cbd0e2",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "11.5", "font-weight": "500",
        textContent: it.label,
      }));
    });
    return g;
  }

  /* ========================================================================
   * Seviye 0 — Bağlam diyagramı (uç birim merkezde)
   * Hasta (EMG/IMU/Laktat) ↔ ESP32-S3 ↔ Aktüatör (Solenoid/Motor) / Mobil
   * ====================================================================== */
  function renderLevel0(container) {
    var svg = el("svg", {
      viewBox: "0 0 1100 580",
      role: "img",
      "aria-label": "Seviye 0 bağlam diyagramı — " + PRODUCT + " uç birim mimarisi",
    });

    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* Yerleşim */
    var hst = { x: 30, y: 220, w: 200, h: 140 };
    var sys = { x: 320, y: 180, w: 460, h: 220 };
    var act = { x: 860, y: 90, w: 210, h: 110 };
    var mob = { x: 860, y: 380, w: 210, h: 110 };

    svg.appendChild(entitySquare(hst.x, hst.y, hst.w, hst.h, "Hasta", "(EMG · IMU · Laktat)"));
    svg.appendChild(processBig(sys.x, sys.y, sys.w, sys.h, "0.0", PRODUCT, "Uç Birim (Kapalı Çevrim)"));
    svg.appendChild(entitySquare(act.x, act.y, act.w, act.h, "Aktüatör", "(Latching Solenoid · Motor)"));
    svg.appendChild(entitySquare(mob.x, mob.y, mob.w, mob.h, "Mobil Uygulama", "(Klinisyen / AI Katmanı)"));

    var hstR = hst.x + hst.w;
    var sysL = sys.x;
    var sysR = sys.x + sys.w;
    var sysT = sys.y;
    var sysB = sys.y + sys.h;
    var actB = act.y + act.h;
    var mobT = mob.y;

    /* 1) Hasta → Uç Birim: biyo-sinyal (mint, yatay, yukarı şerit) */
    gFlow.appendChild(flowPath(
      "M " + hstR + " " + (hst.y + 40) + " L " + (sysL - 2) + " " + (hst.y + 40),
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((hstR + sysL) / 2, hst.y + 40, "EMG 1 kHz · IMU · Laktat", false, 0, -18));

    /* 2) Hasta ← Uç Birim: LED/uyarı geri besleme — alt şerit (opsiyonel, mint) */
    gFlow.appendChild(flowPath(
      "M " + (sysL - 2) + " " + (hst.y + 100) + " L " + hstR + " " + (hst.y + 100),
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((hstR + sysL) / 2, hst.y + 100, "Haptik / LED uyarı", false, 0, 18));

    /* 3) Uç Birim → Aktüatör: PWM komut (gold, eğri, sağ üst) */
    gFlow.appendChild(flowPath(
      "M " + (sysR - 60) + " " + sysT + " C " + (sysR + 30) + " " + (sysT - 60) +
      ", " + (act.x - 40) + " " + (actB + 30) + ", " + (act.x - 2) + " " + (actB - 30),
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(800, 148, "PWM · Yön komutu", true, 0, 0));

    /* 4) Aktüatör → Uç Birim: akım/konum geri besleme (gold, eğri) */
    gFlow.appendChild(flowPath(
      "M " + (act.x + 50) + " " + actB + " C " + (act.x + 20) + " " + (actB + 60) +
      ", " + (sysR + 30) + " " + (sysT - 20) + ", " + (sysR - 20) + " " + (sysT + 10),
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(860, 215, "Akım · Konum FB", true, 0, 0));

    /* 5) Uç Birim → Mobil: BLE biyoveri paketi (purple, eğri sağ alt) */
    gFlow.appendChild(flowPath(
      "M " + (sysR - 60) + " " + sysB + " C " + (sysR + 30) + " " + (sysB + 60) +
      ", " + (mob.x - 40) + " " + (mobT - 30) + ", " + (mob.x - 2) + " " + (mobT + 30),
      "dfd-flow--purple", "dfd-arr-purple"
    ));
    gLab.appendChild(flowLabel(800, 432, "BLE biyoveri paketi", true, 0, 0));

    /* 6) Mobil → Uç Birim: PID katsayı + kalibrasyon (purple, eğri) */
    gFlow.appendChild(flowPath(
      "M " + (mob.x + 50) + " " + mobT + " C " + (mob.x + 20) + " " + (mobT - 60) +
      ", " + (sysR + 30) + " " + (sysB + 20) + ", " + (sysR - 20) + " " + (sysB - 10),
      "dfd-flow--purple", "dfd-arr-purple"
    ));
    gLab.appendChild(flowLabel(860, 365, "PID · Kalibrasyon", true, 0, 0));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);
    svg.appendChild(legendPanel(30, 30));

    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ========================================================================
   * Seviye 1 — Uç birim içindeki süreç ayrıntısı
   * DAQ → Filtre & Füzyon → PID (z-uzayı) → PWM Sürücü; BLE paketleme döngüsü
   * ====================================================================== */
  function renderLevel1(container) {
    var svg = el("svg", {
      viewBox: "0 0 1280 680",
      role: "img",
      "aria-label": "Seviye 1 detaylı DFD — " + PRODUCT + " uç birim iç akışı",
    });

    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* Dış varlıklar */
    var HST = { x: 20, y: 110, w: 140, h: 120 };
    var SOL = { x: 1120, y: 100, w: 140, h: 100 };
    var MOB = { x: 1120, y: 460, w: 140, h: 110 };

    svg.appendChild(entitySquare(HST.x, HST.y, HST.w, HST.h, "Hasta", "(sensörler)"));
    svg.appendChild(entitySquare(SOL.x, SOL.y, SOL.w, SOL.h, "Solenoid", "/ Motor"));
    svg.appendChild(entitySquare(MOB.x, MOB.y, MOB.w, MOB.h, "Mobil", "Uygulama"));

    /* Süreçler — üst omurga (DAQ → Filtre → PID → PWM) */
    var P1 = { x: 190, y: 120, w: 160, h: 100 };
    var P2 = { x: 380, y: 120, w: 160, h: 100 };
    var P3 = { x: 570, y: 120, w: 160, h: 100 };
    var P4 = { x: 760, y: 120, w: 160, h: 100 };

    svg.appendChild(processBubble(P1.x, P1.y, P1.w, P1.h, "1.0", "Sensör DAQ\n(ADC · çok-oran)"));
    svg.appendChild(processBubble(P2.x, P2.y, P2.w, P2.h, "2.0", "Dijital Filtre\n& IMU Füzyonu"));
    svg.appendChild(processBubble(P3.x, P3.y, P3.w, P3.h, "3.0", "PID Kapalı\nÇevrim (z-uzayı)"));
    svg.appendChild(processBubble(P4.x, P4.y, P4.w, P4.h, "4.0", "PWM Sürücü\n& Enerji Yön."));

    /* Veri depoları — ortada */
    var D2 = { x: 380, y: 300, w: 160, h: 80 };
    var D1 = { x: 570, y: 300, w: 160, h: 80 };
    svg.appendChild(dataStore(D2.x, D2.y, D2.w, D2.h, "D2\nSeans tamponu"));
    svg.appendChild(dataStore(D1.x, D1.y, D1.w, D1.h, "D1\nPID katsayı"));

    /* Alt süreç — BLE */
    var P5 = { x: 475, y: 450, w: 170, h: 110 };
    svg.appendChild(processBubble(P5.x, P5.y, P5.w, P5.h, "5.0", "BLE Paketleme\n& İletim"));

    /* Yardımcı merkezler */
    var p1cx = P1.x + P1.w / 2;
    var p2cx = P2.x + P2.w / 2;
    var p3cx = P3.x + P3.w / 2;
    var p4cx = P4.x + P4.w / 2;
    var p5cx = P5.x + P5.w / 2;
    var d1cx = D1.x + D1.w / 2;
    var d2cx = D2.x + D2.w / 2;
    var rowY = 170;

    /* 1) Hasta → P1: ham biyo-sinyal */
    gFlow.appendChild(flowPath(
      "M " + (HST.x + HST.w) + " " + rowY + " L " + P1.x + " " + rowY,
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((HST.x + HST.w + P1.x) / 2, rowY, "EMG/IMU/Laktat (ham)", true, 0, -18));

    /* 2) P1 → P2: örnek çerçeveleri */
    gFlow.appendChild(flowPath(
      "M " + (P1.x + P1.w) + " " + rowY + " L " + P2.x + " " + rowY,
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((P1.x + P1.w + P2.x) / 2, rowY, "Örnek çerçeveleri", true, 0, -18));

    /* 3) P2 → P3: filtrelenmiş öznitelikler */
    gFlow.appendChild(flowPath(
      "M " + (P2.x + P2.w) + " " + rowY + " L " + P3.x + " " + rowY,
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((P2.x + P2.w + P3.x) / 2, rowY, "Açı · EMG zarfı", true, 0, -18));

    /* 4) P3 → P4: PID çıkışı → PWM */
    gFlow.appendChild(flowPath(
      "M " + (P3.x + P3.w) + " " + rowY + " L " + P4.x + " " + rowY,
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel((P3.x + P3.w + P4.x) / 2, rowY, "u[k] · PWM duty", true, 0, -18));

    /* 5) P4 → Solenoid: sürme sinyali */
    gFlow.appendChild(flowPath(
      "M " + (P4.x + P4.w) + " " + rowY + " L " + SOL.x + " " + (SOL.y + 50),
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel((P4.x + P4.w + SOL.x) / 2, (rowY + SOL.y + 50) / 2, "Sürme sinyali", true, 0, -16));

    /* 6) Solenoid → P3: akım/konum geri besleme (eğri, üstten dönüş) */
    gFlow.appendChild(flowPath(
      "M " + (SOL.x + 30) + " " + (SOL.y + SOL.h) +
      " C " + (SOL.x + 30) + " " + (SOL.y + SOL.h + 60) +
      ", " + (p3cx + 30) + " " + 60 +
      ", " + p3cx + " " + P3.y,
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(970, 60, "Akım · konum FB", true, 0, 0));

    /* 7) P2 → D2: seans örnekleri (dikey aşağı) */
    gFlow.appendChild(flowPath(
      "M " + p2cx + " " + (P2.y + P2.h) + " L " + p2cx + " " + D2.y,
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel(p2cx, 260, "Seans örnekleri", true, 60, 0));

    /* 8) D1 → P3: PID katsayıları (dikey yukarı) */
    gFlow.appendChild(flowPath(
      "M " + d1cx + " " + D1.y + " L " + d1cx + " " + (P3.y + P3.h),
      "dfd-flow--purple", "dfd-arr-purple"
    ));
    gLab.appendChild(flowLabel(d1cx, 260, "K_p · K_i · K_d", true, 52, 0));

    /* 9) D2 → P5: buffer'dan veri (dikey aşağı) */
    gFlow.appendChild(flowPath(
      "M " + d2cx + " " + (D2.y + D2.h) +
      " L " + d2cx + " 420 L " + p5cx + " 420 L " + p5cx + " " + P5.y,
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel((d2cx + p5cx) / 2, 420, "Tampon verisi", true, 0, -16));

    /* 10) P5 → Mobil: periyodik BLE paketi (eğri, sağa) */
    gFlow.appendChild(flowPath(
      "M " + (P5.x + P5.w) + " " + (P5.y + 50) +
      " C 820 " + (P5.y + 50) +
      ", 1000 " + (MOB.y + 40) +
      ", " + MOB.x + " " + (MOB.y + 40),
      "dfd-flow--purple", "dfd-arr-purple"
    ));
    gLab.appendChild(flowLabel(870, 470, "BLE paket (periyodik)", true, 0, -16));

    /* 11) Mobil → D1: yeni PID & kalibrasyon (eğri, sol yukarı) */
    gFlow.appendChild(flowPath(
      "M " + MOB.x + " " + (MOB.y + 75) +
      " C 960 " + (MOB.y + 75) +
      ", 820 400" +
      ", " + (D1.x + D1.w) + " 360",
      "dfd-flow--purple", "dfd-arr-purple"
    ));
    gLab.appendChild(flowLabel(920, 420, "PID güncelleme", true, 0, 16));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);
    svg.appendChild(legendPanel(30, 560));

    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ========================================================================
   * Donanım Blok Şeması — ESP32-S3 + sensör/aktüatör/güç topolojisi
   * ====================================================================== */
  function renderHardwareBlock(container) {
    var svg = el("svg", {
      viewBox: "0 0 1280 620",
      role: "img",
      "aria-label": "Donanım blok şeması — " + PRODUCT,
    });
    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* Güç hattı (üstte) */
    svg.appendChild(roundedRect(60, 40, 240, 70, 12,
      "rgba(251,191,36,0.12)", "rgba(251,191,36,0.6)", 2));
    svg.appendChild(el("text", {
      x: 180, y: 70, "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "15", "font-weight": "700",
      textContent: "Li-Po Batarya · 3.7 V",
    }));
    svg.appendChild(el("text", {
      x: 180, y: 92, "text-anchor": "middle", fill: "#cbd0e2",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "500",
      textContent: "Koruma + Şarj yönetimi",
    }));

    svg.appendChild(roundedRect(360, 40, 220, 70, 12,
      "rgba(251,191,36,0.12)", "rgba(251,191,36,0.6)", 2));
    svg.appendChild(el("text", {
      x: 470, y: 70, "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "15", "font-weight": "700",
      textContent: "DC-DC / LDO · 3.3 V",
    }));
    svg.appendChild(el("text", {
      x: 470, y: 92, "text-anchor": "middle", fill: "#cbd0e2",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "500",
      textContent: "MCU + sensör besleme",
    }));

    gFlow.appendChild(flowPath(
      "M 300 75 L 360 75", "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(330, 58, "Vin", true, 0, 0));

    /* Merkez — ESP32-S3 */
    var MCU = { x: 430, y: 200, w: 420, h: 220 };
    svg.appendChild(roundedRect(MCU.x, MCU.y, MCU.w, MCU.h, 22,
      "rgba(139,92,246,0.18)", "rgba(167,139,250,0.9)", 2.4));
    /* Üst etiket + alt blokları */
    svg.appendChild(el("text", {
      x: MCU.x + MCU.w / 2, y: MCU.y + 32,
      "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "22", "font-weight": "700",
      textContent: "ESP32-S3",
    }));
    svg.appendChild(el("text", {
      x: MCU.x + MCU.w / 2, y: MCU.y + 54,
      "text-anchor": "middle", fill: "#cbd0e2",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12.5", "font-weight": "600",
      "letter-spacing": "0.06em",
      textContent: "Xtensa LX7 · 240 MHz · FreeRTOS",
    }));
    /* Core 0 */
    svg.appendChild(roundedRect(MCU.x + 24, MCU.y + 80, 180, 80, 14,
      "rgba(0,245,212,0.08)", "rgba(0,245,212,0.55)", 1.5));
    svg.appendChild(el("text", {
      x: MCU.x + 114, y: MCU.y + 108,
      "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "Core 0",
    }));
    svg.appendChild(el("text", {
      x: MCU.x + 114, y: MCU.y + 130,
      "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "500",
      textContent: "BLE 5.0 Stack",
    }));
    svg.appendChild(el("text", {
      x: MCU.x + 114, y: MCU.y + 148,
      "text-anchor": "middle", fill: "#b8bdd0",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Paketleme · İletim",
    }));
    /* Core 1 */
    svg.appendChild(roundedRect(MCU.x + 216, MCU.y + 80, 180, 80, 14,
      "rgba(251,191,36,0.08)", "rgba(251,191,36,0.55)", 1.5));
    svg.appendChild(el("text", {
      x: MCU.x + 306, y: MCU.y + 108,
      "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "Core 1",
    }));
    svg.appendChild(el("text", {
      x: MCU.x + 306, y: MCU.y + 130,
      "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "500",
      textContent: "PID · IRQ · Timer",
    }));
    svg.appendChild(el("text", {
      x: MCU.x + 306, y: MCU.y + 148,
      "text-anchor": "middle", fill: "#b8bdd0",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Gerçek zamanlı",
    }));
    /* Çevre birim etiketleri */
    svg.appendChild(el("text", {
      x: MCU.x + MCU.w / 2, y: MCU.y + MCU.h - 18,
      "text-anchor": "middle", fill: "#cbd0e2",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      "letter-spacing": "0.14em",
      textContent: "ADC · I²C · SPI · PWM · GPIO · BLE RF",
    }));

    /* Sol sütun — sensörler */
    function sensorBox(x, y, col, title, sub) {
      var g = el("g", {});
      g.appendChild(roundedRect(x, y, 180, 60, 12,
        "rgba(0,245,212,0.1)", "rgba(0,245,212,0.55)", 1.8));
      g.appendChild(el("text", {
        x: x + 16, y: y + 28, fill: "#f0f1f5",
        "font-family": "'Space Grotesk', system-ui, sans-serif",
        "font-size": "14", "font-weight": "700",
        textContent: title,
      }));
      g.appendChild(el("text", {
        x: x + 16, y: y + 46, fill: "#9aa0b4",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": "11.5", "font-weight": "500",
        textContent: sub,
      }));
      return g;
    }
    svg.appendChild(sensorBox(60, 180, 0, "EMG AFE", "ADS1293 · 1 kHz"));
    svg.appendChild(sensorBox(60, 260, 0, "IMU 6-DOF", "MPU-6500 · I²C"));
    svg.appendChild(sensorBox(60, 340, 0, "Laktat", "Biyokimyasal · ADC"));

    /* Ön-yükselteç + ADC arası oklar */
    gFlow.appendChild(flowPath("M 240 210 L 430 240", "dfd-flow--mint", "dfd-arr-mint"));
    gFlow.appendChild(flowPath("M 240 290 L 430 290", "dfd-flow--mint", "dfd-arr-mint"));
    gFlow.appendChild(flowPath("M 240 370 L 430 340", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(335, 195, "Analog EMG", true, 0, 0));
    gLab.appendChild(flowLabel(335, 290, "I²C (100 kHz)", true, 0, -14));
    gLab.appendChild(flowLabel(335, 380, "mV (ADC)", true, 0, 14));

    /* Sağ sütun — aktüatör */
    svg.appendChild(roundedRect(960, 180, 240, 80, 14,
      "rgba(251,191,36,0.12)", "rgba(251,191,36,0.65)", 1.8));
    svg.appendChild(el("text", {
      x: 1080, y: 210, "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "H-Köprü Motor Sürücü",
    }));
    svg.appendChild(el("text", {
      x: 1080, y: 232, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "DRV8833 · PWM girişi",
    }));
    svg.appendChild(el("text", {
      x: 1080, y: 248, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      textContent: "Akım shunt · konum FB",
    }));

    svg.appendChild(roundedRect(960, 290, 240, 80, 14,
      "rgba(0,245,212,0.1)", "rgba(0,245,212,0.55)", 1.8));
    svg.appendChild(el("text", {
      x: 1080, y: 320, "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "Latching Solenoid",
    }));
    svg.appendChild(el("text", {
      x: 1080, y: 342, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Çift stabil · darbe ile tetik",
    }));
    svg.appendChild(el("text", {
      x: 1080, y: 358, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      textContent: "Bekleme ≈ 0 mW",
    }));

    gFlow.appendChild(flowPath("M 850 250 L 960 220", "dfd-flow--gold", "dfd-arr-gold"));
    gLab.appendChild(flowLabel(905, 208, "PWM + yön", true, 0, -12));
    gFlow.appendChild(flowPath("M 960 250 L 850 280", "dfd-flow--gold", "dfd-arr-gold"));
    gLab.appendChild(flowLabel(905, 278, "Akım/konum FB", true, 0, 14));

    gFlow.appendChild(flowPath("M 1080 260 L 1080 290", "dfd-flow--gold", "dfd-arr-gold"));

    /* Alt sol — BLE antenna + Mobile */
    svg.appendChild(roundedRect(360, 510, 240, 80, 14,
      "rgba(139,92,246,0.14)", "rgba(167,139,250,0.7)", 1.8));
    svg.appendChild(el("text", {
      x: 480, y: 540, "text-anchor": "middle", fill: "#a78bfa",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "BLE 5.0 Anteni",
    }));
    svg.appendChild(el("text", {
      x: 480, y: 562, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Periyodik paket iletimi",
    }));
    svg.appendChild(roundedRect(700, 510, 200, 80, 14,
      "rgba(0,245,212,0.12)", "rgba(0,245,212,0.55)", 2));
    svg.appendChild(el("text", {
      x: 800, y: 540, "text-anchor": "middle", fill: "#f0f1f5",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "Mobil Uygulama",
    }));
    svg.appendChild(el("text", {
      x: 800, y: 562, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "AI · klinisyen arayüzü",
    }));

    gFlow.appendChild(flowPath("M 540 420 L 480 510", "dfd-flow--purple", "dfd-arr-purple"));
    gLab.appendChild(flowLabel(495, 460, "UART / RF", true, 0, 0));

    gFlow.appendChild(flowPath("M 600 540 L 700 540", "dfd-flow--purple", "dfd-arr-purple"));
    gLab.appendChild(flowLabel(650, 540, "BLE link", true, 0, -16));
    gFlow.appendChild(flowPath("M 700 560 L 600 560", "dfd-flow--purple", "dfd-arr-purple"));
    gLab.appendChild(flowLabel(650, 560, "Komut / config", true, 0, 16));

    /* Güç dağıtım hattı (DC-DC → MCU + sensörler + sürücü) */
    gFlow.appendChild(flowPath(
      "M 470 110 L 470 150 L 640 150 L 640 200",
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(555, 140, "3.3 V (MCU)", true, 0, -14));

    gFlow.appendChild(flowPath(
      "M 470 110 L 470 160 L 150 160 L 150 180",
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(300, 160, "3.3 V (sensör)", true, 0, -14));

    gFlow.appendChild(flowPath(
      "M 300 75 L 300 38 L 1080 38 L 1080 180",
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(690, 38, "Vbat (sürücü)", true, 0, 16));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ========================================================================
   * PID Kapalı Çevrim Blok Diyagramı
   * ====================================================================== */
  function renderPIDBlock(container) {
    var svg = el("svg", {
      viewBox: "0 0 920 360",
      role: "img",
      "aria-label": "PID kapalı çevrim blok diyagramı",
    });
    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* Hedef giriş */
    svg.appendChild(roundedRect(20, 120, 140, 60, 10,
      "rgba(0,245,212,0.1)", "rgba(0,245,212,0.55)", 1.8));
    svg.appendChild(el("text", {
      x: 90, y: 148, "text-anchor": "middle", fill: "#f0f1f5",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "Hedef açı",
    }));
    svg.appendChild(el("text", {
      x: 90, y: 166, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "JetBrains Mono, monospace",
      "font-size": "12", "font-weight": "600",
      textContent: "θ*[k]",
    }));

    /* Toplayıcı */
    svg.appendChild(el("circle", {
      cx: 230, cy: 150, r: 26,
      fill: "rgba(8,10,22,0.9)",
      stroke: "rgba(0,245,212,0.6)",
      "stroke-width": 2,
    }));
    svg.appendChild(el("text", {
      x: 230, y: 157, "text-anchor": "middle", fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "22", "font-weight": "700",
      textContent: "Σ",
    }));
    svg.appendChild(el("text", {
      x: 216, y: 140, fill: "#eef0f7",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "600",
      textContent: "+",
    }));
    svg.appendChild(el("text", {
      x: 246, y: 175, fill: "#eef0f7",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "600",
      textContent: "−",
    }));

    /* PID bloğu */
    svg.appendChild(roundedRect(310, 100, 210, 100, 14,
      "rgba(139,92,246,0.16)", "rgba(167,139,250,0.75)", 2));
    svg.appendChild(el("text", {
      x: 415, y: 130, "text-anchor": "middle", fill: "#a78bfa",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "13", "font-weight": "700",
      "letter-spacing": "0.08em",
      textContent: "PID (z-UZAYI)",
    }));
    svg.appendChild(el("text", {
      x: 415, y: 158, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "JetBrains Mono, monospace",
      "font-size": "13", "font-weight": "600",
      textContent: "K_p + K_i·Σ + K_d·Δ",
    }));
    svg.appendChild(el("text", {
      x: 415, y: 180, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Anti-windup + saturasyon",
    }));

    /* Plant (aktüatör) */
    svg.appendChild(roundedRect(610, 100, 210, 100, 14,
      "rgba(251,191,36,0.12)", "rgba(251,191,36,0.65)", 2));
    svg.appendChild(el("text", {
      x: 715, y: 130, "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "13", "font-weight": "700",
      "letter-spacing": "0.08em",
      textContent: "PLANT",
    }));
    svg.appendChild(el("text", {
      x: 715, y: 156, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "13", "font-weight": "600",
      textContent: "PWM · Solenoid · Kol",
    }));
    svg.appendChild(el("text", {
      x: 715, y: 178, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Fiziksel sistem",
    }));

    /* Sensör (IMU) */
    svg.appendChild(roundedRect(420, 270, 190, 60, 10,
      "rgba(0,245,212,0.1)", "rgba(0,245,212,0.55)", 1.8));
    svg.appendChild(el("text", {
      x: 515, y: 298, "text-anchor": "middle", fill: "#f0f1f5",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "IMU · Açı kestirimi",
    }));
    svg.appendChild(el("text", {
      x: 515, y: 316, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "JetBrains Mono, monospace",
      "font-size": "12", "font-weight": "600",
      textContent: "θ[k]",
    }));

    /* Bağlantılar */
    gFlow.appendChild(flowPath("M 160 150 L 204 150", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(180, 136, "θ*", true, 0, -6));

    gFlow.appendChild(flowPath("M 256 150 L 310 150", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(283, 136, "e[k]", true, 0, -8));

    gFlow.appendChild(flowPath("M 520 150 L 610 150", "dfd-flow--gold", "dfd-arr-gold"));
    gLab.appendChild(flowLabel(565, 136, "u[k] (PWM)", true, 0, -8));

    gFlow.appendChild(flowPath("M 820 150 L 870 150 L 870 300 L 610 300", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(870, 230, "ölçüm", true, -32, 0));

    gFlow.appendChild(flowPath("M 420 300 L 230 300 L 230 176", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(320, 286, "geri besleme θ[k]", true, 0, -14));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ========================================================================
   * Sinyal İşleme Boru Hattı — EMG & IMU DSP
   * ====================================================================== */
  function renderSignalPipeline(container) {
    var svg = el("svg", {
      viewBox: "0 0 1280 540",
      role: "img",
      "aria-label": "EMG ve IMU sinyal işleme boru hattı",
    });
    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* Helper: pipeline stage box */
    function stage(x, y, title, param, color) {
      var g = el("g", {});
      var rgba = "rgba(" + color + ",0.12)";
      var stroke = "rgba(" + color + ",0.6)";
      g.appendChild(roundedRect(x, y, 160, 74, 12, rgba, stroke, 1.8));
      g.appendChild(el("text", {
        x: x + 80, y: y + 28, "text-anchor": "middle", fill: "#f0f1f5",
        "font-family": "'Space Grotesk', system-ui, sans-serif",
        "font-size": "13.5", "font-weight": "700",
        textContent: title,
      }));
      if (param) {
        g.appendChild(el("text", {
          x: x + 80, y: y + 50, "text-anchor": "middle", fill: "rgba(" + color + ",1)",
          "font-family": "JetBrains Mono, monospace",
          "font-size": "11.5", "font-weight": "600",
          textContent: param,
        }));
      }
      return g;
    }

    /* EMG pipeline satırı (üst) */
    svg.appendChild(el("text", {
      x: 40, y: 80, fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "13", "font-weight": "700",
      "letter-spacing": "0.14em",
      textContent: "EMG",
    }));
    svg.appendChild(el("text", {
      x: 40, y: 100, fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      textContent: "Kas aktivasyonu",
    }));

    var EMG_Y = 110;
    var emgStages = [
      { t: "Ham EMG",           p: "1 kHz · ADC",         c: "0,245,212" },
      { t: "HPF + Notch",       p: "20 Hz · 50 Hz",       c: "0,245,212" },
      { t: "Tam dalga doğrultucu", p: "|x[k]|",           c: "0,245,212" },
      { t: "LPF 5 Hz",          p: "Zarf yumuşatma",      c: "0,245,212" },
      { t: "EMG zarfı",         p: "Yorgunluk belirteci", c: "251,191,36" },
    ];
    var X0 = 110;
    var GAP = 22;
    var W = 170;
    emgStages.forEach(function (s, i) {
      var x = X0 + i * (W + GAP);
      svg.appendChild(stage(x, EMG_Y, s.t, s.p, s.c));
      if (i > 0) {
        var ax = X0 + (i - 1) * (W + GAP) + W;
        gFlow.appendChild(flowPath("M " + ax + " " + (EMG_Y + 37) + " L " + x + " " + (EMG_Y + 37), "dfd-flow--mint", "dfd-arr-mint"));
      }
    });

    /* IMU pipeline satırı (alt) */
    svg.appendChild(el("text", {
      x: 40, y: 290, fill: "#a78bfa",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "13", "font-weight": "700",
      "letter-spacing": "0.14em",
      textContent: "IMU",
    }));
    svg.appendChild(el("text", {
      x: 40, y: 310, fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      textContent: "Eklem açısı",
    }));

    var IMU_Y = 320;
    var imuStages = [
      { t: "Accel / Gyro",       p: "200 Hz · I²C",       c: "167,139,250" },
      { t: "Bias kalibrasyon",   p: "Statik offset",      c: "167,139,250" },
      { t: "Madgwick füzyon",    p: "Quaternion · 6-DOF", c: "167,139,250" },
      { t: "Euler projeksiyonu", p: "q → θ",              c: "167,139,250" },
      { t: "Açı kestirimi θ[k]", p: "PID geri besleme",   c: "251,191,36" },
    ];
    imuStages.forEach(function (s, i) {
      var x = X0 + i * (W + GAP);
      svg.appendChild(stage(x, IMU_Y, s.t, s.p, s.c));
      if (i > 0) {
        var ax = X0 + (i - 1) * (W + GAP) + W;
        gFlow.appendChild(flowPath("M " + ax + " " + (IMU_Y + 37) + " L " + x + " " + (IMU_Y + 37), "dfd-flow--purple", "dfd-arr-purple"));
      }
    });

    /* Çıkış toplayıcı — PID'ye girer */
    var lastEmgX = X0 + (emgStages.length - 1) * (W + GAP) + W;
    var lastImuX = X0 + (imuStages.length - 1) * (W + GAP) + W;
    var OUT_X = Math.max(lastEmgX, lastImuX) + 40;
    var OUT_Y = 230;

    svg.appendChild(roundedRect(OUT_X - 10, OUT_Y - 10, 150, 80, 14,
      "rgba(251,191,36,0.15)", "rgba(251,191,36,0.7)", 2));
    svg.appendChild(el("text", {
      x: OUT_X + 65, y: OUT_Y + 18, "text-anchor": "middle", fill: "#fbbf24",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "14", "font-weight": "700",
      textContent: "PID girişi",
    }));
    svg.appendChild(el("text", {
      x: OUT_X + 65, y: OUT_Y + 40, "text-anchor": "middle", fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11.5", "font-weight": "500",
      textContent: "Core 1 · PID görevi",
    }));
    svg.appendChild(el("text", {
      x: OUT_X + 65, y: OUT_Y + 56, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "JetBrains Mono, monospace",
      "font-size": "11", "font-weight": "600",
      textContent: "f = 200 Hz",
    }));

    gFlow.appendChild(flowPath(
      "M " + lastEmgX + " " + (EMG_Y + 37) + " L " + (OUT_X - 10) + " " + (OUT_Y + 15),
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(lastEmgX + 20, EMG_Y + 37, "zarf[k]", true, 0, -16));

    gFlow.appendChild(flowPath(
      "M " + lastImuX + " " + (IMU_Y + 37) + " L " + (OUT_X - 10) + " " + (OUT_Y + 55),
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(lastImuX + 20, IMU_Y + 37, "θ[k]", true, 0, 16));

    /* Arka plan band ipuçları */
    svg.appendChild(el("rect", {
      x: 20, y: 72, width: 1240, height: 130, rx: 12,
      fill: "rgba(0,245,212,0.035)",
      stroke: "rgba(0,245,212,0.15)",
      "stroke-width": 1, "stroke-dasharray": "4 6",
    }));
    svg.appendChild(el("rect", {
      x: 20, y: 282, width: 1240, height: 130, rx: 12,
      fill: "rgba(139,92,246,0.03)",
      stroke: "rgba(139,92,246,0.15)",
      "stroke-width": 1, "stroke-dasharray": "4 6",
    }));

    /* Alt not */
    svg.appendChild(el("text", {
      x: 640, y: 490, "text-anchor": "middle", fill: "#9aa0b4",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "12", "font-weight": "500",
      "font-style": "italic",
      textContent: "Tüm hat ESP32-S3 Core 1 üzerinde donanım kesmesi tetikli FreeRTOS görevi olarak çalışır.",
    }));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ========================================================================
   * Firmware Durum Makinesi (State Machine)
   * ====================================================================== */
  function renderStateMachine(container) {
    var svg = el("svg", {
      viewBox: "0 0 1200 560",
      role: "img",
      "aria-label": "Firmware durum makinesi",
    });
    var defs = el("defs", {});
    addArrowMarkers(defs);
    svg.appendChild(defs);

    var gFlow = el("g", { class: "dfd-layer-flows" });
    var gLab = el("g", { class: "dfd-layer-labels" });

    /* State bubble: ellipse with label + subtitle */
    function stateBubble(cx, cy, label, sub, color, rx, ry) {
      rx = rx || 95; ry = ry || 55;
      var g = el("g", { class: "dfd-process" });
      g.appendChild(el("ellipse", {
        cx: cx, cy: cy, rx: rx, ry: ry,
        fill: "rgba(" + color + ",0.14)",
        stroke: "rgba(" + color + ",0.75)",
        "stroke-width": 2.2,
      }));
      g.appendChild(el("text", {
        x: cx, y: cy - 4, "text-anchor": "middle", fill: "rgba(" + color + ",1)",
        "font-family": "'Space Grotesk', system-ui, sans-serif",
        "font-size": "16", "font-weight": "700",
        "letter-spacing": "0.08em",
        textContent: label,
      }));
      if (sub) {
        g.appendChild(el("text", {
          x: cx, y: cy + 16, "text-anchor": "middle", fill: "#cbd0e2",
          "font-family": "Inter, system-ui, sans-serif",
          "font-size": "11.5", "font-weight": "500",
          textContent: sub,
        }));
      }
      return g;
    }

    /* Başlangıç oku (entry arrow) */
    gFlow.appendChild(flowPath("M 60 150 L 155 150", "dfd-flow--mint", "dfd-arr-mint"));
    svg.appendChild(el("circle", {
      cx: 60, cy: 150, r: 7, fill: "#00f5d4",
    }));
    gLab.appendChild(flowLabel(90, 150, "Boot", true, 0, -18));

    /* 5 state yerleşimi */
    /*        IDLE (sol)          CALIB  (sağ üst)
     *                   ACTIVE (orta)
     *        FAULT (sol alt)      TELEMETRY (sağ alt)
     */
    svg.appendChild(stateBubble(250, 150, "IDLE", "deep-sleep · RTC", "0,245,212"));
    svg.appendChild(stateBubble(950, 150, "CALIB", "offset + PID cat.", "139,92,246"));
    svg.appendChild(stateBubble(600, 300, "ACTIVE", "PID kontrol döngüsü", "251,191,36", 115, 60));
    svg.appendChild(stateBubble(950, 450, "TELEMETRY", "BLE paketi gönder", "139,92,246"));
    svg.appendChild(stateBubble(250, 450, "FAULT", "aşırı akım / watchdog", "244,114,182"));

    /* IDLE → CALIB (üst, sağa ok) */
    gFlow.appendChild(flowPath("M 345 150 L 855 150", "dfd-flow--mint", "dfd-arr-mint"));
    gLab.appendChild(flowLabel(600, 150, "user_start / timer_wake", true, 0, -18));

    /* CALIB → ACTIVE (aşağı + sola) */
    gFlow.appendChild(flowPath("M 900 205 C 860 260, 760 290, 715 300", "dfd-flow--purple", "dfd-arr-purple"));
    gLab.appendChild(flowLabel(830, 250, "calib_done", true, 0, -8));

    /* ACTIVE self loop (PID tick) — üstte küçük döngü */
    gFlow.appendChild(flowPath(
      "M 580 245 C 520 160, 680 160, 620 245",
      "dfd-flow--gold", "dfd-arr-gold"
    ));
    gLab.appendChild(flowLabel(600, 175, "PID tick (5 ms)", true, 0, -10));

    /* ACTIVE → TELEMETRY (sağ-aşağı) */
    gFlow.appendChild(flowPath("M 715 330 C 820 380, 870 400, 900 405", "dfd-flow--purple", "dfd-arr-purple"));
    gLab.appendChild(flowLabel(830, 385, "session_end", true, 0, 18));

    /* TELEMETRY → IDLE (uzun kavis, sağdan → üst → sola) */
    gFlow.appendChild(flowPath(
      "M 950 395 C 1100 360, 1140 240, 1100 130 C 1060 60, 400 60, 250 95",
      "dfd-flow--mint", "dfd-arr-mint"
    ));
    gLab.appendChild(flowLabel(1110, 220, "tx_done", true, 0, 0));

    /* ACTIVE → FAULT (sol-aşağı) */
    gFlow.appendChild(flowPath(
      "M 490 320 C 400 360, 340 400, 315 410",
      "dfd-flow--pink", "dfd-arr-pink"
    ));
    gLab.appendChild(flowLabel(380, 380, "over-current / WDT", true, 0, 18));

    /* FAULT → IDLE (sol taraftan yukarı) */
    gFlow.appendChild(flowPath("M 225 395 C 180 340, 180 230, 225 200", "dfd-flow--pink", "dfd-arr-pink"));
    gLab.appendChild(flowLabel(175, 300, "safe_reset", true, -6, 0));

    /* Alt orta — görev tahsisi notu (path'lerle çakışmaz) */
    svg.appendChild(roundedRect(440, 490, 320, 50, 10,
      "rgba(255,255,255,0.04)", "rgba(255,255,255,0.12)", 1));
    svg.appendChild(el("text", {
      x: 456, y: 510, fill: "#00f5d4",
      "font-family": "'Space Grotesk', system-ui, sans-serif",
      "font-size": "11", "font-weight": "700",
      "letter-spacing": "0.14em",
      textContent: "GÖREV TAHSİSİ",
    }));
    svg.appendChild(el("text", {
      x: 456, y: 528, fill: "#e8e9ef",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": "11", "font-weight": "500",
      textContent: "Core 1 → PID + IRQ + DAQ   ·   Core 0 → BLE + telemetri",
    }));

    svg.appendChild(gFlow);
    svg.appendChild(gLab);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function init() {
    var el0 = document.getElementById("dfd-level-0");
    var el1 = document.getElementById("dfd-level-1");
    var elHw = document.getElementById("hw-block");
    var elPid = document.getElementById("pid-block");
    var elSig = document.getElementById("signal-pipeline");
    var elSm = document.getElementById("state-machine");
    if (el0) renderLevel0(el0);
    if (el1) renderLevel1(el1);
    if (elHw) renderHardwareBlock(elHw);
    if (elPid) renderPIDBlock(elPid);
    if (elSig) renderSignalPipeline(elSig);
    if (elSm) renderStateMachine(elSm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MyolaDFD = {
    renderLevel0: renderLevel0,
    renderLevel1: renderLevel1,
    renderHardwareBlock: renderHardwareBlock,
    renderPIDBlock: renderPIDBlock,
    renderSignalPipeline: renderSignalPipeline,
    renderStateMachine: renderStateMachine,
    init: init,
    PRODUCT: PRODUCT,
  };
})();
