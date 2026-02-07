/* HomePicksLab.com — main JS (vanilla, small, consent-aware).
   - No auto language redirects (selector only).
   - Affiliate links are generated per language.
   - GA4 loads only after Analytics consent.
   - YouTube embeds are blocked unless External media consent (or session grant). */

const SITE_ORIGIN = "https://homepickslab.com";
const GA4_MEASUREMENT_ID = "G-W6JW3C08M3";
const CONSENT_STORAGE_KEY = "hpl_consent_v1";
const EXTERNAL_MEDIA_SESSION_KEY = "hpl_external_media_session";

const I18N = {
  en: {
    videoPlaceholderTitle: "Click to load video",
    videoPlaceholderBody: "External media (YouTube) is blocked until you allow it.",
    videoPlaceholderCta: "Load video",
  },
  fr: {
    videoPlaceholderTitle: "Cliquer pour charger la vidéo",
    videoPlaceholderBody: "Les médias externes (YouTube) sont bloqués tant que vous ne les autorisez pas.",
    videoPlaceholderCta: "Charger la vidéo",
  },
  es: {
    videoPlaceholderTitle: "Haz clic para cargar el vídeo",
    videoPlaceholderBody: "Los medios externos (YouTube) están bloqueados hasta que los permitas.",
    videoPlaceholderCta: "Cargar vídeo",
  },
  de: {
    videoPlaceholderTitle: "Klicken, um das Video zu laden",
    videoPlaceholderBody: "Externe Medien (YouTube) sind blockiert, bis du sie erlaubst.",
    videoPlaceholderCta: "Video laden",
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

function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
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
}

function initCarousels() {
  const carousels = document.querySelectorAll(".carousel");
  if (!carousels.length) return;

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

    if (viewportForHydration && dotsForHydration && prefix && Number.isFinite(count) && !viewportForHydration.children.length) {
      for (let i = 1; i <= count; i++) {
        const fig = document.createElement("figure");
        fig.className = "carousel__slide";

        const img = document.createElement("img");
        img.src = `/images/${prefix}${i}.jpg`;
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 1200;
        img.height = 900;
        img.alt = altTemplate.replace("{n}", String(i));

        fig.appendChild(img);
        viewportForHydration.appendChild(fig);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to slide ${i}`);
        dot.setAttribute("aria-current", i === 1 ? "true" : "false");
        dotsForHydration.appendChild(dot);
      }
    }

    const viewport = root.querySelector(".carousel__viewport");
    const slides = Array.from(root.querySelectorAll(".carousel__slide"));
    const prevBtn = root.querySelector('[data-carousel="prev"]');
    const nextBtn = root.querySelector('[data-carousel="next"]');
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
  };

  checkboxes.forEach((cb) => cb.addEventListener("change", apply));
  apply();
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
initLanguageSwitcher();
initDrawer();
initCarousels();
wireAffiliateLinks();
initCookieUI();
applyConsent();
initBlogSearch();
initHomeFilters();
initCollapsibles();
