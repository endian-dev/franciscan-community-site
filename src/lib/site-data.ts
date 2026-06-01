import { z } from "astro/zod";

import rawSiteData from "../data/site.json";

const siteDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  contact: z.object({
    name: z.string().min(1),
    email: z.email(),
    phone: z.string().min(1),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      region: z.string().min(1),
      postalCode: z.string().min(1)
    })
  }),
  footer: z.object({
    text: z.string().min(1)
  })
});

export const siteData = siteDataSchema.parse(rawSiteData);
export type SiteData = z.infer<typeof siteDataSchema>;
