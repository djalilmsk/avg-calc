import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";

const SITE_NAME = "CookedCalc";
const SITE_URL = "https://cookedcalc.djalilmsk.dev";
const AUTHOR_NAME = "Abd eldjallil Meskali (djalilmsk)";
const AUTHOR_URL = "https://djalilmsk.dev";
const LOGO_URL = `${SITE_URL}/logo.svg`;
const PREVIEW_IMAGE_URL = `${SITE_URL}/preview.jpg`;
const PREVIEW_IMAGE_ALT = "CookedCalc semester average calculator preview";

function buildCanonicalUrl(pathname) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPathname}`;
}

function toAbsoluteUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const normalizedValue = value.startsWith("/") ? value : `/${value}`;
  return `${SITE_URL}${normalizedValue}`;
}

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!(element instanceof HTMLMetaElement)) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!(element instanceof HTMLLinkElement)) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function removeMetaByName(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`);
  if (element) element.remove();
}

function clearStructuredDataScripts() {
  const scripts = document.head.querySelectorAll(
    'script[data-seo-structured="true"]',
  );
  scripts.forEach((script) => script.remove());
}

function appendStructuredDataScripts(entries) {
  entries.forEach((entry) => {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo-structured", "true");
    script.text = JSON.stringify(entry);
    document.head.appendChild(script);
  });
}

function SeoHead({
  title,
  description,
  keywords = "",
  ogType = "website",
  twitterCard = "summary_large_image",
  image = PREVIEW_IMAGE_URL,
  imageAlt = PREVIEW_IMAGE_ALT,
  noIndex = false,
  structuredData = [],
}) {
  const { pathname } = useLocation();
  const canonicalUrl = buildCanonicalUrl(pathname);
  const previewImageUrl = toAbsoluteUrl(image);
  const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";
  const mergedStructuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: LOGO_URL,
        image: PREVIEW_IMAGE_URL,
        founder: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: AUTHOR_URL,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      ...structuredData.filter(Boolean),
    ],
    [structuredData],
  );

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description" }, description);
    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: "keywords" }, keywords);
    } else {
      removeMetaByName("keywords");
    }

    upsertMeta('meta[name="robots"]', { name: "robots" }, robotsContent);
    upsertMeta(
      'meta[name="author"]',
      { name: "author" },
      `${AUTHOR_NAME} (${AUTHOR_URL})`,
    );
    upsertMeta(
      'meta[name="publisher"]',
      { name: "publisher" },
      `${AUTHOR_NAME} (${AUTHOR_URL})`,
    );
    upsertCanonical(canonicalUrl);

    upsertMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      SITE_NAME,
    );
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, ogType);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      description,
    );
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta(
      'meta[property="og:image"]',
      { property: "og:image" },
      previewImageUrl,
    );
    upsertMeta(
      'meta[property="og:image:secure_url"]',
      { property: "og:image:secure_url" },
      previewImageUrl,
    );
    upsertMeta(
      'meta[property="og:image:alt"]',
      { property: "og:image:alt" },
      imageAlt,
    );
    upsertMeta(
      'meta[property="og:image:width"]',
      { property: "og:image:width" },
      "1200",
    );
    upsertMeta(
      'meta[property="og:image:height"]',
      { property: "og:image:height" },
      "630",
    );
    upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, "en_US");

    upsertMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      twitterCard,
    );
    upsertMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      title,
    );
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      description,
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      previewImageUrl,
    );
    upsertMeta(
      'meta[name="twitter:image:alt"]',
      { name: "twitter:image:alt" },
      imageAlt,
    );

    clearStructuredDataScripts();
    appendStructuredDataScripts(mergedStructuredData);
  }, [
    canonicalUrl,
    description,
    imageAlt,
    keywords,
    mergedStructuredData,
    ogType,
    previewImageUrl,
    robotsContent,
    title,
    twitterCard,
  ]);

  return null;
}

export default SeoHead;
