import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL || "https://wegoforklift.com";

export default defineConfig({
  site,
  trailingSlash: "always",
  compressHTML: true,
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        const legacyRoute = /\/(?:parts-service|why-wego|resources|industries)(?:\/|$)/.test(pathname)
          || /\/services\/$/.test(pathname);
        return pathname !== "/" && !pathname.startsWith("/admin/") && !legacyRoute;
      }
    })
  ],
  build: {
    format: "directory"
  }
});
