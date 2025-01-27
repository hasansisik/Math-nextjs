"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >


        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-white">
            <nav className="flex flex-col py-4 px-8">
              <Link href="/exam" onClick={handleMenuClick} className="py-2 hover:text-purple-600">Sınavlar</Link>
              <Link href="/lesson" onClick={handleMenuClick} className="py-2 hover:text-purple-600">Dersler</Link>
              <Link href="/query" onClick={handleMenuClick} className="py-2 hover:text-purple-600">Levhalar</Link>
            </nav>
          </div>
        )}
        
        {children}
      </body>
    </html>
  );
}
