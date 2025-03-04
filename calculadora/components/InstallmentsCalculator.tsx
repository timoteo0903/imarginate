"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { NumericFormat } from "react-number-format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Info,
    CreditCard,
    Calendar,
    TrendingUp,
    DollarSign,
    Percent,
    ArrowRight,
    ChevronDown,
    ChevronUp,
  } from "lucide-react"
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
  import { Alert, AlertDescription } from "@/components/ui/alert"
  import { AlertCircle, CheckCircle2 } from "lucide-react"
  import { motion, AnimatePresence } from "framer-motion"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}

interface InstallmentRow {
  month: number
  installmentAmount: number
  realValue: number
  savings: number
  accumulatedSavings: number
  accumulatedRealValue: number

}
const AnimatedCounter = ({ value, formatter }: { value: number; formatter: (val: number) => string }) => {
    const [displayValue, setDisplayValue] = useState(0)
  
    useEffect(() => {
      const duration = 1000 // ms
      const frameDuration = 1000 / 60 // 60fps
      const totalFrames = Math.round(duration / frameDuration)
      let frame = 0
  
      const counter = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        const currentValue = Math.floor(value * progress)
  
        setDisplayValue(currentValue)
  
        if (frame === totalFrames) {
          clearInterval(counter)
          setDisplayValue(value)
        }
      }, frameDuration)
  
      return () => clearInterval(counter)
    }, [value])
  
    return <span>{formatter(displayValue)}</span>
  } 

const InstallmentsCalculator = () => {
  const [cashPrice, setCashPrice] = useState("")
  const [installmentsPrice, setInstallmentsPrice] = useState("")
  const [monthlyInflation, setMonthlyInflation] = useState("2.2")
  const [numberOfInstallments, setNumberOfInstallments] = useState("12")
  const [results, setResults] = useState<InstallmentRow[]>([])
  const [totalSavings, setTotalSavings] = useState<number>(0)
  const [totalRealValue, setTotalRealValue] = useState<number>(0)
  const [difference, setDifference] = useState<number>(0)
  const [recommendation, setRecommendation] = useState<{
    type: "cuotas" | "contado"
    message: string
  } | null>(null)
  const [annualInflation, setAnnualInflation] = useState<number>(0)
  const [interestRate, setInterestRate] = useState<number>(0)
  const [showFinancedDetails, setShowFinancedDetails] = useState(false)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  const calculateInstallments = () => {
    const cashPriceNum = Number(cashPrice.replace(/[^\d.-]/g, ""))
    const installmentsPriceNum = Number(installmentsPrice.replace(/[^\d.-]/g, ""))
    const monthlyInflationNum = Number(monthlyInflation) / 100
    const installments = Number(numberOfInstallments)
    const monthlyPayment = installmentsPriceNum / installments

    const calculatedInterestRate = (installmentsPriceNum / cashPriceNum - 1) * 100
    setInterestRate(calculatedInterestRate)

    const calculatedAnnualInflation = (Math.pow(1 + monthlyInflationNum, 12) - 1) * 100
    setAnnualInflation(calculatedAnnualInflation)


    let accumulatedSavings = 0
    let accumulatedRealValue = 0
    const results: InstallmentRow[] = []

    for (let i = 1; i <= installments; i++) {
      // Calculate the real value of the installment considering inflation
      const inflationFactor = Math.pow(1 + monthlyInflationNum, i)
      const realValue = monthlyPayment / inflationFactor
      const savings = monthlyPayment - realValue
      accumulatedSavings += savings
      accumulatedRealValue += realValue

      results.push({
        month: i,
        installmentAmount: monthlyPayment,
        realValue: realValue,
        savings: savings,
        accumulatedSavings: accumulatedSavings,
        accumulatedRealValue: accumulatedRealValue,
      })
    }

    setResults(results)
    setTotalSavings(accumulatedSavings)
    setTotalRealValue(accumulatedRealValue)
    setCashPrice(cashPrice)
    setShowFinancedDetails(true)
    let difference = installmentsPriceNum - Number(cashPrice)
    setDifference(difference)



    if (accumulatedRealValue < Number(cashPrice)) {
        if (installmentsPriceNum === cashPriceNum){
            setRecommendation({
                type: "cuotas",
                message: `Te conviene pagar en cuotas. Aunque el precio total en cuotas (${formatCurrency(installmentsPriceNum)}) es igual que el precio de contado (${formatCurrency(cashPriceNum)}), debido a la inflación del ${monthlyInflation}% mensual, te ahorrarás ${formatCurrency(accumulatedSavings)} en términos reales.`,
            });
            
        }else{
            
            setRecommendation({
                type: "cuotas",
                message: `Te conviene pagar en cuotas. Aunque el precio total en cuotas (${formatCurrency(installmentsPriceNum)}) es mayor que el precio de contado (${formatCurrency(cashPriceNum)}), debido a la inflación del ${monthlyInflation}% mensual, te ahorrarás ${formatCurrency(accumulatedSavings)} en términos reales.`,
            });
        }
    } else {
        setRecommendation({
            type: "contado",
            message: `Te conviene pagar al contado. El precio de contado (${formatCurrency(cashPriceNum)}) es más conveniente que el precio total en cuotas (${formatCurrency(installmentsPriceNum)}), incluso considerando la inflación del ${monthlyInflation}% mensual.`,
        });
    }
}
    

return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">¿Cuotas o Efectivo?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cashPrice" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio de contado
              </Label>
              <div className="flex items-center space-x-2">
                <NumericFormat
                  id="cashPrice"
                  value={cashPrice}
                  onValueChange={(values) => setCashPrice(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese el precio de contado"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ingrese el precio si pagara al contado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installmentsPrice" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Precio total en cuotas
              </Label>
              <div className="flex items-center space-x-2">
                <NumericFormat
                  id="installmentsPrice"
                  value={installmentsPrice}
                  onValueChange={(values) => setInstallmentsPrice(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese el precio total en cuotas"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ingrese el precio total si pagara en cuotas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyInflation" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Inflación mensual estimada (%)
              </Label>
              <div className="flex items-center space-x-2">
                <NumericFormat
                  id="monthlyInflation"
                  value={monthlyInflation}
                  onValueChange={(values) => setMonthlyInflation(values.value)}
                  decimalSeparator=","
                  suffix="%"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese la inflación mensual estimada"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ingrese la inflación mensual estimada en porcentaje</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfInstallments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Cantidad de cuotas
              </Label>
              <div className="flex items-center space-x-2">
                <NumericFormat
                  id="numberOfInstallments"
                  value={numberOfInstallments}
                  onValueChange={(values) => setNumberOfInstallments(values.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese la cantidad de cuotas"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ingrese en cuántas cuotas desea pagar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <Button
            onClick={calculateInstallments}
            className="w-full h-16 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
          >
            Calcular
          </Button>

          {recommendation && (
            <>
              <Alert
                variant={recommendation.type === "cuotas" ? "default" : "destructive"}
                className={
                  recommendation.type === "cuotas" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }
              >
                <div className="flex items-start justify-center">
                  {recommendation.type === "cuotas" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  )}
                  <AlertDescription className="text-gray-800">
                    <span className="text-lg font-bold block mb-1 ">
                      {recommendation.type === "cuotas"
                        ? "Te conviene comprar en cuotas!"
                        : "Te conviene comprar en efectivo!"}
                    </span>
                  </AlertDescription>
                </div>
              </Alert>

              {showFinancedDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Monto Final en Términos Reales</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">
                          <AnimatedCounter
                            value={totalRealValue}
                            formatter={formatCurrency}
                          />
                        </span>
                        <span className="ml-2 opacity-80">total</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 opacity-80" />
                          <span className="text-sm">
                            {numberOfInstallments} cuotas de{" "}
                            <span className="font-semibold">
                              {formatCurrency(
                                Number(installmentsPrice.replace(/[^\d.-]/g, "")) / Number(numberOfInstallments),
                              )}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Percent className="h-5 w-5 opacity-80" />
                          <span className="text-sm">
                            Interés total: <span className="font-semibold">{interestRate.toFixed(2)}%</span>
                          </span>
                          </div>
                          </div>
                        </div>

                        <div className="bg-blue-500/30 p-4 rounded-lg">
                          <h4 className="text-lg font-medium mb-1">Inflación Estimada</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-5 w-5 opacity-80" />
                            <span className="text-sm">
                              Mensual: <span className="font-semibold text-lg">{monthlyInflation}%</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="h-5 w-5 opacity-80" />
                            <span className="text-sm">
                              Anual: <span className="font-semibold text-lg">{annualInflation.toFixed(2)}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <motion.div
                          className="p-6 bg-white"
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              Precio al contado
                            </h4>
                            <span className="text-xl font-bold">
                              <AnimatedCounter
                                value={Number(cashPrice.replace(/[^\d.-]/g, ""))}
                                formatter={formatCurrency}
                              />
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">Pago único inmediato</div>
                        </motion.div>

                        <motion.div
                          className="p-6 bg-gray-50"
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-gray-500" />
                              Precio en cuotas
                            </h4>
                            <span className="text-xl font-bold">
                              <AnimatedCounter
                                value={Number(installmentsPrice.replace(/[^\d.-]/g, ""))}
                                formatter={formatCurrency}
                              />
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Diferencia:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                difference
                              )}
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      <div className="p-6 border-t">
                        <div className="mb-4 flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {recommendation.type === "cuotas" ? "En términos reales, te ahorras" : "En términos reales, tenes un costo adicional de"}:
                          </span>
                          <span className="text-lg font-semibold">{formatCurrency(Math.abs(difference - Math.abs(totalSavings)))}</span>
                        </div>

                        <div className="flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${recommendation.type === "cuotas" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {recommendation.type === "cuotas" ? (
                              <>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Financiar es más conveniente
                              </>
                            ) : (
                              <>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Pagar al contado es más conveniente
                              </>
                            )}
                          </motion.div>
                        </div>
                      </div>


                      
                      <div className="px-6 pb-4 pt-2 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {showDetailedBreakdown ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Ocultar desglose detallado
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Ver desglose detallado
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
           
           <AnimatePresence>
                {showDetailedBreakdown && results.length > 0 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="bg-blue-50 p-4 rounded-lg"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-lg font-semibold mb-2">Resumen</h3>
                      <p>
                        Pagando en {numberOfInstallments} cuotas de{" "}
                        {formatCurrency(
                          Number(installmentsPrice.replace(/[^\d.-]/g, "")) / Number(numberOfInstallments),
                        )}
                        , con una inflación mensual estimada del {monthlyInflation}%, usted:
                      </p>
                      <p className="mt-2 font-semibold text-green-600">
                        Se ahorra un total de {formatCurrency(totalSavings)} en términos reales, sobre tus {formatCurrency(Number(installmentsPrice.replace(/[^\d.-]/g, "")))} pagados en cuotas.
                      </p>
                    </motion.div>

                    <motion.div
                      className="rounded-lg border overflow-hidden"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mes</TableHead>
                            <TableHead>Cuota nominal</TableHead>
                            <TableHead>Valor real</TableHead>
                            <TableHead>Ahorro del mes</TableHead>
                            <TableHead>Ahorro acumulado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((row) => (
                            <TableRow key={row.month}>
                              <TableCell>{row.month}</TableCell>
                              <TableCell>{formatCurrency(row.installmentAmount)}</TableCell>
                              <TableCell>{formatCurrency(row.realValue)}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(row.savings)}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(row.accumulatedSavings)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default InstallmentsCalculator

