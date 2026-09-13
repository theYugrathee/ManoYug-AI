import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ManoYug AI",
    template: "%s · ManoYug AI",
  },
  description:
    "AI-first student wellbeing companion with human escalation and institutional safety infrastructure.",
  applicationName: "ManoYug AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ManoYug AI",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans bg-white text-[#0F172A]">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
