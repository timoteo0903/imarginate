"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

  useEffect(() => {
    calculateMargin()
  }, [cost, includeVAT, markup, sellWithVAT, saleVAT])

  const calculateMargin = () => {
    const inputCost = Number.parseFloat(cost)
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

      const sellingPrice = inputCost * (1 + markupValue / 100)
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
          saleVATAmount = sellingPrice - sellingPrice / 1.21
          sistemPrice = finalPrice - saleVATAmount
          grossProfit = sellingPrice - inputCost
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
        sellingPrice: sellingPrice.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
        grossMarginPercentage: grossMarginPercentage.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        purchaseVAT: purchaseVAT.toFixed(2),
        sistemPrice: sistemPrice.toFixed(2),
        saleVAT: saleVATAmount.toFixed(2),
        vatBalance: vatBalance.toFixed(2),
        netProfit: netProfit.toFixed(2),
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
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Ingrese el costo"
              className="w-full"
              required
            />
            {results && includeVAT && <p className="text-green-600 text-xs mt-1">IVA COMPRA: ${results.purchaseVAT}</p>}
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
            <Input
              id="markup"
              type="number"
              min="0"
              step="0.1"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              placeholder="Ingrese el MarkUp"
              className="w-full"
              required
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
        </form>

        {results && (
          <div className="mt-6 space-y-4">
            <Alert>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2">
                  {sellWithVAT ? (
                    <>
                      <span className="font-medium">Precio de Venta (sin IVA):</span>
                      <span>${results.sellingPrice}</span>

                      <span className="font-medium">Precio Final (con IVA):</span>
                      <span>${results.finalPrice}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Precio de Venta:</span>
                      <span>${results.sellingPrice}</span>
                    </>
                  )}

                  <span className="font-medium">Ganancia Bruta:</span>
                  <span>${results.grossProfit}</span>

                  {sellWithVAT && (
                    <>
                      <span className="font-medium">IVA Venta:</span>
                      <span>${results.saleVAT}</span>

                      <span className="font-medium">Balanza de IVA:</span>
                      <span className={`${Number.parseFloat(results.vatBalance) < 0 ? "text-red-500" : ""}`}>
                        {Number.parseFloat(results.vatBalance) < 0 ? "- $" : "$"}
                        {Math.abs(Number.parseFloat(results.vatBalance)).toFixed(2)}
                      </span>
                    </>
                  )}

                  <span className="font-medium">Utilidad:</span>
                  <span>${results.netProfit}</span>

                  <span className="font-medium">Margen Bruto:</span>
                  <span>{results.grossMarginPercentage}%</span>
                </div>
              </AlertDescription>
            </Alert>

            <Alert variant="secondary">
              <AlertDescription>
                En este caso queres ganar el {markup}% sobre el costo, es decir, le remarcaste el {markup}% al precio de
                costo. Tu Margen sobre VENTAS es {results.grossMarginPercentage}%. Por cada venta (de $
                {results.finalPrice}) tu ganancia es ${results.netProfit}, que representa el{" "}
                {results.grossMarginPercentage}% de tu Venta.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MarginCalculator

