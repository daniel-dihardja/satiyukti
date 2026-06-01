import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const verses = Array.from({ length: 112 }, (_, i) => ({
    url: `https://satiyukti.org/vbt/verse/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    { url: "https://satiyukti.org", lastModified: new Date(), priority: 1.0 },
    {
      url: "https://satiyukti.org/vbt",
      lastModified: new Date(),
      priority: 0.9,
    },
    ...verses,
  ]
}
