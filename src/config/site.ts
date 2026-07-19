export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || "CampFire",
  description:
    import.meta.env.VITE_SITE_DESCRIPTION ||
    "Modern stories, guides, and editorial features from the CampFire team.",
  locationLabel: import.meta.env.VITE_SITE_LOCATION || "",
  blogSiteId: import.meta.env.VITE_BLOG_SITE_ID || ""
};
