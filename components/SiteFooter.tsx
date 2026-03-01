'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { airfryersPath, blogIndexPath, coffeeMachinesPath, getLangFromPathname, legalNoticePath, privacyPath, robotVacuumPath, SITE, UI_TRANSLATIONS } from '@/lib/site';

const OPEN_COOKIE_SETTINGS_EVENT = 'hpl-open-cookie-settings';

export function SiteFooter() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">
        <div className="stack">
          <strong>{SITE.domain}</strong>
          <div className="tiny muted">
            As an Amazon Associate, HomePicksLab.com earns from qualifying purchases.
            {t.amazonAssociateLocal ? (
              <>
                <br />
                {t.amazonAssociateLocal}
              </>
            ) : null}
          </div>
          <div className="tiny muted">{t.trademarkDisclosure}</div>
        </div>

        <div className="stack">
          <div aria-label={t.footerLinksLabel} className="footer-links">
            <Link href={robotVacuumPath(lang)}>{t.robotVacuums}</Link>
            <Link href={coffeeMachinesPath(lang)}>{t.coffeeMachines}</Link>
            <Link href={airfryersPath(lang)}>{t.airfryers}</Link>
            <Link href={blogIndexPath(lang)}>{t.blog}</Link>
            <Link href={legalNoticePath(lang)}>{t.legal}</Link>
            <Link href={privacyPath(lang)}>{t.privacy}</Link>
            <button
              onClick={() => {
                try {
                  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
                } catch {
                  // ignore
                }
              }}
              type="button"
            >
              {t.manageCookies}
            </button>
          </div>
          <div className="tiny muted">{t.footerMeta}</div>
        </div>
      </div>
    </footer>
  );
}

