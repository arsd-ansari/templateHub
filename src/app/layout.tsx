import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleConsentScripts } from "@/components/consent/google-consent";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { ADSENSE_CLIENT_ID, CONTACT_EMAIL, PINTEREST_VERIFICATION, SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Free Excel Templates and Spreadsheet Resources`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Free Excel Templates`,
    description: SITE_DESCRIPTION,
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Free Excel Templates`,
    description: SITE_DESCRIPTION
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png"
  },
  // Google Search Console site verification. Both codes are kept so the old
  // vercel.app property and the templatehub.co.in property stay verified.
  verification: {
    google: [
      "-EiqnxrkWkL2Ac_n0y76oyuvrpHr7Jdmwkxpi2kfzR8",
      "bJcV9bpZSSF1yud5_YxuPY5MDOs8ILZmLpdHGWxiVtc"
    ]
  },
  // Google AdSense + Pinterest domain-verification meta tags. Each only rendered
  // when its corresponding env var is set.
  ...((ADSENSE_CLIENT_ID || PINTEREST_VERIFICATION)
    ? {
        other: {
          ...(ADSENSE_CLIENT_ID ? { "google-adsense-account": ADSENSE_CLIENT_ID } : {}),
          ...(PINTEREST_VERIFICATION ? { "p:domain_verify": PINTEREST_VERIFICATION } : {})
        }
      }
    : {})
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              email: CONTACT_EMAIL,
              founder: {
                "@type": "Person",
                name: SITE_AUTHOR.name,
                jobTitle: SITE_AUTHOR.role
              }
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            }}
          />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
        <Suspense fallback={null}>
          <GoogleConsentScripts />
        </Suspense>
      </body>
    </html>
  );
}
