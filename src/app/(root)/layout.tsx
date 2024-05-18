import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Topbar from "@/components/shared/Topbar";
import Leftsidebar from "@/components/shared/Leftsidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import Bottombar from "@/components/shared/Bottombar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Threads",
  description: "A next.js 14 Met Threads Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <header>
        <Topbar />
        </header>

        <main className="flex flex-row">
          <Leftsidebar />
            <section className="main-container">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </section>
          <RightSidebar />
        </main>
        <footer>
        <Bottombar />
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
