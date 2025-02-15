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
import { Input } from "@/components/ui/input"
import { Info, Trash2 } from "lucide-react"

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
  const [TaxselectedValue, setTaxSelectedValue] = useState<{ [id: number]: string }>({});
  const [PerceptionselectedValue, setPerceptionSelectedValue] = useState<{ [id: number]: string }>({});
  const [cost, setCost] = useState("")
  const [includeVAT, setIncludeVAT] = useState(false)
  const [markup, setMarkup] = useState("")
  const [sellWithVAT, setSellWithVAT] = useState(false)
  const [saleVAT, setSaleVAT] = useState("customer") // 'customer' or 'business'
  const [vatPercentage, setVatPercentage] = useState("21")
  const [saleVatPercentage, setSaleVatPercentage] = useState("21")
  const [perceptions, setPerceptions] = useState<{ id: number; name: string; rate: number }[]>([]);
  const [internalTaxes, setInternalTaxes] = useState<{ id: number; name: string; rate: number }[]>([]);  
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
    perceptionsTotal: string
    internalTaxesTotal: string
    finalPriceAT: string
  } | null>(null)
  const [purchaseVAT, setPurchaseVAT] = useState<string>("")
  const [saleVATAmount, setSaleVATAmount] = useState<string>("")

  const PerceptionhandleValueChange = (id: number, value: string) => {
    setPerceptionSelectedValue((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const TaxhandleValueChange = (id: number, value: string) => {
    setTaxSelectedValue((prev) => ({
      ...prev,
      [id]: value,
    }));
  };



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

      const perceptionsTotal = perceptions.reduce(
        (total, perception) => total + (sellingPrice * perception.rate) / 100,
        0,
      )
      const internalTaxesTotal = internalTaxes.reduce((total, tax) => total + (sellingPrice * tax.rate) / 100, 0)

      const finalPriceAT = finalPrice -  (perceptionsTotal + internalTaxesTotal)

      const vatBalance = purchaseVATValue - saleVATAmountValue
      const netProfit = grossProfit + vatBalance - perceptionsTotal - internalTaxesTotal
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
        perceptionsTotal: formatCurrency(perceptionsTotal),
        internalTaxesTotal: formatCurrency(internalTaxesTotal),
        finalPriceAT: formatCurrency(finalPriceAT)
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




  // Agregar una nueva percepción
  const addPerception = () => {
    setPerceptions([
      ...perceptions,
      {id: perceptions.length + 1, name: '', rate: 0 },
    ]);
  };


  // Actualizar una percepción
  const updatePerception = (id: number, field: 'name' | 'rate', value: string | number) => {
    const updatedPerceptions = perceptions.map((perception) =>
      perception.id === id
        ? { ...perception, [field]: field === 'rate' ? Number(value) : value }
        : perception
    );
    setPerceptions(updatedPerceptions);
  };

  // Agregar un nuevo impuesto interno
  const addInternalTax = () => {
    setInternalTaxes([
      ...internalTaxes,
      { id: internalTaxes.length + 1, name: '', rate: 0 },
    ]);
  };
  // Actualizar un impuesto interno
  const updateInternalTax = (id: number, field: 'name' | 'rate', value: string) => {
    const updatedInternalTaxes = internalTaxes.map((tax) =>
      tax.id === id
        ? { ...tax, [field]: field === 'rate' ? Number(value) : value }
        : tax
    );
    setInternalTaxes(updatedInternalTaxes);
  };

  const removePerception = (id: number) => {
    // Eliminar percepción por id
    setPerceptions((prev) => prev.filter((perception) => perception.id !== id));
  
    // Eliminar la selección de percepción asociada al id
    setPerceptionSelectedValue((prev) => {
      const updated = { ...prev };
      delete updated[id]; // Eliminar la selección asociada
      return updated;
    });
  };
  
  const removeInternalTax = (id: number) => {
    // Eliminar impuesto interno por id
    setInternalTaxes((prev) => prev.filter((tax) => tax.id !== id));
  
    // Eliminar la selección de impuesto interno asociada al id
    setTaxSelectedValue((prev) => {
      const updated = { ...prev };
      delete updated[id]; // Eliminar la selección asociada
      return updated;
    });
  };
  
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

                {perceptions.length > 0 && (
                  <>
                    <span className="font-medium">Total Percepciones:</span>
                    <span className="text-red-500">{results.perceptionsTotal}</span>
                  </>
                )}

                {internalTaxes.length > 0 && (
                  <>
                    <span className="font-medium red">Total Tasas Internas:</span>
                    <span className="text-red-500">{results.internalTaxesTotal}</span>
                  </>
                )}

                <span className="font-medium">Precio final (con todos los cargos):</span>
                <span>{results.finalPriceAT}</span>
              </div>

              <div className="mt-4 space-y-2">
                <Button onClick={addPerception} variant="outline" size="sm" className="mr-2">
                  Agregar Percepción
                </Button>
                <Button onClick={addInternalTax} variant="outline" size="sm">
                  Agregar Tasa Interna
                </Button>
              </div>

              {perceptions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Percepciones</h4>
                  {perceptions.map((perception) => (
                    <div key={perception.id} className="flex items-center space-x-2 mb-2 2xl">
                      <Select value={PerceptionselectedValue[perception.id]} 
                        onValueChange={(value) => PerceptionhandleValueChange(perception.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccione" className=" text-small "/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IIBB - CABA">IIBB - CABA</SelectItem>
                          <SelectItem value="IIBB - BUENOS AIRES">IIBB - BUENOS AIRES</SelectItem>
                          <SelectItem value="IIBB - CATAMARCA">IIBB - CATAMARCA</SelectItem>
                          <SelectItem value="IIBB - CHACO">IIBB - CHACO</SelectItem>
                          <SelectItem value="IIBB - CHUBUT">IIBB - CHUBUT</SelectItem>
                          <SelectItem value="IIBB - CÓRDOBA">IIBB - CÓRDOBA</SelectItem>
                          <SelectItem value="IIBB - ENTRE RÍOS">IIBB - ENTRE RÍOS</SelectItem>
                          <SelectItem value="IIBB - FORMOSA">IIBB - FORMOSA</SelectItem>
                          <SelectItem value="IIBB - JUJUY">IIBB - JUJUY</SelectItem>
                          <SelectItem value="IIBB - LA PAMPA">IIBB - LA PAMPA</SelectItem>
                          <SelectItem value="IIBB - LA RIOJA">IIBB - LA RIOJA</SelectItem>
                          <SelectItem value="IIBB - MENDOZA">IIBB - MENDOZA</SelectItem>
                          <SelectItem value="IIBB - MISIONES">IIBB - MISIONES</SelectItem>
                          <SelectItem value="IIBB - NEUQUÉN">IIBB - NEUQUÉN</SelectItem>
                          <SelectItem value="IIBB - RÍO NEGRO">IIBB - RÍO NEGRO</SelectItem>
                          <SelectItem value="IIBB - SALTA">IIBB - SALTA</SelectItem>
                          <SelectItem value="IIBB - SAN JUAN">IIBB - SAN JUAN</SelectItem>
                          <SelectItem value="IIBB - SAN LUIS">IIBB - SAN LUIS</SelectItem>
                          <SelectItem value="IIBB - SANTA CRUZ">IIBB - SANTA CRUZ</SelectItem>
                          <SelectItem value="IIBB - SANTA FE">IIBB - SANTA FE</SelectItem>
                          <SelectItem value="IIBB - SANTIAGO DEL ESTERO">IIBB - SANTIAGO DEL ESTERO</SelectItem>
                          <SelectItem value="IIBB - TIERRA DEL FUEGO">IIBB - TIERRA DEL FUEGO</SelectItem>
                          <SelectItem value="IIBB - TUCUMÁN">IIBB - TUCUMÁN</SelectItem>
                        </SelectContent>
                      </Select>   
                      <NumericFormat
                        value={perception.rate}
                        onValueChange={(values) => updatePerception(perception.id, "rate", values.value)}
                        suffix="%"
                        decimalSeparator=","
                        className="w-1/4"
                      />
                      <span className="w-1/4">
                        {formatCurrency(Number(results.sellingPrice.replace(/[^\d,-]/g, "").replace(",", ".")) * (perception.rate / 100))}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => removePerception(perception.id)}>
                                <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {internalTaxes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Tasas Internas</h4>
                  {internalTaxes.map((tax, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Select value={TaxselectedValue[tax.id]} 
                        onValueChange={(value) => TaxhandleValueChange(tax.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IIBB - BUENOS AIRES">TASAS MUNICIPALES</SelectItem>
                          <SelectItem value="IIBB - CABA">TASAS PROVINCIALES</SelectItem>
                          <SelectItem value="IIBB- MENDOZA">TASAS AL COMBUSTIBLE</SelectItem>
                        </SelectContent>
                      </Select>                     
                      <NumericFormat
                        value={tax.rate}
                        onValueChange={(values) => updateInternalTax(tax.id, "rate", values.value)}
                        suffix="%"
                        decimalSeparator=","
                        className="w-1/4"
                      />
                      <span className="w-1/4">
                        {formatCurrency(Number(results.sellingPrice.replace(/[^\d,-]/g, "").replace(",", ".")) * (tax.rate / 100))}  
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => removeInternalTax(tax.id)}>
                                <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                  <span className="font-medium">IVA a pagar/recibir:</span>
                  <span
                    className={
                      Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "text-red-500" : "text-green-600"
                    }
                  >
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "Pagar: " : "Recibir: "}
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
                  Tu ganancia después de impuestos, es de {results.netProfit}, que representa el {results.grossMarginPercentage}% del precio
                  de venta.
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
      </CardContent>
    </Card>
  )
}

export default MarginCalculator

