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
  const [marginMethod, setMarginMethod] = useState<"markup" | "marginOnSale">("markup")
  const [marginValue, setMarginValue] = useState("")
  const [sellWithVAT, setSellWithVAT] = useState(false)
  const [saleVAT, setSaleVAT] = useState("customer")
  const [vatPercentage, setVatPercentage] = useState("21")
  const [saleVatPercentage, setSaleVatPercentage] = useState("21")
  const [perceptions, setPerceptions] = useState<AdditionalCharge[]>([])
  const [internalTaxes, setInternalTaxes] = useState<AdditionalCharge[]>([])
  const [discount, setDiscount] = useState<number>(0);
  const [salePriceDiscount, setsalePriceDiscount] = useState<number>(0);
  const [netAmountDiscount, setnetAmountDiscount] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0)
  const [maxDiscountPercentage,setMaxDiscountPercentage] = useState<number>(0)
  const [results, setResults] = useState<{
    netAmount: string
    grossProfit: string
    grossMarginPercentage: string
    salePrice: string
    purchaseVAT: string
    saleVAT: string
    vatBalance: string
    netProfit: string
    perceptionsTotal: string
    internalTaxesTotal: string
    totalTaxes: string
    salePriceAT: string
    discount: string
  } | null>(null)
  const [purchaseVAT, setPurchaseVAT] = useState<number>(0)
  const [saleVATAmount, setSaleVATAmount] = useState<number>(0)
  const [vatBalance, setVatBalance] = useState<string>("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<string>("")

  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  

  //Chart
  const [chartData, setChartData] = useState<{
    cost: number
    salePrice: number
    netProfit: number
    discountAmount: number
    taxes:number
    vatBalance:number
  } | null>(null)



  const calculateMargin = () => {
    const inputCost = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
    const marginValueNumber = Number.parseFloat(marginValue)
    const vatRate =
      vatPercentage === "custom" ? Number.parseFloat(vatPercentage) / 100 : Number.parseFloat(vatPercentage) / 100
    const saleVatRate =
      saleVatPercentage === "custom"
        ? Number.parseFloat(saleVatPercentage) / 100
        : Number.parseFloat(saleVatPercentage) / 100

    if (marginMethod === "marginOnSale" && marginValueNumber >= 100) {
      alert("El margen sobre venta debe ser menor al 100%.")
      setResults(null)
      setChartData(null)
      return
    }    

    if (inputCost && marginValueNumber) {
      let costWithoutVAT: number
      let purchaseVATValue: number

      if (includeVAT) {
        costWithoutVAT = inputCost / (1 + vatRate)
        purchaseVATValue = calculateVAT(costWithoutVAT, vatRate)
        setPurchaseVAT(purchaseVATValue)
      } else {
        costWithoutVAT = inputCost
        purchaseVATValue = 0
        setPurchaseVAT(0)
      }

      let netAmount: number //Importe Neto Gravado (SObre esto calculo los %)
      if (marginMethod === "markup") {
        netAmount = inputCost * (1 + marginValueNumber / 100);
      } 
      else {
          netAmount = inputCost / (1 - marginValueNumber / 100);
        }
      
      let salePrice: number
      let saleVATAmountValue: number



      

      if (sellWithVAT) {
        if (saleVAT === "customer") {
          salePrice = netAmount * (1 + saleVatRate)
          saleVATAmountValue = netAmount * saleVatRate
          setSaleVATAmount(saleVATAmountValue)
          setnetAmountDiscount(netAmount)
        } else {
          salePrice = netAmount
          netAmount = salePrice / (1 + saleVatRate)
          saleVATAmountValue = netAmount * saleVatRate
          setSaleVATAmount(saleVATAmountValue)
          setnetAmountDiscount(salePrice)
        }
      } else {
        salePrice = netAmount
        saleVATAmountValue = 0
        setSaleVATAmount(0)
      }

      
      const perceptionsTotal = perceptions.reduce(
        (total, perception) => total + (netAmount * perception.rate) / 100,
        0,
      )
      const internalTaxesTotal = internalTaxes.reduce((total, tax) => total + (netAmount * tax.rate) / 100, 0)
      
      const totalTaxes = Number(perceptionsTotal + internalTaxesTotal)
      const salePriceAT = salePrice + totalTaxes
      
      
      // Aplicar el descuento
      let discountAmount = 0
      if (discountType === "percentage") {
        discountAmount = (salePriceAT * Number(discountValue)) / 100
        setDiscount(discountAmount)
      } else {
        discountAmount = Number(discountValue)
        setDiscount(discountAmount)
      }
      
      
      const salePriceDiscount = salePrice - discountAmount
      setsalePriceDiscount(salePriceDiscount)
      
      
      // Calculamos el IVA 
      const IVASale = saleVATAmount
      const IVAPurchase = purchaseVAT

      const vatBalance = (IVAPurchase - IVASale)
      
      // Calculo ganancia Neta y Margen de ganancia neta sobre venta
      const grossProfit = salePriceDiscount - inputCost
      const netProfit = grossProfit + vatBalance - totalTaxes 
      const grossMarginPercentage = (netProfit / salePriceAT) * 100
      
      console.log(salePrice, inputCost, grossProfit, netProfit, saleVATAmount)
      
      
      
      // Calcular el descuento máximo  
      const maxDiscountAmount = salePrice - inputCost + vatBalance;
      setMaxDiscount(maxDiscountAmount);  
      
      // Calcular el descuento máximo Porcentual  
      const maxDiscountPercentage = (maxDiscountAmount / salePrice) * 100;
      setMaxDiscountPercentage(maxDiscountPercentage);
      
      
      // Descuento que se ha hecho  
      const discountPercentage = discountAmount > 0 ? (discountAmount / maxDiscount) * 100 : 0;
      setDiscountPercentage(discountPercentage);
      
      setVatBalance(formatCurrency(vatBalance))
      
      setResults({
        netAmount: formatCurrency(netAmount),
        grossProfit: formatCurrency(grossProfit),
        grossMarginPercentage: grossMarginPercentage.toFixed(1),
        salePrice: formatCurrency(salePrice),
        purchaseVAT: formatCurrency(purchaseVATValue),
        saleVAT: formatCurrency(saleVATAmountValue),
        vatBalance: formatCurrency(vatBalance),
        netProfit: formatCurrency(netProfit),
        perceptionsTotal: formatCurrency(perceptionsTotal),
        internalTaxesTotal: formatCurrency(internalTaxesTotal),
        totalTaxes: formatCurrency(totalTaxes),
        salePriceAT: formatCurrency(salePriceAT),
        discount:formatCurrency(discountAmount),
      })
      setChartData({
        cost: Number(cost),
        salePrice: salePrice,
        netProfit: netProfit,
        taxes: totalTaxes,
        discountAmount: discountAmount,
        vatBalance: Math.abs(vatBalance),
      })
    } else {
      setResults(null)
      setPurchaseVAT(0)
      setSaleVATAmount(0)
      setChartData(null)
    }
  }

  // Si se aplica un descuento hay que recalcular el IVA Venta
  useEffect(() => {
    let newSaleVAT = 0;
    if (sellWithVAT && discount) {
      const saleVat = Number.parseFloat(saleVatPercentage) / 100;
      newSaleVAT = calculateVAT(salePriceDiscount, saleVat);
          setSaleVATAmount(newSaleVAT);
          const netAmountDiscount = salePriceDiscount / (1 + saleVat); //Actualizamos Neto Gravado post descuentos
          setnetAmountDiscount(netAmountDiscount);
      }
  }, [vatPercentage, saleVatPercentage, cost, includeVAT, sellWithVAT, discount, vatBalance]);


  
  useEffect(() => {
    calculateMargin()
  }, [cost, discountType, discountValue, vatBalance])

  useEffect(() => {
    calculateMargin()
  }, [perceptions, internalTaxes])

  return (
<Card className="w-full max-w-full md:max-w-[70%] mx-auto">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-center">Calculadora de Margen</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div className="flex flex-col space-y-4 md:grid md:grid-cols-1 gap-4">
        {/* Primer div: Costo */}
        <div className="flex flex-col space-y-2">
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
                  setPurchaseVAT(vatAmount)
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
                  <Info className="h-6 w-6 text-muted-foreground hover:text-[#1f2b3e] cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ingrese el costo del producto sin IVA</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {includeVAT && purchaseVAT && (
            <p className="text-green-600 text-xs mt-1">
              IVA COMPRA ({vatPercentage === "custom" ? `${vatPercentage}%` : `${vatPercentage}%`}): formatCurrency{purchaseVAT}
            </p>
          )}
        </div>

        {/* Segundo div: Costo incluye IVA */}
        <div className="flex flex-col space-y-2">
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
                  setPurchaseVAT(vatAmount)
                } else {
                  setPurchaseVAT(0)
                }
              }}
            />
            <Label htmlFor="includeVAT">Costo incluye IVA</Label>
          </div>
          {includeVAT && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium mb-1 ml-6 ">IVA en Compra</Label>
              <div className="flex items-center space-x-2">
                <Select value={vatPercentage} onValueChange={setVatPercentage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.5">2,5%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10.5">10,5%</SelectItem>
                    <SelectItem value="19">19%</SelectItem>
                    <SelectItem value="21">21%</SelectItem>
                    <SelectItem value="27">27%</SelectItem>
                    <SelectItem value="0">Exento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Tercer div: Método de cálculo */}
        <div className="flex flex-col space-y-2">
          <Label className="block text-sm font-medium mb-1">Método de cálculo</Label>
          <Select value={marginMethod} onValueChange={(value: "markup" | "marginOnSale") => setMarginMethod(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el método de cálculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markup">Markup</SelectItem>
              <SelectItem value="marginOnSale">Margen sobre venta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cuarto div: MarkUp o Margen sobre venta */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="marginValue" className="block text-sm font-medium mb-1">
            {marginMethod === "markup" ? "MarkUp (%)" : "Margen sobre venta (%)"}
          </Label>
          <div className="flex items-center space-x-2">
            <NumericFormat
              id="marginValue"
              value={marginValue}
              onValueChange={(values) => setMarginValue(values.value)}
              decimalSeparator=","
              suffix="%"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={`Ingrese el ${marginMethod === "markup" ? "MarkUp" : "Margen sobre venta"}`}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-6 w-6 text-muted-foreground hover:text-[#1f2b3e] cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {marginMethod === "markup"
                      ? "Porcentaje que agregas al costo de un producto para obtener su precio de venta."
                      : "Porcentaje de margen, calculado sobre el precio de venta."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
                  <Select value={saleVatPercentage} onValueChange={setSaleVatPercentage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione el IVA de venta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5">2,5%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10.5">10,5%</SelectItem>
                      <SelectItem value="19">19%</SelectItem>
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
          

          <Button
            onClick={calculateMargin}
            className="w-full h-10 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
            type="button"
          >
            Calcular Margen
          </Button>
        </form>

        {results && (
          <div className="mt-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Resumen de la Venta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <span className="font-medium">Costo del producto:</span>
                <span>{formatCurrency(Number(cost.replace(/[^\d.-]/g, "")))}</span>

                {sellWithVAT ? (
                  <>
                    <span className="font-medium">Importe Neto Gravado:</span>
                    <span>{results.netAmount}</span>
                    <span className="font-medium">Precio final (con IVA):</span>
                    <span>{results.salePrice}</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Precio de venta:</span>
                    <span>{results.netAmount}</span>
                  </>
                )}

                <span className="font-medium ">Total Percepciones:</span>
                <span className=" text-red-500 ">{results.totalTaxes}</span>

                <span className="font-medium">Monto a recibir después de impuestos:</span>
                <span>{results.salePrice}</span>
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
                <div className="space-y-2">
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
                          <Info className="h-6 w-6 text-muted-foreground hover:text-[#1f2b3e] cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Descuento máximo sin pérdida:{" "}
                            {discountType === "percentage"
                              ? `${maxDiscountPercentage.toFixed(2)}%`
                              : formatCurrency(maxDiscount)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative pt-6">
                    <div className="flex mb-2 items-center justify-between ">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#264653] bg-[#f5f5f5]">
                          Descuento aplicado
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-[#264653]">
                          {discountPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#f5f5f5 ]">
                      <div
                        style={{ width: `${Math.min(discountPercentage, 100)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out ${
                          discountPercentage <= 50
                            ? "bg-[#e9c46a]"
                            : discountPercentage <= 75
                              ? "bg-[#f4a261]"
                              : discountPercentage <= 100
                                ? "bg-[#e76f51]"
                                : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <div className="absolute right-0 -mt-6 pt-3 text-xs text-[#264653]">
                      Máx: {formatCurrency(maxDiscount)}
                    </div>
                  </div>
                  {discountPercentage > 100 && (
                    <p className="text-xs text-red-500 mt-1">Advertencia: El descuento supera el máximo recomendado.</p>
                  )}
                </div>
              </div>
            </div>



            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Resumen con Descuento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <span className="font-medium">Descuento aplicado:</span>
                <span>{formatCurrency(discount)}</span>
                <span className="font-medium">Importe Neto Gravado con descuento:</span>
                <span>{formatCurrency(netAmountDiscount)}</span>
                <span className="font-medium">Monto final a recibir con descuento:</span>
                <span>{formatCurrency(salePriceDiscount)}</span>
              </div>
            </div>

            {sellWithVAT && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Desglose del IVA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <span className="font-medium">
                    IVA en la compra ({vatPercentage === "custom" ? `${vatPercentage}%` : `${vatPercentage}%`}):
                  </span>
                  <span>{formatCurrency(purchaseVAT)}</span>
                  <span className="font-medium">
                    IVA en la venta (
                    {saleVatPercentage === "custom" ? `${saleVatPercentage}%` : `${saleVatPercentage}%`}): 
                  </span>
                  <span>{formatCurrency(saleVATAmount)}</span>
                    <span className="font-medium">Balanza de IVA:</span>
                    <span
                      className={
                        Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0
                          ? "text-red-500"
                          : "text-green-600"
                      }
                    >
                      {vatBalance}
                    </span>

                </div>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Ganancias Netas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  {results.salePrice}.
                </p>
                <p>
                  { Number(results.netProfit.replace(/[^\d.-]/g, "")) < 0 
                  ? <>
                      <strong style={{ color: "red" }}>Estás perdiendo plata</strong>, por cada venta estás perdiendo{" "}
                      <strong style={{ color: "red" }}>{results.netProfit}</strong>.
                    </>
                   :
                    <>
                      Tu ganancia después de impuestos y descuentos, es de <strong style={{ color: "green" }}>{results.netProfit}</strong>., que representa el{" "}
                      {results.grossMarginPercentage}% del precio de venta.
                    </>
                  }
                </p>

                {sellWithVAT && (
                  <p className="mt-2">
                    Recuerda que del IVA que cobras en la venta ({formatCurrency(saleVATAmount)}, al{" "}
                    {saleVatPercentage === "custom" ? `${saleVatPercentage}%` : `${saleVatPercentage}%`}), debes{" "}
                    {Number(results.vatBalance.replace(/[^\d.-]/g, "")) < 0 ? "pagar" : "recibir"} <strong style={{color : "red"}}> {vatBalance}</strong>{" "}
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
              salePrice={chartData.salePrice}
              netProfit={chartData.netProfit}
              totalTaxes={chartData.taxes}
              discountAmount={chartData.discountAmount}
              vatBalance={chartData.vatBalance}
            />
          )}
      </CardContent>
    </Card>
  )
}

export default MarginCalculator
