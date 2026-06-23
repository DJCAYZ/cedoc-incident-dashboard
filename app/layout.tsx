import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import bgImage from './SANJUAN.jpg';
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Providers from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEDOC Incident Dashboard",
  description: "For San Juan Wattah Wattah Festival 2026",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full ", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      
    >
      <body className="min-h-full flex flex-col bg-cover bg-bottom" style={{ backgroundImage: `url(${bgImage.src})` }}>
        <div className="w-full bg-red-900 px-8 py-2 shadow-md flex justify-between h-full">
          <Link href="/"><h1 className="text-white font-bold tracking-wider">CEDOC</h1></Link>
        </div>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
