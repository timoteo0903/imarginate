import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Footer from "@/components/footer"
import type React from "react"
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Calculadora Financiera Pro | Herramientas para decisiones financieras",
  description:
    "Optimiza tus decisiones financieras con nuestras calculadoras de margen, punto de equilibrio y comparación de financiamiento.",
  keywords: "calculadora financiera, margen, punto de equilibrio, finanzas, cuotas, contado",
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
          <main className="flex-grow">
            {children}
            <Analytics />
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}




