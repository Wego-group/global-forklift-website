import { defineField, defineType } from "sanity";

const languages = [
  { title: "English", value: "en" },
  { title: "Español", value: "es" },
  { title: "Français", value: "fr" },
  { title: "日本語", value: "ja" },
  { title: "Deutsch", value: "de" },
  { title: "Português", value: "pt" },
  { title: "한국어", value: "ko" },
  { title: "العربية", value: "ar" }
];

const categories = [
  { title: "Company News", value: "news" },
  { title: "Events", value: "events" },
  { title: "Product Guide", value: "product-guide" },
  { title: "Delivery Case", value: "delivery-case" },
  { title: "Technical Guide", value: "technical-guide" }
];

export const newsArticle = defineType({
  name: "newsArticle",
  title: "News article",
  type: "document",
  groups: [
    { name: "content", title: "Article" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Publishing" }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(110)
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "excerpt",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().min(80).max(260)
    }),
    defineField({
      name: "body",
      title: "Article content",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "coverAlt",
      title: "Image description (alt text)",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(160)
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(60)
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(160)
    }),
    defineField({
      name: "language",
      title: "Page language",
      type: "string",
      group: "settings",
      initialValue: "en",
      options: { list: languages, layout: "radio" },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "translationKey",
      title: "Translation group ID",
      description: "Use the same value for all language versions of this article, for example: electric-forklift-guide-2026.",
      type: "string",
      group: "settings",
      validation: (rule) => rule.required().regex(/^[a-z0-9-]+$/, { name: "lowercase URL-safe text" })
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "settings",
      initialValue: "news",
      options: { list: categories },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "settings",
      initialValue: "WEGO Forklift"
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "settings",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "updatedAt",
      title: "Updated at",
      type: "datetime",
      group: "settings"
    }),
    defineField({
      name: "relatedCategories",
      title: "Related product categories",
      description: "Optional product category slugs, used for related product cards on the article page.",
      type: "array",
      group: "settings",
      of: [{ type: "string" }]
    }),
    defineField({
      name: "featured",
      title: "Featured article",
      type: "boolean",
      group: "settings",
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "language",
      media: "cover"
    }
  }
});
