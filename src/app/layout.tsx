import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import RootHeader from "@/components/layout/RootHeader";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import Consent from "@/components/analytics/Consent";
import JsonLd from "@/components/seo/JsonLd";
import { websiteJsonLd, organizationJsonLd } from "@/lib/jsonld";
import { SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { listActiveTypes } from "@/lib/events";
import { getHeaderMenu, EMPTY_MENU, type HeaderMenu } from "@/lib/headerMenu";
import "./globals.css";

// Menu links to type hubs with no upcoming events (those pages 404). If the DB
// is unreachable, hide nothing rather than break every page's header.
async function hiddenTypeHrefs(): Promise<string[]> {
  try {
    const active = await listActiveTypes();
    return EVENT_TYPES.filter((t) => !active.includes(t.type)).map((t) => `/${t.slug}`);
  } catch {
    return [];
  }
}

// The header's drop-down panels. Like the hidden menu links above, an
// unreachable DB leaves them empty rather than breaking every page.
async function headerMenu(): Promise<HeaderMenu> {
  try {
    return await getHeaderMenu();
  } catch {
    return EMPTY_MENU;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The one content face: a light, high-contrast serif (Style Reference 1 —
// Newsreader stands in for the commercial Times Now). Geist is kept for small
// meta lines and chips, as in the Figma cards. 400 is for the header panels'
// card titles and links (Figma "Header" 415:2859).
const newsreader = Newsreader({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hiddenHrefs, menu] = await Promise.all([hiddenTypeHrefs(), headerMenu()]);
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col text-ink" style={{ backgroundColor: 'var(--page)' }}>
        <RootHeader hiddenHrefs={hiddenHrefs} menu={menu} />
        <div className="flex-1 min-h-0">{children}</div>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <GoogleAnalytics />
        <Consent />
      </body>
    </html>
  );
}
