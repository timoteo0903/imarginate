import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, DollarSign, Zap } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center bg-[#1F3A5F]">
      <Card className="w-full max-w-4xl bg-[#374357] backdrop-blur-sm shadow-xl border-none"> 
        <CardContent className="p-6">
          <h1 className="text-4xl md:text-4xl font-bold text-center mb-8 text-gradient bg-clip-text text-transparent bg-[#FFFFFF]">
            Calculadora Financiera Pro
          </h1>
          <p className="text-xl text-center mb-12 text-[#acc2ef]">
            Optimiza tus finanzas con nuestras herramientas de cálculo avanzadas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/margin-calculator" passHref>
              <Button className="w-full h-32 text-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-[#4d648d] to-blue-[#4c638a] hover:from-[#1f2b3e] hover:to-[#374357] shadow-lg">
                <Calculator className="w-8 h-8 mr-4" />
                Calculadora de Margen
              </Button>
            </Link>
            <Link href="/break-even-calculator" passHref>
              <Button className="w-full h-32 text-xl text-[#1F3A5F] font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-[#acc2ef] to-[#cee8ff] hover:from-[#4b628a] hover:to-[#acc2ef] shadow-lg">
                <TrendingUp className="w-8 h-8 mr-4 text-[#1F3A5F]" />
                Calculadora de Punto de Equilibrio
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-100 p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Optimiza tus Ganancias</h3>
              <p className="text-sm text-gray-700">Calcula márgenes precisos para maximizar tus beneficios</p>
            </Card>
            <Card className="bg-yellow-100 p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg font-semibold mb-2">Analiza tu Punto de Equilibrio</h3>
              <p className="text-sm text-gray-700">Determina cuándo tu negocio comenzará a generar beneficios</p>
            </Card>
            <Card className="bg-blue-100 p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
              <Zap className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Decisiones Rápidas</h3>
              <p className="text-sm text-gray-700">Obtén resultados instantáneos para tomar decisiones informadas</p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

