import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const flagPreloads = [
  "/flags/de.svg",
  "/flags/hasli-flag.png",
  "/flags/en.svg",
  "/flags/spain-new-flag.png",
  "/flags/catalan-flag.png",
  "/flags/fr.svg",
  "/flags/it.svg",
  "/flags/romansch-flag.png",
  "/flags/pt.svg",
].map((href) => ({ href, type: href.endsWith(".svg") ? "image/svg+xml" : "image/png" }));

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meiringen.life",
  description:
    "Community platform for cultural, social, sport and integration activities in Meiringen and Haslital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${sans.variable} h-full`}>
      <head>
        {flagPreloads.map((asset) => (
          <link key={asset.href} rel="preload" as="image" href={asset.href} type={asset.type} />
        ))}
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
