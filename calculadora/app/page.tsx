"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, CreditCard } from "lucide-react"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div className="text-center space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800" variants={itemVariants}>
          Calculadora Financiera Pro
        </motion.h1>
        <motion.p className="text-xl text-gray-600 mb-12" variants={itemVariants}>
          Optimiza tus finanzas con nuestras herramientas de cálculo avanzadas
        </motion.p>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
          <Link href="/margin-calculator" passHref>
            <Button className="w-full h-16 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
              <Calculator className="w-6 h-6 mr-2" />
              Calculadora de Margen
            </Button>
          </Link>
          <Link href="/break-even-calculator" passHref>
            <Button className="w-full h-16 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
              <TrendingUp className="w-6 h-6 mr-2" />
              Punto de Equilibrio
            </Button>
          </Link>
          <Link href="/cuotas-calculator" passHref>
            <Button className="w-full h-16 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
              <CreditCard className="w-6 h-6 mr-2" />
              ¿Cuotas o Efectivo?
            </Button>
          </Link>
        </motion.div>
        <motion.div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
          <Card className="bg-white p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Optimiza tus Ganancias</h3>
              <p className="text-sm text-gray-600">Calcula márgenes precisos para maximizar tus beneficios</p>
            </CardContent>
          </Card>
          <Card className="bg-white p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Analiza tu Punto de Equilibrio</h3>
              <p className="text-sm text-gray-600">Determina cuándo tu negocio comenzará a generar beneficios</p>
            </CardContent>
          </Card>
          <Card className="bg-white p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Decisiones Inteligentes</h3>
              <p className="text-sm text-gray-600">Compara opciones de pago considerando la inflación</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  )
}

