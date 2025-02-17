import "./globals.css"
import { Analytics } from '@vercel/analytics/next';

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Footer from "@/components/footer"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Imarginante",  
  description: "Calcula márgenes y puntos de equilibrio fácilmente"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <Analytics />
          <Footer />
        </div>
      </body>
    </html>
  )
}

