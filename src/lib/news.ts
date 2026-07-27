import { getCollection } from "astro:content";
import { toHTML } from "@portabletext/to-html";
import { createClient } from "@sanity/client";
import type { Lang } from "@data/languages";

const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || "oingo0yd";
const sanityDataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";
const sanityApiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || "2026-07-27";

const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false
});

let newsArticlesPromise: Promise<NewsArticle[]> | undefined;

const newsQuery = `*[_type == "newsArticle" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  translationKey,
  language,
  "slug": slug.current,
  title,
  excerpt,
  body,
  "cover": cover.asset->url,
  coverAlt,
  category,
  author,
  publishedAt,
  updatedAt,
  seoTitle,
  seoDescription,
  relatedCategories,
  featured
}`;

type NewsLocalization = {
  language: Lang;
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  bodyHtml: string;
  coverAlt: string;
};

export type NewsArticle = {
  key: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  relatedCategories: string[];
  featured: boolean;
  localizations: Partial<Record<Lang, NewsLocalization>>;
};

export type NewsArticleView = Omit<NewsArticle, "localizations"> & NewsLocalization;

type SanityNewsRecord = {
  _id: string;
  translationKey?: string;
  language?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: unknown[];
  cover?: string;
  coverAlt?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedCategories?: string[];
  featured?: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character] || character);
}

function paragraphsToHtml(paragraphs: string[]) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function portableTextToHtml(blocks: unknown[] | undefined) {
  if (!blocks?.length) return "";

  try {
    return toHTML(blocks as Parameters<typeof toHTML>[0]);
  } catch {
    return "";
  }
}

function asLang(value: string | undefined): Lang | undefined {
  const supported: Lang[] = ["en", "es", "fr", "ja", "de", "pt", "ko", "ar"];
  return supported.includes(value as Lang) ? (value as Lang) : undefined;
}

function asDate(value: string | undefined) {
  return value || new Date().toISOString();
}

function createArticle(record: SanityNewsRecord): NewsArticle {
  const language = asLang(record.language) || "en";
  const title = record.title?.trim() || "WEGO Forklift News";
  const excerpt = record.excerpt?.trim() || "Latest update from WEGO Forklift.";
  const slug = record.slug?.trim() || record._id;

  return {
    key: record.translationKey?.trim() || record._id,
    category: record.category?.trim() || "news",
    author: record.author?.trim() || "WEGO Forklift",
    publishedAt: asDate(record.publishedAt),
    updatedAt: asDate(record.updatedAt || record.publishedAt),
    cover: record.cover || "/images/home/wego-forklift-series-hero.jpg",
    relatedCategories: record.relatedCategories || [],
    featured: Boolean(record.featured),
    localizations: {
      [language]: {
        language,
        slug,
        title,
        excerpt,
        seoTitle: record.seoTitle?.trim() || `${title} | WEGO Forklift`,
        seoDescription: record.seoDescription?.trim() || excerpt,
        bodyHtml: portableTextToHtml(record.body) || `<p>${escapeHtml(excerpt)}</p>`,
        coverAlt: record.coverAlt?.trim() || title
      }
    }
  };
}

function mergeArticles(records: SanityNewsRecord[]) {
  const grouped = new Map<string, NewsArticle>();

  for (const record of records) {
    const article = createArticle(record);
    const existing = grouped.get(article.key);
    if (!existing) {
      grouped.set(article.key, article);
      continue;
    }

    Object.assign(existing.localizations, article.localizations);
    existing.publishedAt = article.publishedAt < existing.publishedAt ? article.publishedAt : existing.publishedAt;
    existing.updatedAt = article.updatedAt > existing.updatedAt ? article.updatedAt : existing.updatedAt;
    if (article.cover && existing.cover.startsWith("/images/home/")) existing.cover = article.cover;
  }

  return [...grouped.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function getLegacyNews(): Promise<NewsArticle[]> {
  const legacyArticles = await getCollection("news");

  return legacyArticles.map((entry) => ({
    key: entry.data.translationKey,
    category: entry.data.category,
    author: entry.data.author,
    publishedAt: entry.data.publishedAt.toISOString(),
    updatedAt: entry.data.updatedAt.toISOString(),
    cover: entry.data.cover,
    relatedCategories: entry.data.relatedCategories,
    featured: entry.data.featured,
    localizations: {
      en: {
        language: "en",
        slug: entry.data.permalink,
        title: entry.data.title.en,
        excerpt: entry.data.excerpt.en,
        seoTitle: entry.data.seoTitle.en,
        seoDescription: entry.data.seoDescription.en,
        bodyHtml: paragraphsToHtml(entry.data.body.en),
        coverAlt: entry.data.title.en
      },
      es: {
        language: "es",
        slug: entry.data.permalink,
        title: entry.data.title.es,
        excerpt: entry.data.excerpt.es,
        seoTitle: entry.data.seoTitle.es,
        seoDescription: entry.data.seoDescription.es,
        bodyHtml: paragraphsToHtml(entry.data.body.es),
        coverAlt: entry.data.title.es
      },
      fr: {
        language: "fr",
        slug: entry.data.permalink,
        title: entry.data.title.fr,
        excerpt: entry.data.excerpt.fr,
        seoTitle: entry.data.seoTitle.fr,
        seoDescription: entry.data.seoDescription.fr,
        bodyHtml: paragraphsToHtml(entry.data.body.fr),
        coverAlt: entry.data.title.fr
      },
      ja: {
        language: "ja",
        slug: entry.data.permalink,
        title: entry.data.title.ja,
        excerpt: entry.data.excerpt.ja,
        seoTitle: entry.data.seoTitle.ja,
        seoDescription: entry.data.seoDescription.ja,
        bodyHtml: paragraphsToHtml(entry.data.body.ja),
        coverAlt: entry.data.title.ja
      },
      de: {
        language: "de",
        slug: entry.data.permalink,
        title: entry.data.title.de,
        excerpt: entry.data.excerpt.de,
        seoTitle: entry.data.seoTitle.de,
        seoDescription: entry.data.seoDescription.de,
        bodyHtml: paragraphsToHtml(entry.data.body.de),
        coverAlt: entry.data.title.de
      },
      pt: {
        language: "pt",
        slug: entry.data.permalink,
        title: entry.data.title.pt,
        excerpt: entry.data.excerpt.pt,
        seoTitle: entry.data.seoTitle.pt,
        seoDescription: entry.data.seoDescription.pt,
        bodyHtml: paragraphsToHtml(entry.data.body.pt),
        coverAlt: entry.data.title.pt
      },
      ko: {
        language: "ko",
        slug: entry.data.permalink,
        title: entry.data.title.ko,
        excerpt: entry.data.excerpt.ko,
        seoTitle: entry.data.seoTitle.ko,
        seoDescription: entry.data.seoDescription.ko,
        bodyHtml: paragraphsToHtml(entry.data.body.ko),
        coverAlt: entry.data.title.ko
      },
      ar: {
        language: "ar",
        slug: entry.data.permalink,
        title: entry.data.title.ar,
        excerpt: entry.data.excerpt.ar,
        seoTitle: entry.data.seoTitle.ar,
        seoDescription: entry.data.seoDescription.ar,
        bodyHtml: paragraphsToHtml(entry.data.body.ar),
        coverAlt: entry.data.title.ar
      }
    }
  }));
}

async function loadNewsArticles() {
  try {
    const records = await sanityClient.fetch<SanityNewsRecord[]>(newsQuery);
    if (records.length) return mergeArticles(records);
  } catch (error) {
    console.warn("Sanity news query failed; using local news fallback.", error);
  }

  return getLegacyNews();
}

export function getNewsArticles() {
  newsArticlesPromise ||= loadNewsArticles();
  return newsArticlesPromise;
}

export function localizeNewsArticle(article: NewsArticle, lang: Lang): NewsArticleView {
  const localization = article.localizations[lang] || article.localizations.en || Object.values(article.localizations)[0];
  if (!localization) throw new Error(`News article ${article.key} has no localization.`);
  return { ...article, ...localization };
}

export function getNewsForLanguage(articles: NewsArticle[], lang: Lang) {
  return articles.map((article) => localizeNewsArticle(article, lang));
}

export function findNewsArticle(articles: NewsArticle[], lang: Lang, slug: string | undefined) {
  return getNewsForLanguage(articles, lang).find((article) => article.slug === slug);
}
