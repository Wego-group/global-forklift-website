import { getCollection } from "astro:content";
import type { Lang } from "@data/languages";

let newsArticlesPromise: Promise<NewsArticle[]> | undefined;

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

async function loadNewsArticles(): Promise<NewsArticle[]> {
  const legacyArticles = await getCollection("news");

  return legacyArticles.map<NewsArticle>((entry) => ({
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
  })).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
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
