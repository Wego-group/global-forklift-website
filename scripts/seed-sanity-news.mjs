import { createReadStream, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { parse } from "yaml";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "oingo0yd";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  throw new Error("Set SANITY_WRITE_TOKEN before running the news migration.");
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-27",
  useCdn: false
});

const root = process.cwd();
const sourceDirectory = join(root, "src", "content", "news");
const languages = ["en", "es", "fr", "ja", "de", "pt", "ko", "ar"];

function readLegacyArticle(filename) {
  const source = readFileSync(join(sourceDirectory, filename), "utf8");
  const match = source.match(/^---\n([\s\S]+?)\n---/);
  if (!match) throw new Error(`Missing front matter in ${filename}`);
  return parse(match[1]);
}

function portableText(paragraphs, language) {
  return paragraphs.map((text, index) => ({
    _type: "block",
    _key: `${language}-paragraph-${index + 1}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${language}-span-${index + 1}`, text, marks: [] }]
  }));
}

async function uploadCover(path) {
  return client.assets.upload("image", createReadStream(join(root, "public", path)), {
    filename: basename(path)
  });
}

const articles = readdirSync(sourceDirectory)
  .filter((filename) => filename.endsWith(".md"))
  .sort()
  .map(readLegacyArticle);

const covers = new Map();
for (const article of articles) {
  if (!covers.has(article.cover)) covers.set(article.cover, await uploadCover(article.cover));
}

let transaction = client.transaction();
for (const article of articles) {
  for (const language of languages) {
    transaction = transaction.createOrReplace({
      _id: `news.${article.translationKey}.${language}`,
      _type: "newsArticle",
      title: article.title[language],
      slug: { _type: "slug", current: article.permalink },
      excerpt: article.excerpt[language],
      body: portableText(article.body[language], language),
      cover: {
        _type: "image",
        asset: { _type: "reference", _ref: covers.get(article.cover)._id }
      },
      coverAlt: article.title[language],
      seoTitle: article.seoTitle[language],
      seoDescription: article.seoDescription[language],
      language,
      translationKey: article.translationKey,
      category: article.category,
      author: article.author,
      publishedAt: new Date(article.publishedAt).toISOString(),
      updatedAt: new Date(article.updatedAt).toISOString(),
      relatedCategories: article.relatedCategories || [],
      featured: Boolean(article.featured)
    });
  }
}

await transaction.commit();
console.log(`Migrated ${articles.length} articles in ${languages.length} languages to Sanity.`);
