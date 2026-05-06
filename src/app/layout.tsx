import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getThemePreference } from "@/features/auth/server/theme";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import "./globals.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omnilist",
  description: "Dynamic shared lists for personal SaaS use.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themePreference = await getThemePreference();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${themePreference === "dark" ? "dark" : ""}`}>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider initialTheme={themePreference}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
