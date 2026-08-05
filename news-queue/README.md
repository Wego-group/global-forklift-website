Place each scheduled news package in its own folder under `news-queue/`.

Required structure:

```text
news-queue/
  2026-08-08/
    article.md
    cover.jpg
```

Rules:

1. `article.md` must use the same frontmatter schema as files in `src/content/news/`.
2. If the cover image lives inside the package folder, set `cover: ./cover.jpg`.
3. The folder name is the publish date and must be exactly `YYYY-MM-DD`.
4. All queued news uses the same fixed publish time: Beijing time `22:00:00+08:00`.
5. `article.md` no longer needs `publishedAt` or `updatedAt`. The publisher writes both automatically from the folder date.
6. The auto publisher ignores future packages, publishes due packages, moves success cases to `news-published/`, and moves invalid packages to `news-failed/`.
7. The real page URL comes from `permalink`, not from the folder name.
8. Every package must be written as people-first SEO content: one clear product/search topic, a practical lead paragraph, real application details, and no keyword stuffing.
9. All eight languages in `title`, `excerpt`, `seoTitle`, `seoDescription`, and `body` must be genuinely localized. Do not copy the English text into the other language fields.
10. The `body` field must always contain 5 paragraphs in every language, in this order: buyer-oriented overview, real application scene, key configuration points, pre-quotation checklist, and export or after-sales delivery notes.
11. Two short paragraphs are not enough. News content must read like a usable buying brief, not a caption under a picture.
12. `seoTitle` is validated per language: 30-70 characters for Latin/Arabic languages and 15-45 for Japanese/Korean. `seoDescription` must be 100-180 or 45-110 characters respectively.
13. Every article must link to at least one valid WEGO product family through `relatedCategories` so the news page contributes useful internal links.
14. The cloud publisher rejects non-English fields that simply duplicate English. Visible titles, summaries, descriptions, and all five body paragraphs must be genuinely localized.
15. Cover images must be at least 1200 pixels wide. The cloud publisher automatically rotates, resizes to a maximum of 1920x1440, strips unnecessary metadata, and publishes WebP at controlled quality.
16. Published NewsArticle structured data automatically includes an absolute image URL, language, publication and modification dates, canonical page, WEGO publisher URL, and publisher logo.

Recommended workflow for the news operator:

1. Create a new folder under `news-queue/` using the publish date as the folder name, for example `2026-08-08`.
2. Put the text materials and images into that folder.
3. Ask Codex to turn the materials into a valid `article.md` using the local template, to localize all eight language fields, and to expand the body into the fixed 5-paragraph SEO structure.
4. Commit and push the folder to `main`. GitHub Actions will run in the cloud and release it automatically shortly after `22:00` Beijing time on that date, even if all local computers are off.

Message to send to the Codex on the publishing computer:

```text
Project path: /Users/mike_cheng/Desktop/global-forklift-website

Rule:
1. News source only comes from news-queue/.
2. Each subfolder name is the publish date in YYYY-MM-DD format.
3. All news must use the same fixed publish time: 22:00:00+08:00.
4. Do not ask me for GitHub steps. You should process the package, commit it, and push it yourself.
5. article.md must follow news-queue/_template/article.md.
6. publishedAt and updatedAt are generated automatically from the folder name. Do not require me to write them manually.
7. Every news package must be polished for Google-friendly, people-first SEO before publishing.
8. Every language field must be localized. Do not repeat the English copy in the non-English fields.
9. Every language inside `body` must contain exactly 5 useful paragraphs, not a short placeholder summary.
10. Cloud publishing is handled by GitHub Actions after the folder is pushed to main. Do not depend on a local machine staying online until publish time.
11. Keep every SEO title and description inside the language-aware length rules documented above.
12. Use a real cover image at least 1200 pixels wide and at least one valid related product category. The publisher will optimize the image to WebP automatically.
13. Before pushing, run `npm run validate:queued-news`. Correct every reported error; never bypass the validator.

When I give you a folder in news-queue/, you must:
1. Read the text and images in that folder.
2. Create or update article.md in that folder.
3. Commit and push to main.
4. If I explicitly ask for an immediate manual release, then run npm run publish:queued-news, commit, and push the generated changes.
```
