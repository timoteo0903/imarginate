"use client"

import MarginCalculator from "@/components/MarginCalculator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function MarginCalculatorPage() {
  return (
    <main className="container mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link href="/" passHref>
          <Button variant="ghost" className="group flex items-center space-x-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Inicio</span>
          </Button>
        </Link>
      </motion.div>

      <MarginCalculator />
    </main>
  )
}

