(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (v, d) => v.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---------- Videos: se reproducen solo mientras están a la vista ----------
  const videos = [...document.querySelectorAll("video.autoplay")];
  const visible = new WeakSet();
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) {
          visible.add(v);
          if (!reduceMotion && !v.dataset.userPaused) v.play().catch(() => {});
        } else {
          visible.delete(v);
          if (!v.paused) v.pause();
        }
      }
    }, { threshold: 0.4 });
    videos.forEach((v) => {
      io.observe(v);
      // si la persona pausa a mano, no volver a reproducir al hacer scroll
      v.addEventListener("pause", () => { if (visible.has(v) && !v.ended) v.dataset.userPaused = "1"; });
      v.addEventListener("play", () => { delete v.dataset.userPaused; });
    });
  }

  // ---------- Selectores de secuencia ----------
  document.querySelectorAll(".switcher").forEach((group) => {
    const video = group.parentElement.querySelector("video");
    group.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-src]");
      if (!btn || btn.getAttribute("aria-pressed") === "true") return;
      group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      video.poster = btn.dataset.src.replace(/\.mp4$/, ".webp");
      video.src = btn.dataset.src;
      delete video.dataset.userPaused;
      if (visible.has(video) && !reduceMotion) video.play().catch(() => {});
    });
  });

  // ---------- Menú: marcar la sección visible ----------
  const links = new Map([...document.querySelectorAll(".nav li a")].map((a) => [a.hash.slice(1), a]));
  const navList = document.querySelector(".nav ul");
  // Desplaza solo la lista del menú (en horizontal) para dejar visible el enlace activo. No usar
  // scrollIntoView: el menú es sticky y scrollIntoView también mueve la página hacia la posición
  // original de la barra, lo que tiraba el scroll hacia arriba al cruzar de una sección a otra.
  const revealInNav = (a) => {
    if (!navList || navList.scrollWidth <= navList.clientWidth) return;
    const left = a.offsetLeft; // relativo a la lista (ul con position: relative en styles.css)
    const right = left + a.offsetWidth;
    if (left < navList.scrollLeft) navList.scrollLeft = left - 8;
    else if (right > navList.scrollLeft + navList.clientWidth) navList.scrollLeft = right - navList.clientWidth + 8;
  };
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = links.get(e.target.id);
        if (a) {
          a.setAttribute("aria-current", "true");
          revealInNav(a);
        }
      }
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach((s) => so.observe(s));
  }

  // ---------- Tooltip compartido ----------
  const tip = document.getElementById("tooltip");
  const showTip = (ev, html) => {
    tip.innerHTML = html;
    tip.hidden = false;
    const pad = 14;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  };
  const hideTip = () => { tip.hidden = true; };

  // ---------- Barras horizontales en SVG ----------
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs = {}, parent) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  // barra con el extremo de datos redondeado (4 px) y la base recta
  const barPath = (x, y, w, h, r = 4) => {
    r = Math.min(r, w, h / 2);
    return `M${x},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - r)}z`;
  };
  const measure = (text, size) => {
    const c = measure.ctx || (measure.ctx = document.createElement("canvas").getContext("2d"));
    c.font = `${size}px Inter, system-ui, sans-serif`;
    return c.measureText(text).width;
  };

  function hbars(container, rows, opts) {
    const width = Math.max(260, container.clientWidth);
    const fs = 13, rowH = opts.rowH || 30, barH = Math.min(20, rowH - 8);
    const labelW = Math.ceil(Math.max(...rows.map((r) => measure(r.label, fs)))) + 12;
    const valueW = Math.ceil(Math.max(...rows.map((r) => measure(r.text, fs)))) + 10;
    const plotW = Math.max(60, width - labelW - valueW);
    const top = 4, axisH = opts.ticks ? 22 : 0;
    const height = top + rows.length * rowH + axisH;
    const max = opts.max || Math.max(...rows.map((r) => r.value));
    const sx = (v) => (v / max) * plotW;

    const svg = el("svg", { class: "chart", width, height, viewBox: `0 0 ${width} ${height}`, role: "presentation" });
    if (opts.ticks) {
      for (const t of opts.ticks) {
        const x = labelW + sx(t);
        el("line", { class: "grid", x1: x, x2: x, y1: top, y2: top + rows.length * rowH }, svg);
        el("text", { x, y: height - 6, "text-anchor": "middle", "font-size": 11 }, svg).textContent = fmt(t, 1);
      }
    }
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const g = el("g", { class: "row" }, svg);
      el("text", { x: labelW - 10, y: y + rowH / 2 + 4, "text-anchor": "end", "font-size": fs }, g).textContent = r.label;
      const w = Math.max(2, sx(r.value));
      el("path", { class: "bar", d: barPath(labelW, y + (rowH - barH) / 2, w, barH), fill: r.color }, g);
      el("text", { class: "val", x: labelW + w + 6, y: y + rowH / 2 + 4, "font-size": fs }, g).textContent = r.text;
      const hit = el("rect", { class: "hit", x: 0, y, width, height: rowH }, g);
      if (r.tip) {
        hit.addEventListener("mousemove", (ev) => showTip(ev, r.tip));
        hit.addEventListener("mouseleave", hideTip);
      }
    });
    el("line", { class: "base", x1: labelW, x2: labelW, y1: top, y2: top + rows.length * rowH }, svg);
    container.replaceChildren(svg);
  }

  // ---------- Gráfico 1: PHOENIX por modo de inferencia ----------
  function drawPhoenix() {
    const box = document.getElementById("chart-phoenix");
    const data = window.RESULTS && window.RESULTS.phoenix_modes;
    if (!box || !data) return;
    box.replaceChildren();
    for (const m of data.metrics.filter((x) => x.chart !== false)) {
      const cell = document.createElement("div");
      const h = document.createElement("h4");
      h.innerHTML = `${m.key} <span>${m.better === "lower" ? "menor es mejor" : "mayor es mejor"}</span>`;
      const plot = document.createElement("div");
      cell.append(h, plot);
      box.appendChild(cell);
      const rows = data.modes.map((mode, i) => ({
        label: mode,
        value: m.values[i],
        text: fmt(m.values[i], m.digits),
        color: i === data.highlight ? "var(--series-2)" : "var(--series-1)",
        tip: `<strong>${mode}</strong><br>${m.key} ${fmt(m.values[i], m.digits)}`
      }));
      hbars(plot, rows, { rowH: 30 });
    }
  }

  // ---------- Gráfico 2: identidad por informante ----------
  function drawIdentity() {
    const box = document.getElementById("chart-identity");
    const data = window.RESULTS && window.RESULTS.identity_ranking;
    if (!box || !data) return;
    const rows = data.rows.map((r) => ({
      label: r.informant,
      value: r.ids,
      text: fmt(r.ids, 3),
      color: "var(--series-1)",
      tip: `<strong>${r.informant}</strong><br>IDS media ${fmt(r.ids, 3)} · mediana ${fmt(r.median, 3)}<br>desv. ${fmt(r.sd, 3)} · ${r.n} frases`
    }));
    hbars(box, rows, { rowH: 26, max: 0.8, ticks: [0, 0.2, 0.4, 0.6, 0.8] });
  }

  const drawAll = () => { drawPhoenix(); drawIdentity(); };
  drawAll();
  let lastW = window.innerWidth, timer;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(drawAll, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
})();
