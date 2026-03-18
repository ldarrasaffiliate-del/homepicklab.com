import type { Post } from '@/lib/types';
import {
  UI_TRANSLATIONS,
  airfryersPath,
  blogIndexPath,
  coffeeMachinesPath,
  homePath,
  legalNoticePath,
  normalizeLang,
  privacyPath,
  robotVacuumPath,
  SITE,
} from '@/lib/site';

const BASE_URL = SITE.baseUrl;

export function buildArticleJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const published = post.date ?? post.updatedAt ?? new Date().toISOString();
  const modified = post.updatedAt ?? published;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    mainEntityOfPage: url,
    datePublished: published,
    dateModified: modified,
    author: [{ '@type': 'Organization', name: SITE.brandName }],
    publisher: { '@type': 'Organization', name: SITE.brandName },
  };
}

function normalizePathname(pathname: string): string {
  let path = pathname || '/';
  if (path !== '/') path = path.replace(/\/+$/, '');
  return path.replace(/\.html$/, '');
}

function ensureTrailingSlash(pathname: string): string {
  const path = pathname || '/';
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function canonicalPathFromPost(post: Post): string {
  const raw = post.canonical ?? `/${post.slug}`;
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  return ensureTrailingSlash(withLeading);
}

type Crumb = { name: string; path: string };

function getKeyedCrumbs(post: Post, lang: ReturnType<typeof normalizeLang>): Crumb[] | null {
  const ui = UI_TRANSLATIONS[lang];
  const home: Crumb = { name: ui.home, path: homePath(lang) };
  const key = post.translationKey;

  if (key === 'home') return [home];
  if (key === 'blog_index') return [home, { name: ui.blog, path: blogIndexPath(lang) }];
  if (key === 'robot_vacuum_mop') return [home, { name: ui.robotVacuums, path: robotVacuumPath(lang) }];
  if (key === 'automatic_coffee_machines') return [home, { name: ui.coffeeMachines, path: coffeeMachinesPath(lang) }];
  if (key === 'airfryers') return [home, { name: ui.airfryers, path: airfryersPath(lang) }];
  if (key === 'legal_notice') return [home, { name: ui.legal, path: legalNoticePath(lang) }];
  if (key === 'privacy_policy') return [home, { name: ui.privacy, path: privacyPath(lang) }];

  return null;
}

function inferParentCrumb(post: Post, lang: ReturnType<typeof normalizeLang>): Crumb | null {
  const ui = UI_TRANSLATIONS[lang];
  const internal = new Set((post.internalLinks ?? []).map((l) => normalizePathname(l.href)));

  const robot = normalizePathname(robotVacuumPath(lang));
  if (internal.has(robot)) return { name: ui.robotVacuums, path: robotVacuumPath(lang) };

  const coffee = normalizePathname(coffeeMachinesPath(lang));
  if (internal.has(coffee)) return { name: ui.coffeeMachines, path: coffeeMachinesPath(lang) };

  const air = normalizePathname(airfryersPath(lang));
  if (internal.has(air)) return { name: ui.airfryers, path: airfryersPath(lang) };

  const blog = normalizePathname(blogIndexPath(lang));
  if (internal.has(blog)) return { name: ui.blog, path: blogIndexPath(lang) };

  return null;
}

export function buildBreadcrumbJsonLd(post: Post) {
  const lang = normalizeLang(post.lang);
  const url = new URL(canonicalPathFromPost(post), BASE_URL).toString();

  const keyed = getKeyedCrumbs(post, lang);
  if (keyed) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: keyed.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: c.name,
        item: new URL(c.path, BASE_URL).toString(),
      })),
    };
  }

  const home: Crumb = { name: UI_TRANSLATIONS[lang].home, path: homePath(lang) };
  const crumbs: Crumb[] = [home];

  const parent = inferParentCrumb(post, lang);
  if (parent) crumbs.push(parent);

  crumbs.push({ name: post.title, path: canonicalPathFromPost(post) });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.name,
      item: idx === crumbs.length - 1 ? url : new URL(c.path, BASE_URL).toString(),
    })),
  };
}
