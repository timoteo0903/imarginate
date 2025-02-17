"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { NumericFormat } from "react-number-format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Percent, DollarSign } from "lucide-react"
import AdditionalChargesSection from "./AdditionalChargesSection"
import { Switch } from "@/components/ui/switch"
import PriceBreakdownChart from "./PriceBreakdownChart"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}

const calculateVAT = (amount: number, vatRate: number) => {
  return amount * vatRate
}

interface AdditionalCharge {
  name: string
  rate: number
}

const MarginCalculator = () => {
  const [cost, setCost] = useState("")
  const [includeVAT, setIncludeVAT] = useState(false)
  const [markup, setMarkup] = useState("")
  const [sellWithVAT, setSellWithVAT] = useState(false)
  const [saleVAT, setSaleVAT] = useState("customer")
  const [vatPercentage, setVatPercentage] = useState("21")
  const [saleVatPercentage, setSaleVatPercentage] = useState("21")
  const [perceptions, setPerceptions] = useState<AdditionalCharge[]>([])
  const [internalTaxes, setInternalTaxes] = useState<AdditionalCharge[]>([])
  const [results, setResults] = useState<{
    sellingPrice: string
    grossProfit: string
    grossMarginPercentage: string
    finalPrice: string
    purchaseVAT: string
    saleVAT: string
    vatBalance: string
    netProfit: string
    perceptionsTotal: string
    internalTaxesTotal: string
    totalTaxes: string
    finalPriceAT: string
    finalPriceWithDiscount: string
    discountAmount: string
    maxDiscountPercentage:string
  } | null>(null)
  const [purchaseVAT, setPurchaseVAT] = useState<string>("")
  const [saleVATAmount, setSaleVATAmount] = useState<string>("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<string>("")
  const [maxDiscount, setMaxDiscount] = useState<number>(0)
  const [,setMaxDiscountPercentage] = useState<number>(0)

  const [chartData, setChartData] = useState<{
    cost: number
    finalPrice: number
    profit: number
    discount: number
    taxes:number
    vatBalance:number
  } | null>(null)

  const calculateMargin = () => {
    const inputCost = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
    const markupValue = Number.parseFloat(markup)
    const vatRate =
      vatPercentage === "custom" ? Number.parseFloat(vatPercentage) / 100 : Number.parseFloat(vatPercentage) / 100
    const saleVatRate =
      saleVatPercentage === "custom"
        ? Number.parseFloat(saleVatPercentage) / 100
        : Number.parseFloat(saleVatPercentage) / 100

    if (inputCost && markupValue) {
      let costWithoutVAT: number
      let purchaseVATValue: number

      if (includeVAT) {
        costWithoutVAT = inputCost / (1 + vatRate)
        purchaseVATValue = calculateVAT(costWithoutVAT, vatRate)
        setPurchaseVAT(formatCurrency(purchaseVATValue))
      } else {
        costWithoutVAT = inputCost
        purchaseVATValue = 0
        setPurchaseVAT("")
      }

      let sellingPrice = costWithoutVAT * (1 + markupValue / 100)
      let grossProfit: number
      let finalPrice: number
      let saleVATAmountValue: number

      if (sellWithVAT) {
        if (saleVAT === "customer") {
          finalPrice = sellingPrice * (1 + saleVatRate)
          saleVATAmountValue = finalPrice - sellingPrice
          setSaleVATAmount(formatCurrency(saleVATAmountValue))
          grossProfit = finalPrice - inputCost
        } else {
          finalPrice = sellingPrice
          sellingPrice = sellingPrice / (1 + saleVatRate)
          saleVATAmountValue = finalPrice - sellingPrice
          setSaleVATAmount(formatCurrency(saleVATAmountValue))
          grossProfit = finalPrice - inputCost
        }
      } else {
        finalPrice = sellingPrice
        saleVATAmountValue = 0
        setSaleVATAmount("")
        grossProfit = sellingPrice - inputCost
      }

      const perceptionsTotal = perceptions.reduce(
        (total, perception) => total + (sellingPrice * perception.rate) / 100,
        0,
      )
      const internalTaxesTotal = internalTaxes.reduce((total, tax) => total + (sellingPrice * tax.rate) / 100, 0)
       
      const totalTaxes = Number(perceptionsTotal + internalTaxesTotal)
      const finalPriceAT = finalPrice - totalTaxes

 
      // Aplicar el descuento
      let discountAmount = 0
      if (discountType === "percentage") {
        discountAmount = (finalPrice * Number(discountValue)) / 100
      } else {
        discountAmount = Number(discountValue)
      }

      const finalPriceWithDiscount = finalPriceAT - discountAmount

      const vatBalance = purchaseVATValue - saleVATAmountValue
      const netProfit = grossProfit + vatBalance - totalTaxes - discountAmount
      const grossMarginPercentage = (netProfit / finalPriceWithDiscount) * 100


      // Calcular el descuento máximo
      const maxDiscountAmount = finalPriceAT - inputCost + vatBalance
      setMaxDiscount(maxDiscountAmount)

      const maxDiscountPercentage = (maxDiscountAmount / finalPriceAT) * 100
      setMaxDiscountPercentage(maxDiscountPercentage)


      setResults({
        sellingPrice: formatCurrency(sellingPrice),
        grossProfit: formatCurrency(grossProfit),
        grossMarginPercentage: grossMarginPercentage.toFixed(2),
        finalPrice: formatCurrency(finalPrice),
        purchaseVAT: formatCurrency(purchaseVATValue),
        saleVAT: formatCurrency(saleVATAmountValue),
        vatBalance: formatCurrency(vatBalance),
        netProfit: formatCurrency(netProfit),
        perceptionsTotal: formatCurrency(perceptionsTotal),
        internalTaxesTotal: formatCurrency(internalTaxesTotal),
        totalTaxes: formatCurrency(totalTaxes),
        finalPriceAT: formatCurrency(finalPriceAT),
        finalPriceWithDiscount: formatCurrency(finalPriceWithDiscount),
        discountAmount: formatCurrency(discountAmount),
        maxDiscountPercentage: maxDiscountPercentage.toFixed(2)
      })
      setChartData({
        cost: Number(cost),
        finalPrice: finalPriceWithDiscount,
        profit: netProfit,
        taxes: totalTaxes,
        discount: discountAmount,
        vatBalance: Math.abs(vatBalance),
      })
    } else {
      setResults(null)
      setPurchaseVAT("")
      setSaleVATAmount("")
      setMaxDiscount(0)
      setMaxDiscountPercentage(0)
      setChartData(null)
    }
  }

  const updatePurchaseVAT = (newVatPercentage: string) => {
    setVatPercentage(newVatPercentage)
    if (includeVAT && cost) {
      const vatRate =
        newVatPercentage === "custom"
          ? Number.parseFloat(newVatPercentage) / 100
          : Number.parseFloat(newVatPercentage) / 100
      const costValue = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
      const costWithoutVAT = costValue / (1 + vatRate)
      const vatAmount = costValue - costWithoutVAT
      setPurchaseVAT(formatCurrency(vatAmount))
    } else {
      setPurchaseVAT("")
    }
  }

  const updateSaleVAT = (newSaleVatPercentage: string) => {
    setSaleVatPercentage(newSaleVatPercentage)
    if (sellWithVAT && results?.sellingPrice) {
      const vatRate =
        newSaleVatPercentage === "custom"
          ? Number.parseFloat(newSaleVatPercentage) / 100
          : Number.parseFloat(newSaleVatPercentage) / 100
      const sellingPriceValue = Number.parseFloat(results.sellingPrice.replace(/[^\d.-]/g, ""))
      const vatAmount = calculateVAT(sellingPriceValue, vatRate)
      setSaleVATAmount(formatCurrency(vatAmount))
    } else {
      setSaleVATAmount("")
    }
  }

  useEffect(() => {
    calculateMargin()
  }, [cost, discountType, discountValue])

  useEffect(() => {
    calculateMargin()
  }, [perceptions, internalTaxes])

  return (
    <Card className="w-full max-w-[60%] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Calculadora de Margen</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="cost" className="block text-sm font-medium mb-1">
              Costo ($)
            </Label>
            <div className="flex items-center space-x-2">
              <NumericFormat
                id="cost"
                value={cost}
                onValueChange={(values) => {
                  setCost(values.value)
                  if (includeVAT && vatPercentage) {
                    const vatRate =
                      vatPercentage === "custom"
                        ? Number.parseFloat(vatPercentage) / 100
                        : Number.parseFloat(vatPercentage) / 100
                    const costValue = Number.parseFloat(values.value.replace(/[^\d.-]/g, ""))
                    const costWithoutVAT = costValue / (1 + vatRate)
                    const vatAmount = costValue - costWithoutVAT
                    setPurchaseVAT(formatCurrency(vatAmount))
                  }
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ingrese el costo"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ingrese el costo del producto sin IVA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {includeVAT && purchaseVAT && (
              <p className="text-green-600 text-xs mt-1">
                IVA COMPRA ({vatPercentage === "custom" ? `${vatPercentage}%` : `${vatPercentage}%`}): {purchaseVAT}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeVAT"
                checked={includeVAT}
                onCheckedChange={(checked) => {
                  setIncludeVAT(checked as boolean)
                  if (checked && cost && vatPercentage) {
                    const vatRate =
                      vatPercentage === "custom"
                        ? Number.parseFloat(vatPercentage) / 100
                        : Number.parseFloat(vatPercentage) / 100
                    const costValue = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
                    const costWithoutVAT = costValue / (1 + vatRate)
                    const vatAmount = costValue - costWithoutVAT
                    setPurchaseVAT(formatCurrency(vatAmount))
                  } else {
                    setPurchaseVAT("")
                  }
                }}
              />
              <Label htmlFor="includeVAT">Costo incluye IVA</Label>
            </div>
            {includeVAT && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium mb-1">IVA en Compra</Label>
                <div className="flex items-center space-x-2">
                  <Select value={vatPercentage} onValueChange={updatePurchaseVAT}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione el IVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5">2,5%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10.5">10,5%</SelectItem>
                      <SelectItem value="21">21%</SelectItem>
                      <SelectItem value="27">27%</SelectItem>
                      <SelectItem value="0">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="markup" className="block text-sm font-medium mb-1">
              MarkUp (%)
            </Label>
            <div className="flex items-center space-x-2">
              <NumericFormat
                id="markup"
                value={markup}
                onValueChange={(values) => setMarkup(values.value)}
                decimalSeparator=","
                suffix="%"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ingrese el MarkUp"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Porcentaje que agregas al costo de un producto para obtener su precio de venta. </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sellWithVAT"
                checked={sellWithVAT}
                onCheckedChange={(checked) => setSellWithVAT(checked as boolean)}
              />
              <Label htmlFor="sellWithVAT">¿Vendes con IVA?</Label>
            </div>
            {sellWithVAT && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium mb-1">IVA en Venta</Label>
                <div className="flex items-center space-x-2">
                  <Select value={saleVatPercentage} onValueChange={updateSaleVAT}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione el IVA de venta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5">2,5%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10.5">10,5%</SelectItem>
                      <SelectItem value="21">21%</SelectItem>
                      <SelectItem value="27">27%</SelectItem>
                      <SelectItem value="0">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <RadioGroup
                  defaultValue="customer"
                  onValueChange={(value) => setSaleVAT(value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">
                      Cliente se hace cargo (Precio +{" "}
                      {saleVatPercentage === "custom" ? saleVatPercentage : `${saleVatPercentage}%`} IVA)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Negocio absorbe el IVA</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <Button onClick={calculateMargin} className="w-full" type="button">
            Calcular Margen
          </Button>
        </form>

        {results && (
          <div className="mt-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Resumen de la Venta</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Costo del producto:</span>
                <span>{formatCurrency(Number(cost.replace(/[^\d.-]/g, "")))}</span>

                {sellWithVAT ? (
                  <>
                    <span className="font-medium">Precio de venta (sin IVA):</span>
                    <span>{results.sellingPrice}</span>
                    <span className="font-medium">Precio final (con IVA):</span>
                    <span>{results.finalPrice}</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Precio de venta:</span>
                    <span>{results.sellingPrice}</span>
                  </>
                )}

                <span className="font-medium ">Total Percepciones:</span>
                <span className=" text-red-500 ">{results.totalTaxes}</span>

                <span className="font-medium">Monto a recibir después de impuestos:</span>
                <span>{results.finalPriceAT}</span>
              </div>

              <AdditionalChargesSection
                perceptions={perceptions}
                internalTaxes={internalTaxes}
                results={results}
                formatCurrency={formatCurrency}
                updatePerception={(index, field, value) => {
                  const updatedPerceptions = [...perceptions]
                  if (field === "name") {
                    updatedPerceptions[index].name = value
                  } else {
                    updatedPerceptions[index].rate = Number(value)
                  }
                  setPerceptions(updatedPerceptions)
                }}
                updateInternalTax={(index, field, value) => {
                  const updatedInternalTaxes = [...internalTaxes]
                  if (field === "name") {
                    updatedInternalTaxes[index].name = value
                  } else {
                    updatedInternalTaxes[index].rate = Number(value)
                  }
                  setInternalTaxes(updatedInternalTaxes)
                }}
                removePerception={(index) => {
                  setPerceptions(perceptions.filter((_, i) => i !== index))
                }}
                removeInternalTax={(index) => {
                  setInternalTaxes(internalTaxes.filter((_, i) => i !== index))
                }}
                addPerception={() => {
                  setPerceptions([...perceptions, { name: "", rate: 0 }])
                }}
                addInternalTax={() => {
                  setInternalTaxes([...internalTaxes, { name: "", rate: 0 }])
                }}
              />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Descuento</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={discountType === "percentage"}
                    onCheckedChange={(checked) => setDiscountType(checked ? "percentage" : "fixed")}
                  />
                  <Label>
                    {discountType === "percentage" ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                  </Label>
                  <NumericFormat
                    value={discountValue}
                    onValueChange={(values) => setDiscountValue(values.value)}
                    decimalSeparator=","
                    suffix={discountType === "percentage" ? "%" : ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={`Ingrese el descuento ${discountType === "percentage" ? "porcentual (%)" : "fijo ($)"}`}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-8 w-8 text-muted-foreground hover:text-[#1f2b3e] cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Descuento máximo sin pérdida:{" "}
                          {discountType === "percentage"
                            ? `${results.maxDiscountPercentage}%`
                            : formatCurrency(maxDiscount)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>


            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Resumen con Descuento</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Descuento aplicado:</span>
                <span>{results.discountAmount}</span>
                <span className="font-medium">Monto final a recibir con descuento:</span>
                <span>{results.finalPriceWithDiscount}</span>
              </div>
            </div>

            {sellWithVAT && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Desglose del IVA</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">
                    IVA en la compra ({vatPercentage === "custom" ? `${vatPercentage}%` : `${vatPercentage}%`}):
                  </span>
                  <span>{purchaseVAT}</span>
                  <span className="font-medium">
                    IVA en la venta (
                    {saleVatPercentage === "custom" ? `${saleVatPercentage}%` : `${saleVatPercentage}%`}):
                  </span>
                  <span>{saleVATAmount}</span>
                  <span className="font-medium">Balanza de IVA:</span>
                  <span
                    className={
                      Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "text-red-500" : "text-green-600"
                    }
                  >
                    {results.vatBalance}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Ganancias Netas</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Ganancia por venta:</span>
                <span className="text-green-600">{results.netProfit}</span>
                <span className="font-medium">Porcentaje de ganancia:</span>
                <span className="text-green-600">{results.grossMarginPercentage}%</span>
              </div>
            </div>
            <Alert variant="default">
              <AlertDescription>
                <p className="mb-2">
                  <strong>Explicación simple:</strong>
                </p>
                <p>
                  Compras el producto por {formatCurrency(Number(cost.replace(/[^\d.-]/g, "")))} y lo vendes por{" "}
                  {results.finalPrice}.
                </p>
                <p>
                  Tu ganancia después de impuestos y descuentos, es de {results.netProfit}, que representa el{" "}
                  {results.grossMarginPercentage}% del precio de venta.
                </p>
                {sellWithVAT && (
                  <p className="mt-2">
                    Recuerda que del IVA que cobras en la venta ({saleVATAmount}, al{" "}
                    {saleVatPercentage === "custom" ? `${saleVatPercentage}%` : `${saleVatPercentage}%`}), debes{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "pagar" : "recibir"} {results.vatBalance}{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "al" : "del"} gobierno.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

          {results && chartData && (
            <PriceBreakdownChart
              cost={chartData.cost}
              finalPrice={chartData.finalPrice}
              profit={chartData.profit}
              totalTaxes={chartData.taxes}
              discount={chartData.discount}
              vatBalance={chartData.vatBalance}
            />
          )}
      </CardContent>
      
    </Card>
  )
}

export default MarginCalculator

