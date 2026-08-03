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

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) {
    throw new Error("article.md is missing YAML frontmatter.");
  }

  return YAML.parse(match[1]);
}

function ensureLocalizedField(value, fieldName) {
  if (!value || typeof value !== "object") {
    throw new Error(`Field "${fieldName}" must contain all language entries.`);
  }

  for (const language of supportedLanguages) {
    if (typeof value[language] !== "string" || !value[language].trim()) {
      throw new Error(`Field "${fieldName}.${language}" is required.`);
    }
  }
}

function ensureBody(value) {
  if (!value || typeof value !== "object") {
    throw new Error('Field "body" must contain all language entries.');
  }

  for (const language of supportedLanguages) {
    if (!Array.isArray(value[language]) || !value[language].length) {
      throw new Error(`Field "body.${language}" must be a non-empty array.`);
    }
    if (value[language].some((paragraph) => typeof paragraph !== "string" || !paragraph.trim())) {
      throw new Error(`Field "body.${language}" can only contain non-empty paragraphs.`);
    }
  }
}

function sanitizeFileSegment(value) {
  return value.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");
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
  if (typeof coverValue !== "string" || !coverValue.trim()) {
    throw new Error('Field "cover" is required.');
  }

  if (!coverValue.startsWith("./")) {
    return coverValue;
  }

  const source = path.join(packageDir, coverValue.slice(2));
  const sourceStats = await fs.stat(source).catch(() => null);
  if (!sourceStats?.isFile()) {
    throw new Error(`Cover file "${coverValue}" does not exist in the package folder.`);
  }

  const extension = path.extname(source) || ".jpg";
  const targetName = `${sanitizeFileSegment(permalink)}${extension.toLowerCase()}`;
  const target = path.join(publicNewsRoot, targetName);
  await fs.copyFile(source, target);
  return `/images/news/${targetName}`;
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
  if (typeof article.category !== "string" || !article.category.trim()) {
    throw new Error('Field "category" is required.');
  }
  if (typeof article.author !== "string" || !article.author.trim()) {
    throw new Error('Field "author" is required.');
  }

  for (const key of localizedKeys) {
    ensureLocalizedField(article[key], key);
  }
  ensureBody(article.body);

  const publishAt = new Date(article.publishedAt);
  if (Number.isNaN(publishAt.getTime())) {
    throw new Error('Field "publishedAt" must be a valid datetime or date.');
  }
  if (publishAt.getTime() > Date.now()) {
    return { status: "pending" };
  }

  const updatedAt = article.updatedAt ? new Date(article.updatedAt) : publishAt;
  article.publishedAt = publishAt.toISOString();
  article.updatedAt = Number.isNaN(updatedAt.getTime()) ? publishAt.toISOString() : updatedAt.toISOString();
  article.relatedCategories = Array.isArray(article.relatedCategories) ? article.relatedCategories : [];
  article.featured = Boolean(article.featured);
  article.cover = await copyCoverIfNeeded(packageDir, article.permalink, article.cover);

  const output = `---\n${YAML.stringify(article).trimEnd()}\n---\n`;
  const target = path.join(contentRoot, `${article.permalink}.md`);
  await fs.writeFile(target, output, "utf8");
  await moveDirectory(packageDir, publishedRoot, packageName);
  return { status: "published", permalink: article.permalink };
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

  for (const packageName of packageNames) {
    const packageDir = path.join(queueRoot, packageName);
    try {
      const result = await publishPackage(packageName);
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
      await fs.writeFile(path.join(packageDir, "publish-error.log"), `${message}\n`, "utf8");
      await moveDirectory(packageDir, failedRoot, packageName);
      console.error(`Failed: ${packageName} -> ${message}`);
    }
  }

  console.log(`Summary: published=${publishedCount} pending=${pendingCount} failed=${failedCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
