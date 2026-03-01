'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { blogIndexPath, getLangFromPathname, legalNoticePath, privacyPath, SITE, UI_TRANSLATIONS } from '@/lib/site';

export function SiteFooter() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  return (
    <footer className="footer">
      <div className="footer-inner">
        © {new Date().getFullYear()} — {SITE.brandName} · <Link href={blogIndexPath(lang)}>{t.blog}</Link> ·{' '}
        <Link href={legalNoticePath(lang)}>{t.legal}</Link> · <Link href={privacyPath(lang)}>{t.privacy}</Link>
      </div>
    </footer>
  );
}
