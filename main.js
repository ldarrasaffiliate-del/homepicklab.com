/* HomePicksLab.com — main JS (vanilla, small, consent-aware).
   - No auto language redirects (selector only).
   - Affiliate links are generated per language.
   - GA4 loads only after Analytics consent.
   - YouTube embeds are blocked unless External media consent (or session grant). */

const SITE_ORIGIN = "https://homepicklab.com";
const GA4_MEASUREMENT_ID = "G-W6JW3C08M3";
const CONSENT_STORAGE_KEY = "hpl_consent_v1";
const EXTERNAL_MEDIA_SESSION_KEY = "hpl_external_media_session";
const THEME_STORAGE_KEY = "hpl_theme_v1";

const I18N = {
  en: {
    videoPlaceholderTitle: "Click to load video",
    videoPlaceholderBody: "External media (YouTube) is blocked until you allow it.",
    videoPlaceholderCta: "Load video",
    bothLabel: "Both models",
    themeLabel: "Theme",
    themeModeAuto: "Auto",
    themeModeLight: "Light",
    themeModeDark: "Dark",
    backToTopLabel: "Back to top",
    tocLabel: "On this page",
    updatedLabel: "Updated",
    readTimeUnit: "min read",
  },
  fr: {
    videoPlaceholderTitle: "Cliquer pour charger la vidéo",
    videoPlaceholderBody: "Les médias externes (YouTube) sont bloqués tant que vous ne les autorisez pas.",
    videoPlaceholderCta: "Charger la vidéo",
    bothLabel: "Les deux modèles",
    themeLabel: "Thème",
    themeModeAuto: "Auto",
    themeModeLight: "Clair",
    themeModeDark: "Sombre",
    backToTopLabel: "Retour en haut",
    tocLabel: "Sur cette page",
    updatedLabel: "Mis à jour",
    readTimeUnit: "min de lecture",
  },
  es: {
    videoPlaceholderTitle: "Haz clic para cargar el vídeo",
    videoPlaceholderBody: "Los medios externos (YouTube) están bloqueados hasta que los permitas.",
    videoPlaceholderCta: "Cargar vídeo",
    bothLabel: "Ambos modelos",
    themeLabel: "Tema",
    themeModeAuto: "Auto",
    themeModeLight: "Claro",
    themeModeDark: "Oscuro",
    backToTopLabel: "Volver arriba",
    tocLabel: "En esta página",
    updatedLabel: "Actualizado",
    readTimeUnit: "min de lectura",
  },
  de: {
    videoPlaceholderTitle: "Klicken, um das Video zu laden",
    videoPlaceholderBody: "Externe Medien (YouTube) sind blockiert, bis du sie erlaubst.",
    videoPlaceholderCta: "Video laden",
    bothLabel: "Beide Modelle",
    themeLabel: "Design",
    themeModeAuto: "Auto",
    themeModeLight: "Hell",
    themeModeDark: "Dunkel",
    backToTopLabel: "Nach oben",
    tocLabel: "Auf dieser Seite",
    updatedLabel: "Aktualisiert",
    readTimeUnit: "Min. Lesezeit",
  },
};

// pageKey => localized route (always trailing slash for folder URLs)
const ROUTE_MAP = {
  home: { en: "/", fr: "/fr/", es: "/es/", de: "/de/" },
  comparison: {
    en: "/robot-vacuum-mop-comparison/",
    fr: "/fr/comparatif-aspirateurs-robots/",
    es: "/es/comparativa-robots-aspirador/",
    de: "/de/saugroboter-vergleich/",
  },
  coffee: {
    en: "/automatic-coffee-machines/",
    fr: "/fr/machines-a-cafe-automatiques/",
    es: "/es/cafeteras-automaticas/",
    de: "/de/kaffeevollautomaten/",
  },
  airfryers: {
    en: "/airfryers/",
    fr: "/fr/airfryers/",
    es: "/es/freidoras-de-aire/",
    de: "/de/heissluftfritteusen/",
  },
  blog: { en: "/blog/", fr: "/fr/blog/", es: "/es/blog/", de: "/de/blog/" },
  article: {
    en: "/blog/how-to-clean-and-maintain-robot-vacuum/",
    fr: "/fr/blog/comment-nettoyer-et-entretenir-aspirateur-robot/",
    es: "/es/blog/como-limpiar-y-mantener-robot-aspirador/",
    de: "/de/blog/saugroboter-reinigen-und-warten/",
  },
  legal: {
    en: "/legal-notice/",
    fr: "/fr/mentions-legales/",
    es: "/es/aviso-legal/",
    de: "/de/impressum/",
  },
  privacy: {
    en: "/privacy-policy/",
    fr: "/fr/politique-de-confidentialite/",
    es: "/es/politica-de-privacidad/",
    de: "/de/datenschutzerklaerung/",
  },
};

// Amazon Associates affiliate tags (placeholders to replace in production).
const AFFILIATE_TAGS = {
  en: "YOURTAGUS-20",
  fr: "YOURTAGFR-21",
  es: "YOURTAGES-21",
  de: "YOURTAGDE-21",
};

const PRODUCTS = {
  P1: {
    asin: "B0FNSCXX51",
    query: "Roomba Plus 405 Combo robot AutoWash dock G185020",
    display: "iRobot Roomba Plus 405 Combo robot + AutoWash dock (G185020)",
  },
  P2: {
    asin: "B0FLDWJK7S",
    query: "Shark PowerDetect 2-in-1 Robot Vacuum and Mop NeverTouch Pro Base",
    display: "Shark PowerDetect 2-in-1 Robot Vacuum and Mop with NeverTouch Pro Base",
  },
  P3: {
    asin: "B0F6N1JGGW",
    query: "Roborock QV 35A Robot Vacuum All-in-One Multifunctional Dock",
    display: "Roborock QV 35A Robot Vacuum + All-in-One Multifunctional Dock",
  },
};

function getLangFromPath(pathname) {
  const p = (pathname || "").toLowerCase();
  if (p.startsWith("/fr/")) return "fr";
  if (p.startsWith("/es/")) return "es";
  if (p.startsWith("/de/")) return "de";
  return "en";
}

function getLocaleForLang(lang) {
  if (lang === "fr") return "fr-FR";
  if (lang === "es") return "es-ES";
  if (lang === "de") return "de-DE";
  return "en-US";
}

function t(key) {
  const lang = getLangFromPath(location.pathname);
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";
}

function getPageKeyFromDOM() {
  return document.body?.dataset?.pageKey || null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  try {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function formatShortDate(iso, lang) {
  const d = new Date(String(iso || ""));
  if (Number.isNaN(d.getTime())) return null;
  const locale = getLocaleForLang(lang);
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function isSchemaType(obj, type) {
  if (!obj || typeof obj !== "object") return false;
  const raw = obj["@type"];
  if (!raw) return false;
  if (Array.isArray(raw)) return raw.includes(type);
  return String(raw) === type;
}

function findSchemaByType(data, type) {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findSchemaByType(item, type);
      if (found) return found;
    }
    return null;
  }

  if (typeof data !== "object") return null;
  if (isSchemaType(data, type)) return data;

  const graph = data["@graph"];
  if (Array.isArray(graph)) return findSchemaByType(graph, type);

  return null;
}

function findLdJsonByType(type) {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (const s of scripts) {
    const data = safeJSONParse(s.textContent || "");
    const found = findSchemaByType(data, type);
    if (found) return found;
  }
  return null;
}

function countWords(text) {
  const tokens = String(text || "").trim().match(/\S+/g);
  return tokens ? tokens.length : 0;
}

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function updateBottomUiOffset() {
  const root = document.documentElement;
  if (!root) return;

  const banner = document.getElementById("cookieBanner");
  if (!banner || banner.hidden) {
    root.style.setProperty("--bottom-ui-offset", "0px");
    return;
  }

  const h = banner.getBoundingClientRect?.().height || 0;
  const px = Math.max(0, Math.ceil(h) + 10);
  root.style.setProperty("--bottom-ui-offset", `${px}px`);
}

function initScrollProgress() {
  const root = document.documentElement;
  if (!root) return;

  const progress = document.createElement("div");
  progress.className = "progress";
  progress.hidden = true;
  progress.innerHTML = `<div class="progress__bar" aria-hidden="true"></div>`;
  document.body.appendChild(progress);

  const bar = progress.querySelector(".progress__bar");
  if (!(bar instanceof HTMLElement)) return;

  let raf = 0;
  const update = () => {
    const max = root.scrollHeight - root.clientHeight;
    if (!Number.isFinite(max) || max < 900) {
      progress.hidden = true;
      bar.style.transform = "scaleX(0)";
      return;
    }

    progress.hidden = false;
    const p = clamp(window.scrollY / max, 0, 1);
    bar.style.transform = `scaleX(${p})`;
  };

  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function buildAffiliateLinks() {
  const tags = AFFILIATE_TAGS;
  const byLang = {
    en: {},
    fr: {},
    es: {},
    de: {},
  };

  for (const [productId, p] of Object.entries(PRODUCTS)) {
    byLang.en[productId] = `https://www.amazon.com/dp/${p.asin}/?tag=${encodeURIComponent(
      tags.en,
    )}`;
    // If ASIN isn't known on local marketplaces, use a localized search link.
    byLang.fr[productId] = `https://www.amazon.fr/s?k=${encodeURIComponent(
      p.query,
    )}&tag=${encodeURIComponent(tags.fr)}`;
    byLang.es[productId] = `https://www.amazon.es/s?k=${encodeURIComponent(
      p.query,
    )}&tag=${encodeURIComponent(tags.es)}`;
    byLang.de[productId] = `https://www.amazon.de/s?k=${encodeURIComponent(
      p.query,
    )}&tag=${encodeURIComponent(tags.de)}`;
  }

  return byLang;
}

const AFFILIATE_LINKS = buildAffiliateLinks();

function wireAffiliateLinks() {
  const lang = getLangFromPath(location.pathname);
  const links = AFFILIATE_LINKS[lang] || AFFILIATE_LINKS.en;
  document.querySelectorAll("[data-affiliate-product]").forEach((el) => {
    const productId = el.getAttribute("data-affiliate-product");
    const href = links[productId];
    if (!href) return;

    el.setAttribute("href", href);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "sponsored nofollow noopener noreferrer");
  });
}

function getStoredThemeMode() {
  const raw = safeLocalStorageGet(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  return "auto";
}

function getSystemTheme() {
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getEffectiveTheme(mode) {
  return mode === "auto" ? getSystemTheme() : mode;
}

function setThemeMode(mode) {
  const next = mode === "light" || mode === "dark" || mode === "auto" ? mode : "auto";
  safeLocalStorageSet(THEME_STORAGE_KEY, next);
  applyThemeMode(next);
}

function updateThemeColorMeta(effectiveTheme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", effectiveTheme === "dark" ? "#0b1220" : "#ffffff");
}

function applyThemeMode(mode) {
  const root = document.documentElement;
  if (!root) return;

  if (mode === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);

  updateThemeColorMeta(getEffectiveTheme(mode));
}

function getThemeIcon(mode) {
  if (mode === "dark") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
          fill="currentColor"
        />
      </svg>
    `;
  }

  if (mode === "light") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
          fill="currentColor"
        />
        <path
          d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  // auto
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 9 9c0-5-4-9-9-9Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor" opacity="0.35" />
    </svg>
  `;
}

function initThemeToggle() {
  applyThemeMode(getStoredThemeMode());

  const right = document.querySelector(".nav__right");
  if (!right) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "icon-btn theme-toggle";
  btn.id = "themeBtn";

  const burger = document.getElementById("menuBtn");
  if (burger && burger.parentElement === right) right.insertBefore(btn, burger);
  else right.appendChild(btn);

  const labelFor = (mode) => {
    if (mode === "dark") return `${t("themeLabel")}: ${t("themeModeDark")}`;
    if (mode === "light") return `${t("themeLabel")}: ${t("themeModeLight")}`;
    return `${t("themeLabel")}: ${t("themeModeAuto")}`;
  };

  const render = () => {
    const mode = getStoredThemeMode();
    const label = labelFor(mode);
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    btn.innerHTML = getThemeIcon(mode);
  };

  btn.addEventListener("click", () => {
    const current = getStoredThemeMode();
    const next = current === "auto" ? "dark" : current === "dark" ? "light" : "auto";
    setThemeMode(next);
    render();
  });

  render();

  // Keep "auto" aligned with system changes.
  if (!window.matchMedia) return;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getStoredThemeMode() !== "auto") return;
    applyThemeMode("auto");
    render();
  };

  if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
  else if (typeof mql.addListener === "function") mql.addListener(onChange);
}

function normalizePathname(pathname) {
  const raw = String(pathname || "/");
  const clean = raw.split("?")[0].split("#")[0];
  if (clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function stripLegalLinksFromNav() {
  const disallowed = new Set();
  [ROUTE_MAP.legal, ROUTE_MAP.privacy].forEach((map) => {
    if (!map) return;
    Object.values(map).forEach((p) => disallowed.add(normalizePathname(p)));
  });
  if (!disallowed.size) return;

  const disallowedLabels = new Set([
    "legal",
    "legal notice",
    "privacy",
    "privacy policy",
    "mentions légales",
    "confidentialité",
    "politique de confidentialité",
    "aviso legal",
    "privacidad",
    "política de privacidad",
    "impressum",
    "datenschutz",
    "datenschutzerklärung",
  ]);

  const getPath = (a) => {
    const rawHref = (a.getAttribute("href") || "").trim();
    if (!rawHref || rawHref.startsWith("#")) return "";
    try {
      const url = new URL(rawHref, window.location.origin);
      let path = normalizePathname(url.pathname);
      if (path.endsWith("/index.html/")) path = path.replace(/index\.html\/$/, "");
      return path;
    } catch {
      return "";
    }
  };

  document.querySelectorAll(".site-header a, .drawer a").forEach((a) => {
    const path = getPath(a);
    if (path && disallowed.has(path)) {
      a.remove();
      return;
    }

    const label = (a.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (label && disallowedLabels.has(label)) a.remove();
  });
}

function initCategoryDropdown() {
  const lang = getLangFromPath(location.pathname);

  const dict = {
    en: {
      menuLabel: "Categories",
      robotLabel: "Robot vacuums & mops",
      coffeeLabel: "Automatic coffee machines",
      coffeeQuery: "automatic coffee machines",
      airfryerLabel: "Airfryers",
      airfryerQuery: "airfryers",
    },
    fr: {
      menuLabel: "Catégories",
      robotLabel: "Aspirateurs robots",
      coffeeLabel: "Machines à café automatiques",
      coffeeQuery: "machine cafe automatique",
      airfryerLabel: "Airfryers",
      airfryerQuery: "airfryers",
    },
    es: {
      menuLabel: "Categorías",
      robotLabel: "Robots aspirador",
      coffeeLabel: "Cafeteras automáticas",
      coffeeQuery: "cafeteras automaticas",
      airfryerLabel: "Freidoras de aire",
      airfryerQuery: "freidoras de aire",
    },
    de: {
      menuLabel: "Kategorien",
      robotLabel: "Saugroboter",
      coffeeLabel: "Kaffeevollautomaten",
      coffeeQuery: "kaffeevollautomaten",
      airfryerLabel: "Heißluftfritteusen",
      airfryerQuery: "heissluftfritteusen",
    },
  };

  const menu = dict[lang] || dict.en;
  const comparisonHref = (ROUTE_MAP.comparison && ROUTE_MAP.comparison[lang]) || ROUTE_MAP.comparison.en;
  const blogHref = (ROUTE_MAP.blog && ROUTE_MAP.blog[lang]) || ROUTE_MAP.blog.en;
  const coffeeHref =
    (ROUTE_MAP.coffee && ROUTE_MAP.coffee[lang]) || `${blogHref}?q=${encodeURIComponent(menu.coffeeQuery)}`;
  const airfryerHref =
    (ROUTE_MAP.airfryers && ROUTE_MAP.airfryers[lang]) || `${blogHref}?q=${encodeURIComponent(menu.airfryerQuery)}`;

  const items = [
    { href: comparisonHref, label: menu.robotLabel },
    { href: coffeeHref, label: menu.coffeeLabel },
    { href: airfryerHref, label: menu.airfryerLabel },
  ];

  const roots = Array.from(document.querySelectorAll(".nav__links, .drawer__nav"));
  if (!roots.length) return;

  roots.forEach((nav) => {
    if (nav.querySelector(".nav__dropdown")) return;
    const replaceTarget = nav.querySelector(`a[href="${comparisonHref}"]`);
    if (!replaceTarget) return;

    const details = document.createElement("details");
    details.className = "nav__dropdown";

    const summary = document.createElement("summary");
    summary.textContent = menu.menuLabel;
    details.appendChild(summary);

    const menuEl = document.createElement("div");
    menuEl.className = "nav__dropdown-menu";
    menuEl.setAttribute("aria-label", menu.menuLabel);

    items.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      menuEl.appendChild(a);
    });

    details.appendChild(menuEl);
    replaceTarget.replaceWith(details);
  });
}

function initActiveNav() {
  const currentPath = normalizePathname(location.pathname);
  const currentSearch = location.search || "";
  const lang = getLangFromPath(currentPath);
  const rootPath = lang === "en" ? "/" : `/${lang}/`;

  const links = Array.from(document.querySelectorAll(".nav__links a, .drawer__nav a"));
  if (!links.length) return;

  const scoreLink = (a) => {
    const href = a.getAttribute("href") || "";
    if (!href) return 0;

    let url;
    try {
      url = new URL(href, SITE_ORIGIN);
    } catch {
      return 0;
    }

    const pathname = normalizePathname(url.pathname);
    if (!pathname) return 0;

    if (pathname === rootPath) return currentPath === rootPath ? 10000 : 0;

    if (url.search && url.search.length > 1) {
      if (currentPath !== pathname) return 0;
      const linkParams = new URLSearchParams(url.search);
      const currentParams = new URLSearchParams(currentSearch);
      for (const [k, v] of linkParams.entries()) {
        if (currentParams.get(k) !== v) return 0;
      }
      return 9000 + pathname.length + url.search.length;
    }

    if (!currentPath.startsWith(pathname)) return 0;
    return pathname.length;
  };

  let max = 0;
  const scores = new Map();
  links.forEach((a) => {
    const score = scoreLink(a);
    scores.set(a, score);
    if (score > max) max = score;
  });

  links.forEach((a) => {
    const score = scores.get(a) || 0;
    if (max > 0 && score === max) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  document.querySelectorAll(".nav__dropdown").forEach((details) => {
    const active = details.querySelector('a[aria-current="page"]');
    if (active) details.setAttribute("data-nav-active", "true");
    else details.removeAttribute("data-nav-active");
  });
}

function initHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const apply = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 6);
  };

  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

function initLanguageSwitcher() {
  const select = document.getElementById("langSelect");
  if (!select) return;

  const currentLang = getLangFromPath(location.pathname);
  select.value = currentLang;

  select.addEventListener("change", () => {
    const pageKey = getPageKeyFromDOM();
    const nextLang = select.value;
    const next =
      (pageKey && ROUTE_MAP[pageKey] && ROUTE_MAP[pageKey][nextLang]) ||
      ROUTE_MAP.home[nextLang] ||
      "/";

    const hash = location.hash || "";
    location.href = `${next}${hash}`;
  });
}

function initDrawer() {
  const drawer = document.getElementById("drawer");
  const openBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("drawerCloseBtn");
  if (!drawer || !openBtn || !closeBtn) return;

  const panel = drawer.querySelector(".drawer__panel");
  let lastFocused = null;

  const setOpen = (open) => {
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      lastFocused = document.activeElement;
      closeBtn.focus();
    } else if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.getAttribute("aria-hidden") === "false") {
      setOpen(false);
    }
  });

  // Basic focus trap inside the drawer panel.
  drawer.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || drawer.getAttribute("aria-hidden") !== "false") return;
    const focusables = panel.querySelectorAll(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Close the drawer when a navigation link is clicked.
  panel.querySelectorAll('a[href]').forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
}

function initCarousels() {
  const carousels = document.querySelectorAll(".carousel");
  if (!carousels.length) return;

  let eagerUsed = false;

  const createCarouselThumb = ({ src, index }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Go to slide ${index}`);
    btn.setAttribute("aria-current", index === 1 ? "true" : "false");

    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 120;
    img.height = 120;
    img.alt = "";
    btn.appendChild(img);

    return btn;
  };

  carousels.forEach((root) => {
    // Optional: generate slides from a filename pattern to keep HTML small and consistent.
    // Required data attributes:
    // - data-carousel-prefix="irobotroombaplus405-" (the part before the number)
    // - data-carousel-count="10"
    // - data-carousel-alt="iRobot Roomba photo {n}"
    const viewportForHydration = root.querySelector(".carousel__viewport");
    const dotsForHydration = root.querySelector(".carousel__dots");
    const prefix = root.getAttribute("data-carousel-prefix");
    const countRaw = root.getAttribute("data-carousel-count");
    const altTemplate = root.getAttribute("data-carousel-alt") || "Product photo {n}";
    const count = countRaw ? Number.parseInt(countRaw, 10) : NaN;

    const allowEager =
      !eagerUsed &&
      (() => {
        try {
          return root.getBoundingClientRect().top < window.innerHeight * 1.25;
        } catch {
          return false;
        }
      })();

    if (
      viewportForHydration &&
      dotsForHydration &&
      prefix &&
      Number.isFinite(count) &&
      !viewportForHydration.children.length
    ) {
      for (let i = 1; i <= count; i++) {
        const fig = document.createElement("figure");
        fig.className = "carousel__slide";

        const img = document.createElement("img");
        const src = `/images/${prefix}${i}.jpg`;
        img.src = src;
        const eager = allowEager && i === 1;
        img.loading = eager ? "eager" : "lazy";
        img.decoding = "async";
        img.width = 1200;
        img.height = 900;
        img.alt = altTemplate.replace("{n}", String(i));
        if (eager) {
          img.setAttribute("fetchpriority", "high");
          eagerUsed = true;
        }

        fig.appendChild(img);
        viewportForHydration.appendChild(fig);

        dotsForHydration.appendChild(createCarouselThumb({ src, index: i }));
      }
    }

    const viewport = root.querySelector(".carousel__viewport");
    const slides = Array.from(root.querySelectorAll(".carousel__slide"));
    const prevBtn = root.querySelector('[data-carousel="prev"]');
    const nextBtn = root.querySelector('[data-carousel="next"]');
    const dotsContainer = root.querySelector(".carousel__dots");

    if (viewport && dotsContainer && !dotsContainer.children.length) {
      const slideImgs = Array.from(viewport.querySelectorAll(".carousel__slide img"));
      slideImgs.forEach((img, idx) => {
        const src = img.getAttribute("src");
        if (!src) return;
        dotsContainer.appendChild(createCarouselThumb({ src, index: idx + 1 }));
      });
    }

    const dots = Array.from(root.querySelectorAll(".carousel__dots button"));

    if (!viewport || !slides.length) return;
    viewport.setAttribute("tabindex", "0");

    const scrollToIndex = (index) => {
      const i = clamp(index, 0, slides.length - 1);
      const left = slides[i].offsetLeft - viewport.offsetLeft;
      viewport.scrollTo({ left, behavior: "smooth" });
    };

    const getActiveIndex = () => {
      const x = viewport.scrollLeft + viewport.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((s, idx) => {
        const mid = s.offsetLeft + s.clientWidth / 2 - viewport.offsetLeft;
        const d = Math.abs(mid - x);
        if (d < bestDist) {
          bestDist = d;
          best = idx;
        }
      });
      return best;
    };

    const updateDots = () => {
      const active = getActiveIndex();
      dots.forEach((d, idx) => d.setAttribute("aria-current", idx === active ? "true" : "false"));
    };

    let raf = 0;
    viewport.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateDots);
    });

    prevBtn?.addEventListener("click", () => scrollToIndex(getActiveIndex() - 1));
    nextBtn?.addEventListener("click", () => scrollToIndex(getActiveIndex() + 1));
    dots.forEach((d, idx) => d.addEventListener("click", () => scrollToIndex(idx)));

    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") scrollToIndex(getActiveIndex() - 1);
      if (e.key === "ArrowRight") scrollToIndex(getActiveIndex() + 1);
    });

    // Optional: Shift + mouse wheel to scroll horizontally without hijacking normal vertical page scrolling.
    viewport.addEventListener(
      "wheel",
      (e) => {
        if (!e.shiftKey) return;

        const max = viewport.scrollWidth - viewport.clientWidth;
        if (max <= 0) return;

        // If the user is already scrolling horizontally (trackpad), let the browser handle it.
        if (Math.abs(e.deltaX) > 0) return;

        const delta = e.deltaY;
        if (!delta) return;

        const current = viewport.scrollLeft;
        const next = clamp(current + delta, 0, max);
        if (next === current) return;

        viewport.scrollLeft = next;
        e.preventDefault();
      },
      { passive: false },
    );

    updateDots();
  });
}

function getStoredConsent() {
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  const data = safeJSONParse(raw);
  if (!data || typeof data !== "object") return null;
  return {
    necessary: true,
    analytics: Boolean(data.analytics),
    externalMedia: Boolean(data.externalMedia),
    ts: typeof data.ts === "number" ? data.ts : Date.now(),
  };
}

function storeConsent(consent) {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      analytics: Boolean(consent.analytics),
      externalMedia: Boolean(consent.externalMedia),
      ts: Date.now(),
    }),
  );
}

function hasExternalMediaConsent() {
  const stored = getStoredConsent();
  if (stored?.externalMedia) return true;
  return sessionStorage.getItem(EXTERNAL_MEDIA_SESSION_KEY) === "1";
}

function loadGA4() {
  if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
  if (window.__hpl_ga_loaded) return;
  window.__hpl_ga_loaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, { anonymize_ip: true });
}

function renderYouTubeEmbeds() {
  document.querySelectorAll("[data-youtube-id]").forEach((wrap) => {
    const id = wrap.getAttribute("data-youtube-id");
    const title = wrap.getAttribute("data-youtube-title") || "YouTube video";
    const ratio = wrap.querySelector(".video__ratio");
    if (!id || !ratio) return;

    const allowed = hasExternalMediaConsent();
    if (!allowed) {
      ratio.innerHTML = `
        <div class="video__placeholder">
          <strong>${t("videoPlaceholderTitle")}</strong>
          <div class="tiny">${t("videoPlaceholderBody")}</div>
          <div class="video__actions">
            <button class="btn btn--primary btn--small" type="button" data-load-video>${t("videoPlaceholderCta")}</button>
          </div>
        </div>
      `;
      const btn = ratio.querySelector("[data-load-video]");
      btn?.addEventListener("click", () => {
        sessionStorage.setItem(EXTERNAL_MEDIA_SESSION_KEY, "1");
        renderYouTubeEmbeds();
      });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.title = title;
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      id,
    )}?rel=0&modestbranding=1`;
    ratio.innerHTML = "";
    ratio.appendChild(iframe);
  });
}

function applyConsent() {
  const consent = getStoredConsent();
  if (consent?.analytics) loadGA4();
  renderYouTubeEmbeds();
}

function openModal(modal) {
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])");
  first?.focus?.();
}

function closeModal(modal) {
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initCookieUI() {
  const banner = document.getElementById("cookieBanner");
  const modal = document.getElementById("cookieModal");
  const manageBtn = document.getElementById("manageCookiesBtn");
  if (!banner || !modal) return;

  const acceptBtn = document.getElementById("cookieAcceptBtn");
  const rejectBtn = document.getElementById("cookieRejectBtn");
  const customizeBtn = document.getElementById("cookieCustomizeBtn");
  const saveBtn = document.getElementById("cookieSaveBtn");
  const closeBtn = document.getElementById("cookieCloseBtn");
  const closeBtnAlt = document.getElementById("cookieCloseBtnAlt");
  const analyticsToggle = document.getElementById("consentAnalytics");
  const externalToggle = document.getElementById("consentExternalMedia");

  const stored = getStoredConsent();
  if (!stored) banner.hidden = false;
  updateBottomUiOffset();

  const syncToggles = () => {
    const c = getStoredConsent();
    analyticsToggle.checked = Boolean(c?.analytics);
    externalToggle.checked = Boolean(c?.externalMedia);
  };

  const setConsentAndClose = (c) => {
    storeConsent(c);
    banner.hidden = true;
    closeModal(modal);
    applyConsent();
    updateBottomUiOffset();
  };

  acceptBtn?.addEventListener("click", () => setConsentAndClose({ analytics: true, externalMedia: true }));
  rejectBtn?.addEventListener("click", () => setConsentAndClose({ analytics: false, externalMedia: false }));
  customizeBtn?.addEventListener("click", () => {
    syncToggles();
    openModal(modal);
  });

  manageBtn?.addEventListener("click", () => {
    syncToggles();
    openModal(modal);
  });

  saveBtn?.addEventListener("click", () => {
    setConsentAndClose({
      analytics: Boolean(analyticsToggle.checked),
      externalMedia: Boolean(externalToggle.checked),
    });
  });

  closeBtn?.addEventListener("click", () => closeModal(modal));
  closeBtnAlt?.addEventListener("click", () => closeModal(modal));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal(modal);
  });

  // Basic focus trap for the cookie modal.
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || modal.getAttribute("aria-hidden") !== "false") return;
    const panel = modal.querySelector(".modal__panel");
    const focusables = panel.querySelectorAll(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function initBackToTop() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "backToTopBtn";
  btn.className = "icon-btn fab";
  btn.setAttribute("aria-hidden", "true");
  btn.setAttribute("aria-label", t("backToTopLabel"));
  btn.setAttribute("title", t("backToTopLabel"));
  btn.disabled = true;
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5l-7 7m7-7 7 7M12 5v14"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  document.body.appendChild(btn);

  const show = (visible) => {
    const isVisible = btn.getAttribute("aria-hidden") === "false";
    if (visible === isVisible) return;
    btn.setAttribute("aria-hidden", visible ? "false" : "true");
    btn.disabled = !visible;
  };

  btn.addEventListener("click", () => {
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  });

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      show(window.scrollY > 700);
    });
  };

  updateBottomUiOffset();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateBottomUiOffset, { passive: true });
}

function initPrintSupport() {
  let cache = new Map();

  const openAllDetails = () => {
    cache = new Map();
    document.querySelectorAll("details").forEach((d) => {
      if (!(d instanceof HTMLDetailsElement)) return;
      cache.set(d, d.open);
      d.open = true;
    });
  };

  const restoreDetails = () => {
    cache.forEach((wasOpen, d) => {
      if (!document.contains(d)) return;
      d.open = wasOpen;
    });
    cache.clear();
  };

  window.addEventListener("beforeprint", openAllDetails);
  window.addEventListener("afterprint", restoreDetails);
}

function initTocCollapsibles() {
  const navs = Array.from(document.querySelectorAll("nav.toc"));
  if (!navs.length) return;

  const pageKey = getPageKeyFromDOM();

  const isDesktop = () => {
    try {
      return window.matchMedia && window.matchMedia("(min-width: 760px)").matches;
    } catch {
      return true;
    }
  };

  navs.forEach((nav) => {
    if (!(nav instanceof HTMLElement)) return;
    if (nav.closest(".toc-collapsible")) return;

    const titleEl = nav.querySelector("strong");
    const titleRaw = titleEl?.textContent || nav.getAttribute("aria-label") || "";
    const title = String(titleRaw || "").trim() || t("tocLabel") || "On this page";
    titleEl?.remove?.();

    const details = document.createElement("details");
    details.className = "collapsible toc-collapsible";
    details.open = pageKey === "comparison" ? false : isDesktop();

    const summary = document.createElement("summary");
    summary.textContent = title;

    const body = document.createElement("div");
    body.className = "collapsible__body";

    nav.parentElement?.insertBefore(details, nav);
    body.appendChild(nav);
    details.appendChild(summary);
    details.appendChild(body);

    nav.addEventListener("click", (e) => {
      const a = e.target?.closest?.('a[href^="#"]');
      if (!a) return;
      if (isDesktop()) return;
      window.setTimeout(() => {
        details.open = false;
      }, 0);
    });
  });
}

function initPageLayouts() {
  const pageKey = getPageKeyFromDOM();
  if (pageKey !== "article") return;

  const root = document.querySelector("main#main article.stack");
  if (!(root instanceof HTMLElement)) return;
  if (root.querySelector(":scope > .page-layout")) return;

  const tocBlock = root.querySelector(":scope > .toc-collapsible") || root.querySelector(":scope > nav.toc") || null;
  if (!(tocBlock instanceof HTMLElement)) return;

  const layout = document.createElement("div");
  layout.className = "page-layout";

  const aside = document.createElement("aside");
  aside.className = "page-layout__aside";

  const main = document.createElement("div");
  main.className = "page-layout__main stack";

  // Keep the TOC before the content in the DOM for mobile readers.
  root.insertBefore(layout, tocBlock);
  layout.appendChild(aside);
  layout.appendChild(main);

  const siblingsToMove = [];
  let cursor = tocBlock.nextElementSibling;
  while (cursor) {
    siblingsToMove.push(cursor);
    cursor = cursor.nextElementSibling;
  }

  aside.appendChild(tocBlock);
  siblingsToMove.forEach((el) => main.appendChild(el));
}

function initTocSpy() {
  const navs = Array.from(document.querySelectorAll("nav.toc"));
  if (!navs.length) return;

  const headerOffset = 96;
  const topOffset = () => headerOffset + 12;

  navs.forEach((nav) => {
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const items = links
      .map((a) => {
        const raw = a.getAttribute("href") || "";
        const id = decodeURIComponent(raw.slice(1));
        const target = document.getElementById(id);
        return target ? { a, id, target } : null;
      })
      .filter(Boolean);

    if (!items.length) return;

    let lastActiveId = null;
    const setActive = (activeId) => {
      if (activeId === lastActiveId) return;
      lastActiveId = activeId;
      items.forEach(({ a, id }) => a.setAttribute("aria-current", id === activeId ? "true" : "false"));
    };

    const computeActive = () => {
      const y = window.scrollY + topOffset();
      let active = items[0].id;
      for (const { id, target } of items) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        if (top <= y) active = id;
        else break;
      }
      return active;
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setActive(computeActive()));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    window.addEventListener("resize", onScroll, { passive: true });
  });
}

function initArticleMeta() {
  const pageKey = getPageKeyFromDOM();
  if (pageKey !== "article") return;

  const heroContent = document.querySelector("header.hero .hero__content");
  if (!heroContent) return;
  if (heroContent.querySelector("[data-article-meta]")) return;

  const lang = getLangFromPath(location.pathname);

  const posting = findLdJsonByType("BlogPosting");
  const iso = posting?.dateModified || posting?.datePublished || null;
  const formatted = iso ? formatShortDate(iso, lang) : null;

  const proseEls = Array.from(document.querySelectorAll("article .prose"));
  const words = countWords(proseEls.map((el) => el.textContent || "").join(" "));
  const minutes = Math.max(1, Math.ceil(words / 200));

  const metaRow = document.createElement("div");
  metaRow.className = "meta-row";
  metaRow.setAttribute("data-article-meta", "true");

  if (formatted) {
    const updated = document.createElement("span");
    updated.className = "meta-chip";
    updated.textContent = `${t("updatedLabel")}: ${formatted}`;
    metaRow.appendChild(updated);
  }

  if (words >= 120) {
    const read = document.createElement("span");
    read.className = "meta-chip";
    read.textContent = `${minutes} ${t("readTimeUnit")}`;
    metaRow.appendChild(read);
  }

  if (!metaRow.children.length) return;

  const h1 = heroContent.querySelector("h1");
  if (h1 && h1.parentElement === heroContent) h1.insertAdjacentElement("afterend", metaRow);
  else heroContent.appendChild(metaRow);
}

function initBlogSearch() {
  const input = document.querySelector("[data-blog-search]");
  const cards = Array.from(document.querySelectorAll("[data-blog-card]"));
  if (!input || !cards.length) return;

  const filter = () => {
    const q = (input.value || "").trim().toLowerCase();
    cards.forEach((c) => {
      const hay = `${c.getAttribute("data-title") || ""} ${(c.getAttribute("data-tags") || "")}`.toLowerCase();
      c.hidden = q ? !hay.includes(q) : false;
    });
  };

  input.addEventListener("input", filter);
  // Optional: prefill from ?q= for simple cross-page search (Home -> Blog hub).
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) {
    input.value = q;
    filter();
  }
}

function initHomeFilters() {
  const grid = document.querySelector("[data-filter-grid]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-filter-card]"));
  const checkboxes = Array.from(document.querySelectorAll("[data-filter]"));
  if (!cards.length || !checkboxes.length) return;

  const resetBtn = document.querySelector("[data-filter-reset]");

  const getActive = () => {
    const active = { usage: new Set(), brand: new Set(), budget: new Set() };
    checkboxes.forEach((cb) => {
      if (!(cb instanceof HTMLInputElement)) return;
      if (!cb.checked) return;
      const group = cb.getAttribute("data-filter-group");
      const value = cb.getAttribute("data-filter");
      if (group && value && active[group]) active[group].add(value);
    });
    return active;
  };

  const matchesSet = (value, set) => {
    if (!set.size) return true;
    const tokens = String(value)
      .split(/[,\s]+/g)
      .map((t) => t.trim())
      .filter(Boolean);
    return tokens.some((t) => set.has(t));
  };

  const apply = () => {
    const active = getActive();
    cards.forEach((c) => {
      const usage = c.getAttribute("data-usage") || "";
      const brand = c.getAttribute("data-brand") || "";
      const budget = c.getAttribute("data-budget") || "";
      const show =
        matchesSet(usage, active.usage) && matchesSet(brand, active.brand) && matchesSet(budget, active.budget);
      c.hidden = !show;
    });

    if (resetBtn instanceof HTMLButtonElement) {
      const any = checkboxes.some((cb) => cb instanceof HTMLInputElement && cb.checked);
      resetBtn.disabled = !any;
    }
  };

  checkboxes.forEach((cb) => cb.addEventListener("change", apply));
  if (resetBtn instanceof HTMLButtonElement) {
    resetBtn.addEventListener("click", () => {
      checkboxes.forEach((cb) => {
        if (cb instanceof HTMLInputElement) cb.checked = false;
      });
      apply();
    });
  }
  apply();
}

function initResponsiveTables() {
  const wrappers = Array.from(document.querySelectorAll(".table-scroll"));
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const table = wrapper.querySelector("table");
    if (!table) return;

    const headerRow = table.querySelector("thead tr");
    if (!headerRow) return;

    const headers = Array.from(headerRow.querySelectorAll("th, td"))
      .map((h) => (h.textContent || "").trim().replace(/\s+/g, " "))
      .filter(Boolean);
    if (!headers.length) return;

    // Enable the mobile “cards” layout only when JS is available (and only for tables with <thead>).
    wrapper.setAttribute("data-table-mobile", "cards");

    const bothLabel = t("bothLabel") || "Both";

    table.querySelectorAll("tbody tr").forEach((tr) => {
      let colIndex = 0;
      const cells = Array.from(tr.querySelectorAll(":scope > th, :scope > td"));
      cells.forEach((cell) => {
        const spanRaw = cell.getAttribute("colspan");
        const span = spanRaw ? Number.parseInt(spanRaw, 10) : 1;
        const safeSpan = Number.isFinite(span) && span > 0 ? span : 1;

        if (cell instanceof HTMLTableCellElement && cell.tagName === "TD") {
          const label =
            safeSpan > 1 ? bothLabel : headers[colIndex] || "";
          cell.setAttribute("data-label", label);
        }

        colIndex += safeSpan;
      });
    });
  });
}

function initCollapsibles() {
  const detailsEls = Array.from(document.querySelectorAll('details[data-collapsible="preface"]'));
  if (!detailsEls.length) return;

  const openForHash = ({ scrollIfNeeded } = { scrollIfNeeded: false }) => {
    const raw = location.hash || "";
    if (!raw.startsWith("#") || raw.length < 2) return;
    const id = decodeURIComponent(raw.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    const details = target.closest('details[data-collapsible="preface"]');
    if (!details) return;

    const wasClosed = !details.open;
    details.open = true;

    if (scrollIfNeeded && wasClosed) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
      });
    }
  };

  // If a user lands on a deep link, ensure the section is visible.
  openForHash({ scrollIfNeeded: true });

  // If a user clicks a TOC link that targets a collapsed section, open it before the browser scrolls.
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href === "#" || !href.startsWith("#")) return;
    const id = decodeURIComponent(href.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    const details = target.closest('details[data-collapsible="preface"]');
    if (details) details.open = true;
  });

  window.addEventListener("hashchange", () => openForHash({ scrollIfNeeded: false }));
}

// Boot
initThemeToggle();
initCategoryDropdown();
stripLegalLinksFromNav();
initActiveNav();
initHeaderShadow();
initScrollProgress();
initLanguageSwitcher();
initDrawer();
initCarousels();
wireAffiliateLinks();
initCookieUI();
applyConsent();
initBackToTop();
initPrintSupport();
initBlogSearch();
initHomeFilters();
initResponsiveTables();
initCollapsibles();
initTocCollapsibles();
initPageLayouts();
initArticleMeta();
initTocSpy();
