import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { Metadata } from "next";
import { Inter, Inconsolata, Roboto } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });
const inconsolata = Inconsolata({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "bedrock-project",
  description: "bedrock-project",
  keywords: "bedrock-project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="bg-sky-50">
      <body className={roboto.className}>
        <Providers>
          <main className="mx-auto flex flex-col min-h-screen">
            <Navbar />
            <div className="mx-auto flex-grow">{children}</div>
            <Footer />
          </main>
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
