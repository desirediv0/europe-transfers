import type { MetadataRoute } from "next";

const SITE_URL = "https://theeuropetransfers.com";
const API_URL = process.env.API_INTERNAL_URL || "http://localhost:4000/api/v1";

interface BlogPostItem {
  slug: string;
  updatedAt: string;
}

interface SeoPageItem {
  slug: string;
  updatedAt: string;
  status: string;
}

interface PackageItem {
  slug: string;
  isActive: boolean;
}

interface SightseeingItem {
  slug: string;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // ── Static pages ──────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/private-transfers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/van-coach`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/packages`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sightseeing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/seo-pages`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/rates`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // ── Dynamic blog posts ────────────────────────────────────────
  const blogData = await fetchJson<{ items: BlogPostItem[] }>(
    "/blog/posts?status=PUBLISHED&limit=500"
  );
  const blogPages: MetadataRoute.Sitemap = (blogData?.items || []).map(
    (post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // ── Dynamic SEO pages (/{slug}) ───────────────────────────────
  const seoData = await fetchJson<{ items: SeoPageItem[] }>(
    "/seo-pages?status=ACTIVE&limit=500"
  );
  const seoPages: MetadataRoute.Sitemap = (seoData?.items || []).map(
    (page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updatedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // ── Dynamic packages (/packages/{slug}) ───────────────────────
  const pkgData = await fetchJson<{ items: PackageItem[] }>(
    "/packages?limit=500"
  );
  const packagePages: MetadataRoute.Sitemap = (pkgData?.items || [])
    .filter((p) => p.isActive)
    .map((pkg) => ({
      url: `${SITE_URL}/packages/${pkg.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // ── Dynamic sightseeing (/sightseeing/{slug}) ─────────────────
  const tourData = await fetchJson<{ items: SightseeingItem[] }>(
    "/sightseeing?limit=500"
  );
  const tourPages: MetadataRoute.Sitemap = (tourData?.items || []).map(
    (tour) => ({
      url: `${SITE_URL}/sightseeing/${tour.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [
    ...staticPages,
    ...blogPages,
    ...seoPages,
    ...packagePages,
    ...tourPages,
  ];
}
