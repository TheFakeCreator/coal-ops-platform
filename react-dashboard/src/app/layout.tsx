import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coal Operations Dashboard — Real-time Pipeline Analytics",
  description:
    "Enterprise analytics dashboard for coal mining operations. Real-time production monitoring, fleet management, and operational insights powered by Snowflake.",
  keywords: [
    "coal mining",
    "analytics",
    "dashboard",
    "data pipeline",
    "snowflake",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            className:
              "!bg-card !text-card-foreground !border-border",
          }}
        />
      </body>
    </html>
  );
}
