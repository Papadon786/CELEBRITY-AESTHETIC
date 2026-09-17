import type { MetadataRoute } from "next";
import { treatments } from "@/lib/treatments";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/treatments",
    "/pmu-services",
    "/academy",
    "/results",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const treatmentRoutes = treatments.map((t) => ({
    url: `${SITE_URL}/treatments/${t.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...treatmentRoutes];
}
