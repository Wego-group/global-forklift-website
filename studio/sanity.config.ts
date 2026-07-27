import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "wego-forklift-news",
  title: "WEGO Forklift News",
  projectId: "oingo0yd",
  dataset: "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes
  }
});
