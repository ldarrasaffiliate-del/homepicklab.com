'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lang } from '@/lib/site';
import { getLangFromPathname, privacyPath, UI_TRANSLATIONS } from '@/lib/site';

type Consent = {
  analytics: boolean;
  externalMedia: boolean;
  ts: number;
};

const GA4_MEASUREMENT_ID = 'G-W6JW3C08M3';
const CONSENT_STORAGE_KEY = 'hpl_consent_v1';
const EXTERNAL_MEDIA_SESSION_KEY = 'hpl_external_media_session';
const OPEN_COOKIE_SETTINGS_EVENT = 'hpl-open-cookie-settings';

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.analytics !== 'boolean') return null;
    if (typeof parsed.externalMedia !== 'boolean') return null;
    return {
      analytics: parsed.analytics,
      externalMedia: parsed.externalMedia,
      ts: typeof parsed.ts === 'number' ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

function storeConsent(consent: Pick<Consent, 'analytics' | 'externalMedia'>) {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ analytics: Boolean(consent.analytics), externalMedia: Boolean(consent.externalMedia), ts: Date.now() }),
  );
}

function hasExternalMediaConsent(consent: Consent | null): boolean {
  if (consent?.externalMedia) return true;
  try {
    return sessionStorage.getItem(EXTERNAL_MEDIA_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function loadGA4() {
  try {
    if (!GA4_MEASUREMENT_ID) return;
    const w = window as any;
    if (w.__hpl_ga_loaded) return;
    w.__hpl_ga_loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    w.dataLayer = w.dataLayer || [];
    w.gtag =
      w.gtag ||
      function gtag() {
        w.dataLayer.push(arguments);
      };
    w.gtag('js', new Date());
    w.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
  } catch {
    // ignore
  }
}

function renderYouTubeEmbeds(lang: Lang, consent: Consent | null) {
  const t = UI_TRANSLATIONS[lang];
  const allowed = hasExternalMediaConsent(consent);

  document.querySelectorAll<HTMLElement>('[data-youtube-id]').forEach((wrap) => {
    const id = wrap.getAttribute('data-youtube-id');
    const title = wrap.getAttribute('data-youtube-title') || 'YouTube video';
    const ratio = wrap.querySelector<HTMLElement>('.video__ratio');
    if (!id || !ratio) return;

    if (!allowed) {
      ratio.innerHTML = `
        <div class="video__placeholder">
          <strong>${t.videoPlaceholderTitle}</strong>
          <div class="tiny">${t.videoPlaceholderBody}</div>
          <div class="video__actions">
            <button class="btn btn--primary btn--small" type="button" data-load-video>${t.videoPlaceholderCta}</button>
          </div>
        </div>
      `;
      const btn = ratio.querySelector<HTMLButtonElement>('[data-load-video]');
      btn?.addEventListener('click', () => {
        try {
          sessionStorage.setItem(EXTERNAL_MEDIA_SESSION_KEY, '1');
        } catch {
          // ignore
        }
        renderYouTubeEmbeds(lang, consent);
      });
      return;
    }

    if (ratio.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.title = title;
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`;
    ratio.innerHTML = '';
    ratio.appendChild(iframe);
  });
}

export function CookieBanner() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const [consent, setConsent] = useState<Consent | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [externalMedia, setExternalMedia] = useState(false);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setBannerVisible(!stored);

    if (stored?.analytics) loadGA4();
    renderYouTubeEmbeds(lang, stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderYouTubeEmbeds(lang, consent);
  }, [lang, pathname, consent]);

  useEffect(() => {
    const onOpenSettings = () => {
      const stored = readConsent();
      setAnalytics(Boolean(stored?.analytics));
      setExternalMedia(Boolean(stored?.externalMedia));
      setModalOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus?.();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  function applyAndClose(next: Pick<Consent, 'analytics' | 'externalMedia'>) {
    try {
      storeConsent(next);
    } catch {
      // ignore
    }

    const stored: Consent = { analytics: Boolean(next.analytics), externalMedia: Boolean(next.externalMedia), ts: Date.now() };
    setConsent(stored);
    setBannerVisible(false);
    setModalOpen(false);

    if (stored.analytics) loadGA4();
    renderYouTubeEmbeds(lang, stored);
  }

  return (
    <>
      <div className="cookie-banner" hidden={!bannerVisible} id="cookieBanner">
        <div aria-label={t.cookieAria} className="container cookie-banner__inner" role="dialog">
          <div className="stack stack--tight">
            <strong>{t.cookieTitle}</strong>
            <div className="tiny muted">
              {t.cookieTextBefore} <strong>{t.cookieTextAnalytics}</strong> {t.cookieTextAnd}{' '}
              <strong>{t.cookieTextExternal}</strong> <Link href={privacyPath(lang)}>{t.privacy}</Link>.
            </div>
          </div>
          <div className="cookie-banner__actions">
            <button className="btn btn--primary" onClick={() => applyAndClose({ analytics: true, externalMedia: true })} type="button">
              {t.acceptAll}
            </button>
            <button className="btn" onClick={() => applyAndClose({ analytics: false, externalMedia: false })} type="button">
              {t.rejectAll}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setAnalytics(Boolean(consent?.analytics));
                setExternalMedia(Boolean(consent?.externalMedia));
                setModalOpen(true);
              }}
              type="button"
            >
              {t.customize}
            </button>
          </div>
        </div>
      </div>

      <div
        aria-hidden={modalOpen ? 'false' : 'true'}
        className="modal"
        id="cookieModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookieTitle"
      >
        <div className="modal__panel" role="document">
          <div className="modal__head">
            <div className="stack stack--tight">
              <strong id="cookieTitle">{t.cookieSettingsTitle}</strong>
              <div className="tiny muted">{t.cookieSettingsSubtitle}</div>
            </div>
            <button
              aria-label={t.close}
              className="icon-btn"
              onClick={() => setModalOpen(false)}
              ref={closeBtnRef}
              type="button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="modal__body">
            <div className="toggle">
              <div className="toggle__row">
                <div>
                  <strong>{t.necessary}</strong>
                  <div className="tiny muted">{t.necessaryDesc}</div>
                </div>
                <input type="checkbox" checked disabled aria-label="Necessary cookies always on" />
              </div>
            </div>

            <div className="toggle">
              <div className="toggle__row">
                <div>
                  <strong>{t.analytics}</strong>
                  <div className="tiny muted">{t.analyticsDesc}</div>
                </div>
                <input
                  checked={analytics}
                  id="consentAnalytics"
                  onChange={(e) => setAnalytics(e.target.checked)}
                  type="checkbox"
                  aria-label="Allow analytics"
                />
              </div>
            </div>

            <div className="toggle">
              <div className="toggle__row">
                <div>
                  <strong>{t.externalMedia}</strong>
                  <div className="tiny muted">{t.externalMediaDesc}</div>
                </div>
                <input
                  checked={externalMedia}
                  id="consentExternalMedia"
                  onChange={(e) => setExternalMedia(e.target.checked)}
                  type="checkbox"
                  aria-label="Allow external media"
                />
              </div>
            </div>

            <div className="cookie-banner__actions">
              <button className="btn btn--primary" onClick={() => applyAndClose({ analytics, externalMedia })} type="button">
                {t.save}
              </button>
              <button className="btn" onClick={() => setModalOpen(false)} type="button">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
