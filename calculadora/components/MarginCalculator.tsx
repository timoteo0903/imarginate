"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { NumericFormat } from "react-number-format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}

const calculateVAT = (amount: number, vatRate: number) => {
  return amount * vatRate
}

const MarginCalculator = () => {
  const [cost, setCost] = useState("")
  const [includeVAT, setIncludeVAT] = useState(false)
  const [markup, setMarkup] = useState("")
  const [sellWithVAT, setSellWithVAT] = useState(false)
  const [saleVAT, setSaleVAT] = useState("customer") // 'customer' or 'business'
  const [vatPercentage, setVatPercentage] = useState("21")
  const [saleVatPercentage, setSaleVatPercentage] = useState("21")
  const [results, setResults] = useState<{
    sellingPrice: string
    grossProfit: string
    grossMarginPercentage: string
    finalPrice: string
    purchaseVAT: string
    sistemPrice: string
    saleVAT: string
    vatBalance: string
    netProfit: string
  } | null>(null)
  const [purchaseVAT, setPurchaseVAT] = useState<string>("")
  const [saleVATAmount, setSaleVATAmount] = useState<string>("")

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
      let sistemPrice: number

      if (sellWithVAT) {
        if (saleVAT === "customer") {
          finalPrice = sellingPrice * (1 + saleVatRate)
          saleVATAmountValue = finalPrice - sellingPrice
          setSaleVATAmount(formatCurrency(saleVATAmountValue))
          sistemPrice = sellingPrice
          grossProfit = finalPrice - inputCost
        } else {
          finalPrice = sellingPrice
          sellingPrice = sellingPrice / (1 + saleVatRate)
          saleVATAmountValue = finalPrice - sellingPrice
          setSaleVATAmount(formatCurrency(saleVATAmountValue))
          sistemPrice = sellingPrice
          grossProfit = finalPrice - inputCost
        }
      } else {
        finalPrice = sellingPrice
        saleVATAmountValue = 0
        setSaleVATAmount("")
        sistemPrice = sellingPrice
        grossProfit = sellingPrice - inputCost
      }

      const vatBalance = purchaseVATValue - saleVATAmountValue
      const netProfit = grossProfit + vatBalance
      const grossMarginPercentage = (netProfit / sistemPrice) * 100

      setResults({
        sellingPrice: formatCurrency(sellingPrice),
        grossProfit: formatCurrency(grossProfit),
        grossMarginPercentage: grossMarginPercentage.toFixed(2),
        finalPrice: formatCurrency(finalPrice),
        purchaseVAT: formatCurrency(purchaseVATValue),
        sistemPrice: formatCurrency(sistemPrice),
        saleVAT: formatCurrency(saleVATAmountValue),
        vatBalance: formatCurrency(vatBalance),
        netProfit: formatCurrency(netProfit),
      })
    } else {
      setResults(null)
      setPurchaseVAT("")
      setSaleVATAmount("")
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

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Calculadora de Margen</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="cost" className="block text-sm font-medium mb-1">
              Costo ($)
            </Label>
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
            <NumericFormat
              id="markup"
              value={markup}
              onValueChange={(values) => setMarkup(values.value)}
              decimalSeparator=","
              suffix="%"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ingrese el MarkUp"
            />
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
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Ganancias</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Ganancia por venta:</span>
                <span className="text-green-600">{results.netProfit}</span>
                <span className="font-medium">Porcentaje de ganancia:</span>
                <span className="text-green-600">{results.grossMarginPercentage}%</span>
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
                  <span className="font-medium">
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "IVA en contra" : "IVA a favor"}.
                    </span>
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
                  Tu ganancia es de {results.netProfit}, que representa el {results.grossMarginPercentage}% del precio
                  de venta.
                </p>
                {sellWithVAT && (
                  <p className="mt-2">
                    Recuerda que del IVA que cobras en la venta ({saleVATAmount}, al{" "}
                    {saleVatPercentage === "custom" ? `${saleVatPercentage}%` : `${saleVatPercentage}%`}), tenes{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "en contra" : "a favor"} {results.vatBalance}{" "}.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MarginCalculator

