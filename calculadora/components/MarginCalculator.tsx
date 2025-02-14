"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { NumericFormat } from "react-number-format"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}

const MarginCalculator = () => {
  const [cost, setCost] = useState("")
  const [includeVAT, setIncludeVAT] = useState(false)
  const [markup, setMarkup] = useState("")
  const [sellWithVAT, setSellWithVAT] = useState(false)
  const [saleVAT, setSaleVAT] = useState("customer") // 'customer' or 'business'
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

  const calculateMargin = () => {
    const inputCost = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
    const markupValue = Number.parseFloat(markup)

    if (inputCost && markupValue) {
      let costWithoutVAT: number
      let purchaseVAT: number

      if (includeVAT) {
        costWithoutVAT = inputCost / 1.21
        purchaseVAT = inputCost - costWithoutVAT
      } else {
        costWithoutVAT = inputCost
        purchaseVAT = 0
      }

      let sellingPrice = inputCost * (1 + markupValue / 100)
      let grossProfit: number
      let finalPrice: number
      let saleVATAmount: number
      let sistemPrice: number

      if (sellWithVAT) {
        if (saleVAT === "customer") {
          finalPrice = sellingPrice * 1.21
          saleVATAmount = finalPrice - sellingPrice
          sistemPrice = sellingPrice
          grossProfit = finalPrice - inputCost
        } else {
          finalPrice = sellingPrice
          sellingPrice = sellingPrice / 1.21
          saleVATAmount = finalPrice - sellingPrice
          sistemPrice = sellingPrice
          grossProfit = finalPrice - inputCost
        }
      } else {
        finalPrice = sellingPrice
        saleVATAmount = 0
        sistemPrice = sellingPrice
        grossProfit = sellingPrice - inputCost
      }

      const vatBalance = purchaseVAT - saleVATAmount
      const netProfit = grossProfit + vatBalance
      const grossMarginPercentage = (netProfit / sistemPrice) * 100

      setResults({
        sellingPrice: formatCurrency(sellingPrice),
        grossProfit: formatCurrency(grossProfit),
        grossMarginPercentage: grossMarginPercentage.toFixed(2),
        finalPrice: formatCurrency(finalPrice),
        purchaseVAT: formatCurrency(purchaseVAT),
        sistemPrice: formatCurrency(sistemPrice),
        saleVAT: formatCurrency(saleVATAmount),
        vatBalance: formatCurrency(vatBalance),
        netProfit: formatCurrency(netProfit),
      })
    } else {
      setResults(null)
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
              onValueChange={(values) => setCost(values.value)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ingrese el costo"
            />
            {results && includeVAT && <p className="text-green-600 text-xs mt-1">IVA COMPRA: {results.purchaseVAT}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeVAT"
              checked={includeVAT}
              onCheckedChange={(checked) => setIncludeVAT(checked as boolean)}
            />
            <Label htmlFor="includeVAT">Costo incluye IVA</Label>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sellWithVAT"
              checked={sellWithVAT}
              onCheckedChange={(checked) => setSellWithVAT(checked as boolean)}
            />
            <Label htmlFor="sellWithVAT">¿Vendes con IVA?</Label>
          </div>

          {sellWithVAT && (
            <div>
              <Label className="block text-sm font-medium mb-1">IVA en Venta</Label>
              <RadioGroup
                defaultValue="customer"
                onValueChange={(value) => setSaleVAT(value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">Cliente se hace cargo (Precio + 21% IVA)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business">Negocio absorbe el IVA</Label>
                </div>
              </RadioGroup>
            </div>
          )}

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
                  <span className="font-medium">IVA en la compra:</span>
                  <span>{results.purchaseVAT}</span>
                  <span className="font-medium">IVA en la venta:</span>
                  <span>{results.saleVAT}</span>
                  <span className="font-medium">
                  {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "IVA a pagar" : "IVA a recibir"}:</span>
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
                    Recuerda que del IVA que cobras en la venta ({results.saleVAT}), debes{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "pagar" : "recibir"} {results.vatBalance}{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "al" : "del"} gobierno.
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

