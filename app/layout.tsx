import "./globals.css";
import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Source_Serif_4,
  EB_Garamond,
} from "next/font/google";
import { Toaster } from "sonner";
import { RootProvider } from "fumadocs-ui/provider/next";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { MessageCircleIcon } from "lucide-react";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontTypewriter = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-typewriter",
});

const fontDisplay = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

const fontContent = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-content",
});

export const metadata: Metadata = {
  title: "Agent Auth",
  description: "Agent identity provider for @better-auth/agent-auth",
  openGraph: {
    images: [{ url: "/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontTypewriter.variable} ${fontDisplay.variable} ${fontContent.variable} min-h-dvh font-sans antialiased`}
      >
        <RootProvider>
          {children}
          <AISearch>
            <AISearchPanel />
            <AISearchTrigger
              position="float"
              hideOnPaths={["/demo"]}
              className="inline-flex items-center gap-2 rounded-full border bg-fd-muted px-4 py-2 text-sm text-fd-muted-foreground hover:text-fd-foreground shadow-sm transition-colors"
            >
              <MessageCircleIcon className="size-4" />
              Ask AI
            </AISearchTrigger>
          </AISearch>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-card !text-foreground !border-border",
            }}
          />
        </RootProvider>
      </body>
    </html>
  );
}
