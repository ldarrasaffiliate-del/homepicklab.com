'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LanguageSelect } from '@/components/LanguageSelect';
import { blogIndexPath, getLangFromPathname, homePath, robotVacuumPath, SITE, UI_TRANSLATIONS } from '@/lib/site';

function normalizePath(pathname: string): string {
  let path = pathname || '/';
  if (path !== '/') path = path.replace(/\/+$/, '');
  return path || '/';
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = useMemo(
    () => [
      { href: homePath(lang), label: t.home },
      { href: robotVacuumPath(lang), label: t.robotVacuums },
      { href: blogIndexPath(lang), label: t.blog },
    ],
    [lang, t.blog, t.home, t.robotVacuums],
  );

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const apply = () => {
      header.classList.toggle('site-header--scrolled', window.scrollY > 6);
    };

    apply();
    window.addEventListener('scroll', apply, { passive: true });
    return () => window.removeEventListener('scroll', apply);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const normalizedPathname = normalizePath(pathname);
  function ariaCurrent(href: string) {
    const normalizedHref = normalizePath(href);
    if (normalizedHref === '/' && normalizedPathname === '/') return 'page';
    if (normalizedHref !== '/' && normalizedPathname === normalizedHref) return 'page';
    return undefined;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {t.skipToContent}
      </a>

      <header className="site-header">
        <div className="container nav">
          <Link aria-label={`${SITE.brandName} ${t.home}`} className="brand" href={homePath(lang)}>
            <img
              alt={SITE.brandName}
              className="brand__logo"
              decoding="async"
              fetchPriority="high"
              height={32}
              src="/images/homepickslab-logo.png"
              width={156}
            />
          </Link>

          <nav aria-label={t.primaryNavLabel} className="nav__links">
            {links.map((l) => (
              <Link key={l.href} aria-current={ariaCurrent(l.href)} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav__right">
            <LanguageSelect />
            <button
              aria-controls="drawer"
              aria-expanded={drawerOpen}
              aria-label={t.openMenu}
              className="icon-btn nav__burger"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={drawerOpen ? 'false' : 'true'}
        className="drawer"
        id="drawer"
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawerOpen(false);
        }}
      >
        <div aria-label={t.menu} aria-modal="true" className="drawer__panel" role="dialog">
          <div className="drawer__top">
            <span className="badge">{SITE.brandName}</span>
            <button aria-label={t.closeMenu} className="icon-btn" onClick={() => setDrawerOpen(false)} type="button">
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

          <nav aria-label={t.mobileNavLabel} className="drawer__nav">
            {links.map((l) => (
              <Link key={l.href} aria-current={ariaCurrent(l.href)} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="tiny muted">
            As an Amazon Associate, HomePicksLab.com earns from qualifying purchases.
            {t.amazonAssociateLocal ? (
              <>
                <br />
                {t.amazonAssociateLocal}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

