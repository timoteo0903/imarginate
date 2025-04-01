"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const imageVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const buttonHoverVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-80px)]">
        {/* Left Content Section */}
        <motion.div
          className="w-full lg:w-1/2 lg:pr-12 z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xl font-medium mb-4">
              Imarginate
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Optimiza tus <span className="text-blue-600">decisiones financieras</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8 max-w-lg">
            Calcula márgenes, puntos de equilibrio y compara opciones de financiamiento con nuestras herramientas
            profesionales.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Fixed Calculator Button */}
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Link href="/margin-calculator" passHref className="block">
                <div className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center px-2 transition-colors">
                  <Calculator className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-base font-medium whitespace-nowrap">Calculadora de Margen</span>
                </div>
              </Link>
            </motion.div>

            {/* Fixed Break-Even Button */}
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Link href="/break-even-calculator" passHref className="block">
                <div className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center justify-center px-2 transition-colors">
                  <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-base font-medium whitespace-nowrap">Punto de Equilibrio</span>
                </div>
              </Link>
            </motion.div>

            {/* Fixed Installments Button */}
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Link href="/installments-calculator" passHref className="block">
                <div className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md flex items-center justify-center px-2 transition-colors">
                  <CreditCard className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-base font-medium whitespace-nowrap">¿Cuotas o Contado?</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Toma decisiones basadas en datos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Nuestras calculadoras te ayudan a visualizar el impacto financiero de tus decisiones de negocio.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center lg:justify-end"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-full max-w-lg h-[400px] lg:h-[500px]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl transform rotate-3 scale-105"></div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/landing.png"
                alt="Financial analysis and planning"
                fill
                className="object-cover"
                priority
              />

              {/* Floating elements for visual interest */}
              <motion.div
                className="absolute top-10 right-10 bg-white p-3 rounded-lg shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: "easeInOut",
                }}
              >
                <Calculator className="h-6 w-6 text-blue-500" />
              </motion.div>

              <motion.div
                className="absolute bottom-20 left-10 bg-white p-3 rounded-lg shadow-lg"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <CreditCard className="h-6 w-6 text-purple-500" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <motion.div
        className="container mx-auto px-4 pb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0">
            <div className="h-2 bg-blue-500"></div>
            <CardContent className="p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Optimiza tus Ganancias</h3>
              <p className="text-gray-600">Calcula márgenes precisos para maximizar tus beneficios y rentabilidad.</p>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0">
            <div className="h-2 bg-indigo-500"></div>
            <CardContent className="p-6">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Analiza tu Punto de Equilibrio</h3>
              <p className="text-gray-600">Determina cuándo tu negocio comenzará a generar beneficios reales.</p>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0">
            <div className="h-2 bg-purple-500"></div>
            <CardContent className="p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Decisiones Inteligentes</h3>
              <p className="text-gray-600">
                Compara opciones de pago considerando la inflación y el valor del dinero en el tiempo.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

