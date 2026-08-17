import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const projectRoot = process.cwd();
const queueRoot = path.join(projectRoot, "news-queue");
const publishedRoot = path.join(projectRoot, "news-published");
const failedRoot = path.join(projectRoot, "news-failed");
const contentRoot = path.join(projectRoot, "src", "content", "news");
const publicNewsRoot = path.join(projectRoot, "public", "images", "news");
const supportedLanguages = ["en", "es", "fr", "ja", "de", "pt", "ko", "ar"];
const localizedKeys = ["title", "excerpt", "seoTitle", "seoDescription"];
const fixedPublishTime = "22:00:00+08:00";
const validateOnly = process.argv.includes("--validate-only");
const categoryValues = new Set(["news", "events", "product-guide", "delivery-case", "technical-guide"]);
const categorySlugs = new Set(["lithium-electric-forklifts", "diesel-forklifts", "heavy-duty-forklifts", "rough-terrain-forklifts", "electric-pallet-stackers"]);
const coverMaxBytes = 1_500_000;
const validatedArticleBodies = [];
let sharpPromise;

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) {
    throw new Error("article.md is missing YAML frontmatter.");
  }

  return YAML.parse(match[1]);
}

function ensureLocalizedField(value, fieldName) {
  if (!value || typeof value !== "object") {
    throw new Error(`Field "${fieldName}" must contain at least an English entry.`);
  }

  if (typeof value.en !== "string" || !value.en.trim()) {
    throw new Error(`Field "${fieldName}.en" is required.`);
  }
}

function ensureBody(value) {
  if (!value || typeof value !== "object") {
    throw new Error('Field "body" must contain at least an English entry.');
  }

  if (!Array.isArray(value.en) || value.en.length !== 5) {
    throw new Error('Field "body.en" must contain exactly 5 SEO paragraphs.');
  }
  if (value.en.some((paragraph) => typeof paragraph !== "string" || !paragraph.trim())) {
    throw new Error('Field "body.en" can only contain non-empty paragraphs.');
  }

  const normalizedParagraphs = value.en.map(normalizeText);
  if (new Set(normalizedParagraphs).size !== normalizedParagraphs.length) {
    throw new Error('Field "body.en" contains repeated paragraphs.');
  }

  if (normalizedParagraphs.join(" ").length < 650) {
    throw new Error('Field "body.en" is too thin; provide practical, topic-specific buyer information.');
  }
}

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function ensureSeoLengths(article) {
  const titleLength = article.seoTitle.en.trim().length;
  const descriptionLength = article.seoDescription.en.trim().length;

  if (titleLength < 30 || titleLength > 70) {
    throw new Error(`Field "seoTitle.en" must contain 30-70 characters; received ${titleLength}.`);
  }
  if (descriptionLength < 100 || descriptionLength > 180) {
    throw new Error(`Field "seoDescription.en" must contain 100-180 characters; received ${descriptionLength}.`);
  }
}

function fillLocalizedString(value) {
  const english = value.en.trim();
  return Object.fromEntries(
    supportedLanguages.map((language) => [language, typeof value[language] === "string" && value[language].trim() ? value[language].trim() : english])
  );
}

function fillLocalizedBody(value) {
  const english = value.en.map((paragraph) => paragraph.trim());
  return Object.fromEntries(
    supportedLanguages.map((language) => {
      const paragraphs = Array.isArray(value[language]) && value[language].length
        ? value[language].map((paragraph) => String(paragraph).trim()).filter(Boolean)
        : english;
      return [language, paragraphs];
    })
  );
}

function expandArticle(article) {
  return {
    ...article,
    title: fillLocalizedString(article.title),
    excerpt: fillLocalizedString(article.excerpt),
    seoTitle: fillLocalizedString(article.seoTitle),
    seoDescription: fillLocalizedString(article.seoDescription),
    body: fillLocalizedBody(article.body)
  };
}

function ensureCrossArticleDiversity(article, articleName) {
  for (const previous of validatedArticleBodies) {
    for (const language of supportedLanguages) {
      const currentParagraphs = new Set(article.body[language].map(normalizeText));
      const sharedParagraphs = previous.body[language].filter((paragraph) => currentParagraphs.has(paragraph)).length;
      if (sharedParagraphs > 2) {
        throw new Error(`Field "body.${language}" shares ${sharedParagraphs} full paragraphs with "${previous.name}"; rewrite the article around its own buyer intent.`);
      }
    }
  }
  validatedArticleBodies.push({
    name: articleName,
    body: Object.fromEntries(supportedLanguages.map((language) => [language, article.body[language].map(normalizeText)]))
  });
}

function sanitizeFileSegment(value) {
  return value.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function loadSharp() {
  sharpPromise ||= import("sharp").then((module) => module.default);
  return sharpPromise;
}

function publishDateFromFolderName(packageName) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(packageName)) {
    throw new Error('Folder name must be the publish date in "YYYY-MM-DD" format.');
  }

  const publishAt = new Date(`${packageName}T${fixedPublishTime}`);
  if (Number.isNaN(publishAt.getTime())) {
    throw new Error(`Folder date "${packageName}" is invalid.`);
  }
  return publishAt;
}

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(queueRoot, { recursive: true }),
    fs.mkdir(publishedRoot, { recursive: true }),
    fs.mkdir(failedRoot, { recursive: true }),
    fs.mkdir(contentRoot, { recursive: true }),
    fs.mkdir(publicNewsRoot, { recursive: true })
  ]);
}

async function readQueuePackages() {
  const entries = await fs.readdir(queueRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

async function moveDirectory(source, targetRoot, name) {
  const target = path.join(targetRoot, name);
  await fs.rm(target, { recursive: true, force: true });
  await fs.rename(source, target);
}

async function copyCoverIfNeeded(packageDir, permalink, coverValue) {
  if (typeof coverValue !== "string" || !coverValue.trim()) return "";

  if (!coverValue.startsWith("./")) {
    return coverValue;
  }

  const source = path.join(packageDir, coverValue.slice(2));
  const sourceStats = await fs.stat(source).catch(() => null);
  if (!sourceStats?.isFile()) {
    throw new Error(`Cover file "${coverValue}" does not exist in the package folder.`);
  }

  const targetName = `${sanitizeFileSegment(permalink)}.webp`;
  const target = path.join(publicNewsRoot, targetName);
  const sharp = await loadSharp();
  await sharp(source)
    .rotate()
    .resize({ width: 1920, height: 1440, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(target);

  const [metadata, outputStats] = await Promise.all([sharp(target).metadata(), fs.stat(target)]);
  if (!metadata.width || metadata.width < 1200) {
    throw new Error("Cover image must be at least 1200 pixels wide after optimization.");
  }
  if (outputStats.size > coverMaxBytes) {
    throw new Error(`Optimized cover exceeds ${coverMaxBytes} bytes; use a simpler or cleaner source image.`);
  }
  return `/images/news/${targetName}`;
}

async function validateCoverSource(packageDir, coverValue) {
  if (typeof coverValue !== "string" || !coverValue.trim()) return;
  if (!coverValue.startsWith("./")) return;

  const source = path.join(packageDir, coverValue.slice(2));
  const sourceStats = await fs.stat(source).catch(() => null);
  if (!sourceStats?.isFile()) {
    throw new Error(`Cover file "${coverValue}" does not exist in the package folder.`);
  }
  const sharp = await loadSharp();
  const metadata = await sharp(source).metadata();
  if (!metadata.width || metadata.width < 1200) {
    throw new Error("Cover image must be at least 1200 pixels wide.");
  }
}

async function publishPackage(packageName) {
  const packageDir = path.join(queueRoot, packageName);
  const articlePath = path.join(packageDir, "article.md");
  const articleSource = await fs.readFile(articlePath, "utf8").catch(() => null);

  if (!articleSource) {
    throw new Error('Each queue package must include an "article.md" file.');
  }

  const article = parseFrontmatter(articleSource);

  if (typeof article.translationKey !== "string" || !article.translationKey.trim()) {
    throw new Error('Field "translationKey" is required.');
  }
  if (typeof article.permalink !== "string" || !article.permalink.trim()) {
    throw new Error('Field "permalink" is required.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.permalink)) {
    throw new Error('Field "permalink" must be a lowercase, hyphen-separated slug.');
  }
  if (!categoryValues.has(article.category)) {
    throw new Error('Field "category" is not an allowed news category.');
  }
  if (typeof article.author !== "string" || !article.author.trim()) {
    throw new Error('Field "author" is required.');
  }

  for (const key of localizedKeys) {
    ensureLocalizedField(article[key], key);
  }
  ensureBody(article.body);
  ensureSeoLengths(article);
  const expandedArticle = expandArticle(article);
  ensureCrossArticleDiversity(expandedArticle, packageName);
  article.relatedCategories = Array.isArray(article.relatedCategories) ? article.relatedCategories : [];
  if (!article.relatedCategories.length || article.relatedCategories.some((category) => !categorySlugs.has(category))) {
    throw new Error('Field "relatedCategories" must contain at least one valid WEGO product category.');
  }
  await validateCoverSource(packageDir, article.cover);
  if (validateOnly) return { status: "validated" };

  const publishAt = publishDateFromFolderName(packageName);
  if (publishAt.getTime() > Date.now()) {
    return { status: "pending" };
  }

  const publishedArticle = {
    ...expandedArticle,
    relatedCategories: article.relatedCategories,
    featured: Boolean(article.featured),
    publishedAt: publishAt.toISOString(),
    updatedAt: publishAt.toISOString(),
    cover: await copyCoverIfNeeded(packageDir, article.permalink, article.cover)
  };

  const output = `---\n${YAML.stringify(publishedArticle).trimEnd()}\n---\n`;
  const target = path.join(contentRoot, `${publishedArticle.permalink}.md`);
  await fs.writeFile(target, output, "utf8");
  await moveDirectory(packageDir, publishedRoot, packageName);
  return { status: "published", permalink: publishedArticle.permalink };
}

async function main() {
  await ensureDirectories();
  const packageNames = await readQueuePackages();

  if (!packageNames.length) {
    console.log("No queued news packages found.");
    return;
  }

  let publishedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let validatedCount = 0;

  for (const packageName of packageNames) {
    const packageDir = path.join(queueRoot, packageName);
    try {
      const result = await publishPackage(packageName);
      if (result.status === "validated") {
        validatedCount += 1;
        console.log(`Validated: ${packageName}`);
        continue;
      }
      if (result.status === "pending") {
        pendingCount += 1;
        console.log(`Pending: ${packageName}`);
        continue;
      }

      publishedCount += 1;
      console.log(`Published: ${packageName} -> ${result.permalink}`);
    } catch (error) {
      failedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (!validateOnly) {
        await fs.writeFile(path.join(packageDir, "publish-error.log"), `${message}\n`, "utf8");
        await moveDirectory(packageDir, failedRoot, packageName);
      }
      console.error(`Failed: ${packageName} -> ${message}`);
    }
  }

  console.log(`Summary: validated=${validatedCount} published=${publishedCount} pending=${pendingCount} failed=${failedCount}`);
  if (validateOnly && failedCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
