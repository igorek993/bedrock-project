import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { Metadata } from "next";
import { Inter, Inconsolata, Roboto } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

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
    <ClerkProvider>
      <html lang="ru" className="bg-sky-50">
        <body className={roboto.className}>
          <main className="mx-auto flex flex-col min-h-screen">
            <Navbar />
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <div className="mx-auto flex-grow">{children}</div>
            <Footer />
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
