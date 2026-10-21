import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ChatbotLauncher } from "@/components/chatbot/chatbot-launcher";
import { FloatingContactButton, MobileActionBar } from "@/components/layout/floating-contact";
import { Preloader, PRELOADER_SCRIPT } from "@/components/layout/preloader";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/ui/motion";
import { DEFAULT_SOCIAL_IMAGE, searchIndexingAllowed } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Fire Protection in Visakhapatnam`,
    // Short brand suffix keeps page titles within what search results display.
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: { siteName: siteConfig.name, locale: siteConfig.locale, type: "website", images: [DEFAULT_SOCIAL_IMAGE] },
  formatDetection: { telephone: false },
  // Until the site runs on its configured production URL, nothing is indexed (see src/lib/seo.ts).
  ...(searchIndexingAllowed() ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#071B3B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_SCRIPT }} />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <Preloader />
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-navy-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
          <FloatingContactButton />
          <MobileActionBar />
          <ChatbotLauncher />
        </MotionProvider>
      </body>
    </html>
  );
}
