import { z } from "astro/zod";

import rawSiteData from "../data/site.json";

const siteDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  homeHero: z
    .object({
      image: z
        .string()
        .default("")
        .refine(
          (value) =>
            value === "" ||
            /^\/uploads\/images\/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$/i.test(
              value
            ),
          {
            message:
              "Home hero image must be empty or an uploaded web image path."
          }
        ),
      imageAlt: z.string().default("")
    })
    .refine((hero) => hero.image === "" || hero.imageAlt.trim().length > 0, {
      message: "Home hero image alt text is required when an image is set."
    }),
  contact: z.object({
    name: z.string().min(1),
    email: z.email(),
    phone: z.string().min(1)
  })
});

export const siteData = siteDataSchema.parse(rawSiteData);
export type SiteData = z.infer<typeof siteDataSchema>;
