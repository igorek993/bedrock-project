import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Spinner from "@/components/layout/loading";
import { Metadata } from "next";
import { Inter, Inconsolata, Roboto } from "next/font/google";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });
const inconsolata = Inconsolata({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "FileNova",
  description: "FileNova",
  keywords: "FileNova",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <ClerkLoading>
            <div className="flex items-center justify-center h-screen text-2xl">
              <Spinner />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
