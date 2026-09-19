/* Reversa Docs — tema compartilhado (partículas, reveal, nav, tema) */
(function () {
  "use strict";

  /* ---------- Tema (escuro/claro) ---------- */
  /**
   * Obtém o tema visual atualmente ativo na aplicação.
   * @returns {string} O tema atual ("light" ou "dark").
   */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  /**
   * Define e aplica o tema visual na página e no armazenamento local.
   * @param {string} theme - O nome do tema a ser aplicado ("light" ou "dark").
   * @returns {void}
   */
  function setTheme(theme) {
    var next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("rv-theme", next); } catch (e) { /* storage indisponível */ }
    initAllParticles(); // partículas dependem do tema
  }

  /**
   * Inicializa o tema visual da página a partir do valor armazenado no localStorage.
   * @returns {void}
   */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("rv-theme"); } catch (e) { /* storage indisponível */ }
    document.documentElement.setAttribute("data-theme", saved === "light" ? "light" : "dark");
  }

  /* ---------- Partículas de fundo (canvas) ---------- */
  var particleDisposers = [];

  /**
   * Retorna a paleta de cores das partículas para o tema ativo.
   * @returns {{dots: Array<string>, lines: string}} Objeto contendo os arrays de cores dos pontos e das linhas de conexão.
   */
  function particlePalette() {
    var light = currentTheme() === "light";
    return {
      dots: light ? ["#0e7490", "#4f46e5", "#7c3aed", "#0f172a"] : ["#22d3ee", "#6366f1", "#a855f7", "#e8eefb"],
      lines: light ? "#94a3b8" : "#8b98b0"
    };
  }

  /**
   * Inicializa a animação de partículas de fundo em um elemento canvas.
   * @param {HTMLCanvasElement} canvas - O elemento canvas onde as partículas serão renderizadas.
   * @returns {function(): void|undefined} Função de descarte (dispose) para cancelar a animação.
   */
  function initParticles(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w, h, raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const palette = particlePalette();
    const COLORS = palette.dots;

    /**
     * Redimensiona o canvas para ajustar-se ao container pai com suporte a DPR.
     * @returns {void}
     */
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const N = 90;
    const pts = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00045,
        vy: (Math.random() - 0.5) * 0.00045,
        r: 0.6 + Math.random() * 1.9,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        a: 0.25 + Math.random() * 0.5
      });
    }

    /**
     * Atualiza o estado das partículas e redesenha o quadro da animação.
     * @param {number} t - O carimbo de data/hora atual fornecido pelo requestAnimationFrame.
     * @returns {void}
     */
    function step(t) {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1; else if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; else if (p.y > 1) p.y = 0;
        const tw = 0.5 + 0.5 * Math.sin(t / 1400 + p.x * 40);
        ctx.globalAlpha = p.a * (0.5 + 0.5 * tw);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // linhas de conexão
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.globalAlpha = (1 - d / 130) * 0.12;
            ctx.strokeStyle = palette.lines;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(step);

    /**
     * Cancela o loop de animação das partículas.
     * @returns {void}
     */
    return function dispose() { cancelAnimationFrame(raf); };
  }

  /**
   * Reinicializa os efeitos de partículas de fundo em todos os canvases da página.
   * @returns {void}
   */
  function initAllParticles() {
    particleDisposers.forEach(function (d) { if (d) d(); });
    particleDisposers = [];
    document.querySelectorAll(".rv-hero__canvas").forEach(function (c) {
      particleDisposers.push(initParticles(c));
    });
  }

  /* ---------- Botão de troca de tema (injetado no header) ---------- */
  /**
   * Injeta o botão de alternância de tema no cabeçalho da página.
   * @returns {void}
   */
  function injectThemeToggle() {
    document.querySelectorAll(".rv-header__inner").forEach(function (inner) {
      if (inner.querySelector(".rv-theme-toggle")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rv-theme-toggle";
      btn.setAttribute("aria-label", "Alternar tema claro/escuro");
      btn.title = "Alternar tema claro/escuro";
      btn.innerHTML =
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.addEventListener("click", function () {
        setTheme(currentTheme() === "light" ? "dark" : "light");
      });
      inner.appendChild(btn);
    });
  }

  // Aplica o tema salvo, inicia partículas e injeta o botão
  initTheme();
  initAllParticles();
  injectThemeToggle();

  /* ---------- Scroll reveal ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".rv-reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".rv-reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Boot de nav + selos (a partir de window.RV_DATA) ---------- */
  /**
   * Determina o prefixo de caminho relativo até a raiz do site a partir da tag script de data.js.
   * @returns {string} O prefixo de caminho relativo ("" ou "../").
   */
  function navPrefix() {
    // Prefixo relativo até a raiz do site, derivado do <script src="...data.js">.
    // Página na raiz: "assets/js/data.js" -> "". Subpasta (features/): "../assets/js/data.js" -> "../".
    var script = document.querySelector('script[src$="data.js"]');
    if (!script) return "";
    var m = (script.getAttribute("src") || "").match(/^(\.\.\/)+/);
    return m ? m[0] : "";
  }

  /**
   * Inicializa o menu de navegação e insere os elementos dinâmicos com base em window.RV_DATA.
   * @returns {void}
   */
  function bootNav() {
    var rv = window.RV_DATA;
    var prefix = navPrefix();
    if (rv && rv.nav && rv.nav.length) {
      var links = rv.nav.map(function (item) {
        return '<a href="' + prefix + item.href + '" data-page-id="' + item.id + '">' + item.label + '</a>';
      }).join('');
      document.querySelectorAll('.rv-nav').forEach(function (nav) { nav.innerHTML = links; });
    }
    if (rv && rv.sealMiniSvg) {
      document.querySelectorAll('[data-seal]').forEach(function (el) { el.innerHTML = rv.sealMiniSvg; });
    }
    if (rv && rv.sealSvg) {
      document.querySelectorAll('[data-seal-hero]').forEach(function (el) { el.innerHTML = rv.sealSvg; });
    }
    var pageId = document.body.getAttribute("data-page");
    if (pageId) {
      document.querySelectorAll('.rv-nav a[data-page-id="' + pageId + '"]').forEach(function (a) {
        a.setAttribute("aria-current", "page");
      });
    }
  }
  if (window.RV_DATA) bootNav();
  else window.addEventListener("rv-data-ready", bootNav);

  /* ---------- Nav mobile ---------- */
  const toggle = document.querySelector(".rv-nav-toggle");
  const nav = document.querySelector(".rv-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  /* ---------- Contadores animados ---------- */
  /**
   * Anima a contagem de elementos numéricos com o atributo data-count.
   * @returns {void}
   */
  function animateCounters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      if (el.__done) return;
      el.__done = true;
      const target = parseFloat(el.getAttribute("data-count"));
      const dec = (el.getAttribute("data-dec") || "0") === "0" ? 0 : 1;
      const dur = 1400;
      const start = performance.now();
      /**
       * Executa cada passo da animação do contador.
       * @param {number} now - O carimbo de data/hora atual.
       * @returns {void}
       */
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { animateCounters(); cio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));
  } else {
    animateCounters();
  }

  /* ---------- Boot de dados (fallback inline -> window.RV_DATA) ---------- */
  /**
   * Carrega os dados de fallback inline caso window.RV_DATA ainda não esteja populado.
   * @param {Array<string>} [keys] - Lista opcional de chaves a serem extraídas do elemento de dados inline.
   * @returns {void}
   */
  window.RV_BOOT = function (keys) {
    window.RV_DATA = window.RV_DATA || {};
    const inline = document.getElementById("rv-inline-data");
    if (inline) {
      try {
        const data = JSON.parse(inline.textContent);
        (keys || Object.keys(data)).forEach(function (k) {
          if (window.RV_DATA[k] === undefined) window.RV_DATA[k] = data[k];
        });
      } catch (e) { /* dados inline inválidos, segue com data.js se houver */ }
    }
  };
})();
