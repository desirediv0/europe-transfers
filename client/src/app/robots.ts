import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = "https://theeuropetransfers.com";

  return {
    rules: [
      // ── Allow all standard search engine crawlers ──────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/account/*",
          "/checkout",
          "/checkout/*",
          "/auth",
          "/auth/*",
          "/api",
          "/api/*",
          "/fleet-partners",
          "/fleet-partners/*",
        ],
      },

      // ── Googlebot (explicit allow for best practices) ─────────
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },

      // ── AI crawlers — explicitly allowed for AI search ranking ─
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/account", "/checkout", "/auth", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
