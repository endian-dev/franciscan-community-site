import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const isRouteSegment = (segment: string) =>
  segment.length > 0 &&
  !segment.startsWith("-") &&
  !segment.endsWith("-") &&
  !segment.includes("--") &&
  Array.from(segment).every(
    (char) =>
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === "-"
  );

const pageRoute = z.string().refine(
  (route) => {
    if (route === "/") {
      return true;
    }

    if (!route.startsWith("/") || route.endsWith("/")) {
      return false;
    }

    return route.slice(1).split("/").every(isRouteSegment);
  },
  { message: "Route must be / or a lowercase path such as /who-we-are." }
);
const optionalUrl = z.union([z.literal(""), z.url()]);

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    route: pageRoute,
    navLabel: z.string(),
    navOrder: z.number(),
    description: z.string().default(""),
    published: z.boolean().default(true)
  })
});

const faqs = defineCollection({
  loader: glob({ base: "./src/content/faqs", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    question: z.string(),
    order: z.number(),
    published: z.boolean().default(true)
  })
});

const resources = defineCollection({
  loader: glob({ base: "./src/content/resources", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    linkLabel: z.string().optional().default(""),
    uploadedFile: z.string().optional().default(""),
    externalUrl: optionalUrl.optional().default(""),
    published: z.boolean().default(true)
  })
});

export const collections = { pages, faqs, resources };
