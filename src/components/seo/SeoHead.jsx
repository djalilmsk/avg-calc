import { Helmet } from "react-helmet-async";
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
  const mergedStructuredData = [
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
  ];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={`${AUTHOR_NAME} (${AUTHOR_URL})`} />
      <meta name="publisher" content={`${AUTHOR_NAME} (${AUTHOR_URL})`} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={previewImageUrl} />
      <meta property="og:image:secure_url" content={previewImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={previewImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {mergedStructuredData.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}

export default SeoHead;
