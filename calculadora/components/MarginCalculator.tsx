"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NumericFormat } from "react-number-format"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  ChevronRight,
  DollarSign,
  Percent,
  PieChart,
  TrendingUp,
  Info,
  Plus,
  Check,
  ArrowRight,
  BarChart2,
  ShoppingCart,
  Trash2,
  AlertCircle,
} from "lucide-react"
import PriceBreakdownChart from "./PriceBreakdownChart"
import ResultState from "./estadoResultados"
import CostBreakdownSection, { type CostComponent } from "./CostBreakdownSection"


interface AdditionalCharge {
  name: string
  rate: number
}

interface MercadoPagoOption {
  method: string
  medium: string
  availability: string
  rate: number | string
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}


const mercadoPagoOptions: MercadoPagoOption[] = [
  { method: "Point", medium: "Tarjeta de débito", availability: "Al instante", rate: 3.25 },
  { method: "Point", medium: "Tarjeta de débito", availability: "2 días", rate: 2.99 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "Al instante", rate: 6.29 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "5 días", rate: 5.39 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "10 días", rate: 4.39 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "18 días", rate: 3.39 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "35 días", rate: 1.49 },
  { method: "Point", medium: "Tarjeta de crédito", availability: "70 días", rate: 0 },
  { method: "Point", medium: "Pix", availability: "Al instante", rate: 3.25 },
  { method: "Point", medium: "Tarjeta prepaga", availability: "Al instante", rate: 6.29 },
  { method: "Point", medium: "Tarjeta prepaga", availability: "3 días", rate: 5.99 },
  { method: "QR", medium: "Mercado Crédito", availability: "Al instante", rate: 1.35 },
  { method: "QR", medium: "Dinero en Mercado Pago", availability: "Al instante", rate: 0.8 },
  { method: "QR", medium: "Tarjeta de débito", availability: "Al instante", rate: 1.35 },
  { method: "QR", medium: "Tarjeta de débito", availability: "2 días", rate: 0.85 },
  { method: "QR", medium: "Tarjeta de crédito", availability: "Al instante", rate: 6.29 },
  { method: "QR", medium: "Tarjeta de crédito", availability: "10 días", rate: 4.39 },
  { method: "QR", medium: "Tarjeta de crédito", availability: "18 días", rate: 3.39 },
  { method: "QR", medium: "Tarjeta de crédito", availability: "35 días", rate: 1.49 },
  { method: "QR", medium: "Tarjeta de crédito", availability: "70 días", rate: 0 },
  { method: "QR", medium: "Tarjeta prepaga", availability: "Al instante", rate: 6.29 },
  { method: "Link de pago", medium: "Todos los medios de pago", availability: "Al instante", rate: 6.29 },
  { method: "Link de pago", medium: "Todos los medios de pago", availability: "10 días", rate: 4.39 },
  { method: "Link de pago", medium: "Todos los medios de pago", availability: "18 días", rate: 3.39 },
  { method: "Link de pago", medium: "Todos los medios de pago", availability: "35 días", rate: 1.49 },
]

const iibbRates: { province: string; rate: number }[] = [
  { province: "CABA", rate: 2.0 },
  { province: "Buenos Aires", rate: 2.0 },
  { province: "Catamarca", rate: 0.0 },
  { province: "Chaco", rate: 5.5 },
  { province: "Chubut", rate: 0.0 },
  { province: "Corrientes", rate: 0.0 },
  { province: "Córdoba", rate: 3.0 },
  { province: "Entre Ríos", rate: 0.0 },
  { province: "Formosa", rate: 0.0 },
  { province: "Jujuy", rate: 0.0 },
  { province: "La Pampa", rate: 1.0 },
  { province: "La Rioja", rate: 0.0 },
  { province: "Mendoza", rate: 0.0 },
  { province: "Misiones", rate: 2.5 },
  { province: "Neuquén", rate: 4.0 },
  { province: "Río Negro", rate: 5.0 },
  { province: "San Juan", rate: 0.0 },
  { province: "San Luis", rate: 0.0 },
  { province: "Salta", rate: 3.6 },
  { province: "Santa Cruz", rate: 0.0 },
  { province: "Santa Fe", rate: 4.5 },
  { province: "Santiago del Estero", rate: 0.0 },
  { province: "Tierra del Fuego", rate: 3.0 },
  { province: "Tucumán", rate: 0.0 }
];

const MarginCalculator = () => {
  // Cost breakdown state
  const [costComponents, setCostComponents] = useState<CostComponent[]>([])

  // Original calculator state
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
  const [discount, setDiscount] = useState<number>(0)
  const [salePriceDiscount, setSalePriceDiscount] = useState<number>(0)
  const [netAmountDiscount, setNetAmountDiscount] = useState<number>(0)
  const [maxDiscount, setMaxDiscount] = useState<number>(0)
  const [maxDiscountPercentage, setMaxDiscountPercentage] = useState<number>(0)
  const [results, setResults] = useState<{
    netAmount: number
    grossProfit: string
    netMarginPercentage: string
    salePrice: number
    salePriceDiscount: number
    purchaseVAT: string
    saleVAT: number
    vatBalance: number
    netProfit: string
    perceptionsTotal: number
    internalTaxesTotal: number
    totalTaxes: number
    mercadoPagoFee: number
    discount: string
  } | null>(null)
  const [purchaseVAT, setPurchaseVAT] = useState<number>(0)
  const [saleVATAmount, setSaleVATAmount] = useState<number>(0)
  const [vatBalance, setVatBalance] = useState<number>(0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<string>("")
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  const [activeStep, setActiveStep] = useState<"costs" | "margin" | "taxes" | "results">("costs")
  const [isCalculating, setIsCalculating] = useState(false)
  const [marginError, setMarginError] = useState<string>("")
  const [useMercadoPago, setUseMercadoPago] = useState<boolean>(false)
  const [mercadoPagoMethod, setMercadoPagoMethod] = useState<string>("Point");
  const [mercadoPagoMedium, setMercadoPagoMedium] = useState<string>("");
  const [mercadoPagoAvailability, setMercadoPagoAvailability] = useState<string>("");
  const [mercadoPagoRate, setMercadoPagoRate] = useState<string>("0");

  // Chart data
  const [chartData, setChartData] = useState<{
    cost: number
    salePrice: number
    salePriceDiscount: number
    netProfit: number
    discountAmount: number
    taxes?: number
    perceptions?: number
    vatBalance: number
    costBreakdown?: { name: string; value: number }[]
    mercadoPagoFee?: number
    mercadoPagoRate?: string
  } | null>(null)

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.2, duration: 0.3 }
    }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    tap: { scale: 0.97 }
  }

  // Update total cost from cost components
  const updateTotalCost = () => {
    if (costComponents.length > 0) {
      const totalCost = costComponents.reduce((sum, component) => sum + component.netAmount + component.vatAmount, 0)
      setCost(totalCost.toString())
    }
  }

  useEffect(() => {
    updateTotalCost()
  }, [costComponents])

  // In the MarginCalculator component, add a function to handle VAT updates
  const handleVATChange = (totalVAT: number) => {
    setPurchaseVAT(totalVAT)
  }

  const calculateMargin = () => {
    setIsCalculating(true)
    
    setTimeout(() => {
      const inputCost = Number.parseFloat(cost.replace(/[^\d.-]/g, ""))
      const marginValueNumber = Number.parseFloat(marginValue)
      const saleVatRate =
        saleVatPercentage === "custom"
          ? Number.parseFloat(saleVatPercentage) / 100
          : Number.parseFloat(saleVatPercentage) / 100

    // Validación de margen sobre venta
    if (marginMethod === "marginOnSale" && marginValueNumber >= 100) {
      setMarginError("El margen sobre venta debe ser menor al 100%")
      setResults(null)
      setChartData(null)
      setIsCalculating(false)
      return
    } else {
      setMarginError("")
    }

    if (inputCost && marginValueNumber) {
      // Use the purchaseVAT value directly from state
      const purchaseVATValue = purchaseVAT

      let netAmount: number // Importe Neto Gravado (Sobre esto calculo los %)
      if (marginMethod === "markup") {
        netAmount = inputCost * (1 + marginValueNumber / 100)
      } else {
        netAmount = inputCost / (1 - marginValueNumber / 100)
      }

      let salePrice: number
      let saleVATAmountValue: number

      if (sellWithVAT) {
          salePrice = netAmount * (1 + saleVatRate)
          saleVATAmountValue = netAmount * saleVatRate
          setSaleVATAmount(saleVATAmountValue)
          setNetAmountDiscount(netAmount)
        } 
      else {
        salePrice = netAmount
        saleVATAmountValue = 0
        setSaleVATAmount(0)
      }

      
      // Calcular comisiones de Mercado Pago si está habilitado
      let mercadoPagoFee = 0
      if (useMercadoPago) {
        mercadoPagoFee = (salePrice * Number(mercadoPagoRate)) / 100
      }

      const perceptionsTotal = perceptions?.reduce((total, perception) => total + (netAmount * perception.rate) / 100, 0) || 0
      const internalTaxesTotal = internalTaxes?.reduce((total, tax) => total + (netAmount * tax.rate) / 100, 0) || 0

      const totalTaxes = Number(perceptionsTotal + internalTaxesTotal + mercadoPagoFee)

      
    
      // Balance de IVA
      const vatBalance =  purchaseVATValue - saleVATAmount;
      setVatBalance(vatBalance);
      
      const calculateMaxDiscount = () => {

        const IVASale = saleVATAmountValue;
        const IVAPurchase = purchaseVATValue;
        const vatBalance = IVAPurchase - IVASale;


        // Factores que afectan al cálculo
        const mpRate = useMercadoPago ? Number(mercadoPagoRate) / 100 : 0;
        
        // Tasas totales de percepciones e impuestos internos (en formato decimal)
        const perceptionsTotalRate = perceptions.reduce((total, p) => total + p.rate / 100, 0);
        const internalTaxesTotalRate = internalTaxes.reduce((total, t) => total + t.rate / 100, 0);
        
        // Total de todas las tasas variables como fracción
        const totalVariableRate = mpRate + perceptionsTotalRate + internalTaxesTotalRate;
        

        // Evitemos divisiones por cero
        const denominator = Math.max(1 - totalVariableRate, 0.0001);
        
        // Cálculo final del descuento máximo
        const maxDiscount = salePrice - ((inputCost + vatBalance) / denominator);
        
        // Asegurémonos de no tener un descuento negativo
        return Math.max(maxDiscount, 0);
      };
      
      const maxDiscountAmount = calculateMaxDiscount();
      setMaxDiscount(maxDiscountAmount)
      const maxDiscountPercentage = (maxDiscountAmount / salePrice) * 100;
      setMaxDiscountPercentage(maxDiscountPercentage)
      
      

      // Aplicar el descuento
      let discountAmount = 0;
      if (discountType === "percentage") {
        discountAmount = (salePrice * Number(discountValue)) / 100;
        setDiscount(discountAmount);
      } else {
        discountAmount = Number(discountValue);
        setDiscount(discountAmount);
      }

      // Precio después del descuento
      const salePriceDiscount = salePrice - discountAmount;
      setSalePriceDiscount(salePriceDiscount);

      // Recalcular los impuestos variables basados en el nuevo precio después del descuento
      // (Es importante hacerlo si estos impuestos se basan en el precio con descuento)
      let updatedMercadoPagoFee = 0;
      if (useMercadoPago) {
        updatedMercadoPagoFee = (salePriceDiscount * Number(mercadoPagoRate)) / 100;
      }

      // Recalcular otros impuestos si corresponde
      const updatedPerceptionsTotal = perceptions.reduce(
        (total, perception) => total + (salePriceDiscount * perception.rate) / 100, 
        0
      );
      const updatedInternalTaxesTotal = internalTaxes.reduce(
        (total, tax) => total + (salePriceDiscount * tax.rate) / 100, 
        0
      );

      const updatedTotalTaxes = updatedPerceptionsTotal + updatedInternalTaxesTotal + updatedMercadoPagoFee;

      

      // Ganancia bruta: Precio de venta con descuento menos costo de compra
      const grossProfit = salePriceDiscount - inputCost;

      // Ganancia neta: Ganancia bruta menos balance de IVA menos impuestos totales
      const netProfit = grossProfit + (vatBalance < 0 ? vatBalance : -vatBalance) - updatedTotalTaxes;


      // Porcentaje de margen bruto respecto al precio final
      const netMarginPercentage = (netProfit / salePriceDiscount) * 100;

      // Porcentaje del máximo descuento permitido que se ha aplicado
      const discountPercentage = discountAmount > 0 ? (discountAmount / maxDiscountAmount) * 100 : 0;
      

      setMaxDiscount(maxDiscountAmount);
      setMaxDiscountPercentage(maxDiscountPercentage);
      setDiscount(discountAmount);
      setDiscountPercentage(discountPercentage);

      setResults({
        netAmount: netAmount,
        grossProfit: formatCurrency(grossProfit),
        netMarginPercentage: netMarginPercentage.toFixed(1),
        salePrice: salePrice,
        salePriceDiscount: salePriceDiscount,
        purchaseVAT: formatCurrency(purchaseVATValue),
        saleVAT: saleVATAmountValue,
        vatBalance: vatBalance,
        netProfit: formatCurrency(netProfit),
        perceptionsTotal: perceptionsTotal,
        internalTaxesTotal: internalTaxesTotal,
        mercadoPagoFee: mercadoPagoFee,
        totalTaxes: totalTaxes,
        discount: formatCurrency(discountAmount),
      })

      // Prepare cost breakdown data for chart
      const costBreakdownData =
        costComponents.length > 0
          ? costComponents.map((component) => ({
              name: component.name,
              value: component.netAmount + component.vatAmount,
            }))
          : undefined

      setChartData({
        cost: Number(cost),
        salePrice: salePrice,
        salePriceDiscount: salePriceDiscount,
        netProfit: netProfit,
        perceptions: perceptionsTotal,
        taxes: internalTaxesTotal,
        discountAmount: discountAmount,
        vatBalance: vatBalance,
        costBreakdown: costBreakdownData,
        mercadoPagoFee: mercadoPagoFee,
      })
      
      setActiveStep("results")
    } else {
      setResults(null)
      setPurchaseVAT(0)
      setSaleVATAmount(0)
      setChartData(null)
    }
    
    setIsCalculating(false)
  }, 800);
}

  // Si se aplica un descuento hay que recalcular el IVA Venta
  useEffect(() => {
    let newSaleVAT = 0
    if (sellWithVAT && discount) {
      const saleVat = Number.parseFloat(saleVatPercentage) / 100
      newSaleVAT = calculateVAT(salePriceDiscount, saleVat)
      setSaleVATAmount(newSaleVAT)
      const netAmountDiscount = salePriceDiscount / (1 + saleVat) // Actualizamos Neto Gravado post descuentos
      setNetAmountDiscount(netAmountDiscount)
    }
  }, [vatPercentage, saleVatPercentage, cost, includeVAT, sellWithVAT, discount, vatBalance ])

  // Helper function to calculate VAT
  const calculateVAT = (amount: number, vatRate: number) => {
    return amount * vatRate
  }

  const getAvailableMediums = (method: string) => {
    const mediums = mercadoPagoOptions
      .filter(option => option.method === method)
      .map(option => option.medium)
      .filter((value, index, self) => self.indexOf(value) === index); // Eliminar duplicados
    return mediums;
  };

  // Obtener disponibilidades según método y medio seleccionados
  const getAvailableAvailabilities = (method: string, medium: string) => {
    const availabilities = mercadoPagoOptions
      .filter(option => option.method === method && option.medium === medium)
      .map(option => option.availability);
    return availabilities;
  };

  // Actualizar tasa según selecciones
  const updateMercadoPagoRate = () => {
    if (mercadoPagoMethod && mercadoPagoMedium && mercadoPagoAvailability) {
      const option = mercadoPagoOptions.find(
        opt => 
          opt.method === mercadoPagoMethod && 
          opt.medium === mercadoPagoMedium && 
          opt.availability === mercadoPagoAvailability
      );
      
      if (option) {
        setMercadoPagoRate(option.rate.toString());
      }
    }
  };

  // Efecto para actualizar la tasa cuando cambian las selecciones
  useEffect(() => {
    updateMercadoPagoRate();
  }, [mercadoPagoMethod, mercadoPagoMedium, mercadoPagoAvailability]);

  // Efecto para resetear selecciones cuando cambia el método
  useEffect(() => {
    setMercadoPagoMedium("");
    setMercadoPagoAvailability("");
  }, [mercadoPagoMethod]);

  // Efecto para resetear disponibilidad cuando cambia el medio
  useEffect(() => {
    setMercadoPagoAvailability("");
  }, [mercadoPagoMedium]);

  // Next step handler
  const handleNextStep = () => {
    if (activeStep === "costs") {
      if (costComponents.length === 0) {
        alert("Debe agregar al menos un componente de costo.")
        return
      }
      setActiveStep("margin")
    } else if (activeStep === "margin") {
      if (!marginValue) {
        alert("Debe ingresar un valor de margen.")
        return
      }
      setActiveStep("taxes")
    } else if (activeStep === "taxes") {
      calculateMargin()
    }
  }

  // Previous step handler
  const handlePrevStep = () => {
    if (activeStep === "margin") {
      setActiveStep("costs")
    } else if (activeStep === "taxes") {
      setActiveStep("margin")
    } else if (activeStep === "results") {
      setActiveStep("taxes")
    }
  }



  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calculadora de Margen</h1>
              <p className="text-gray-500">Optimiza tus precios y maximiza tus ganancias</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center space-x-1">
            {["costs", "margin", "taxes", "results"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`h-2.5 w-2.5 rounded-full ${activeStep === step ? 'bg-blue-600' : (["costs", "margin", "taxes", "results"].indexOf(activeStep) >= index ? 'bg-blue-400' : 'bg-gray-300')}`}
                />
                {index < 3 && (
                  <div 
                    className={`h-0.5 w-5 ${["costs", "margin", "taxes", "results"].indexOf(activeStep) > index ? 'bg-blue-400' : 'bg-gray-300'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeStep === "costs" && (
          <motion.div
            key="costs"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Estructura de Costos</h2>
                  </div>
                  <div className="text-sm text-gray-500">Paso 1 de 4</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Añade todos los componentes de costo involucrados en tu producto o servicio para obtener un cálculo preciso.
                    </p>
                  </div>
                </div>
                
                <CostBreakdownSection
                  costComponents={costComponents}
                  setCostComponents={setCostComponents}
                  vatPercentage={vatPercentage}
                  totalCost={Number(cost.replace(/[^\d.-]/g, "")) || 0}
                  formatCurrency={formatCurrency}
                  updateTotalCost={updateTotalCost}
                  onVATChange={handleVATChange}
                />
                
                <div className="flex justify-end mt-6">
                  <motion.button
                    onClick={handleNextStep}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeStep === "margin" && (
          <motion.div
            key="margin"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 rounded-full p-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Margen de Ganancia</h2>
                  </div>
                  <div className="text-sm text-gray-500">Paso 2 de 4</div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 p-4 rounded-lg mb-6">
                  <div className="flex items-start md:items-center md:space-x-3 flex-col md:flex-row">
                    <div className="bg-white p-3 rounded-lg shadow-sm mb-3 md:mb-0">
                      <div className="text-xs text-gray-500">Costo Total</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(Number(cost.replace(/[^\d.-]/g, "")) || 0)}</div>
                    </div>
                    
                    <div className="bg-blue-600 p-1 rounded-full rotate-90 md:rotate-0 mb-3 md:mb-0">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-grow bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-sm">
                        <p className="text-gray-500 font-medium">Elige cómo deseas calcular tu margen de ganancia:</p>
                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                          <li className="flex items-start space-x-1">
                            <div className="mt-0.5">•</div>
                            <div><b>Markup:</b> Porcentaje que agregas sobre el costo (ej: costo + 30%)</div>
                          </li>
                          <li className="flex items-start space-x-1">
                            <div className="mt-0.5">•</div>
                            <div><b>Margen sobre venta:</b> Porcentaje de la venta que es ganancia (debe ser menor al 100%)</div>\
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium flex items-center">
                        Método de cálculo
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 ml-1.5 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-3">
                              <p className="font-medium">Diferencia entre métodos:</p>
                              <p className="mt-1 text-sm">El markup es un porcentaje que se añade al costo de un producto, mientras que el margen sobre venta es el porcentaje de ganancia calculado sobre el precio final de venta.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="flex space-x-3">
                        <div 
                          onClick={() => setMarginMethod("markup")}
                          className={`flex-1 p-3 rounded-lg border-2 flex items-center space-x-2 cursor-pointer transition-all ${marginMethod === "markup" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${marginMethod === "markup" ? 'bg-blue-500' : 'border-2 border-gray-300'}`}>
                            {marginMethod === "markup" && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={marginMethod === "markup" ? 'font-medium text-blue-700' : 'text-gray-700'}>Markup</span>
                        </div>
                        <div 
                          onClick={() => setMarginMethod("marginOnSale")}
                          className={`flex-1 p-3 rounded-lg border-2 flex items-center space-x-2 cursor-pointer transition-all ${marginMethod === "marginOnSale" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${marginMethod === "marginOnSale" ? 'bg-blue-500' : 'border-2 border-gray-300'}`}>
                            {marginMethod === "marginOnSale" && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={marginMethod === "marginOnSale" ? 'font-medium text-blue-700' : 'text-gray-700'}>Margen sobre venta</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="marginValue" className="text-base font-medium">
                        {marginMethod === "markup" ? "Markup (%)" : "Margen sobre venta (%)"}
                      </Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <NumericFormat
                          id="marginValue"
                          value={marginValue}
                          onValueChange={(values) => setMarginValue(values.value)}
                          decimalSeparator=","
                          suffix="%"
                          className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          placeholder={`Ingrese el ${marginMethod === "markup" ? "markup" : "margen sobre venta"}`}
                        />
                      </div>
                      {marginError && (
                        <div className="mt-2 text-red-500 text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {marginError}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-full">
                      <motion.div 
                        className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 shadow-sm border border-blue-100 w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-center">
                          <div className="mb-2 font-semibold text-gray-700">
                            {marginMethod === "markup" 
                              ? "Con este markup, tu precio de venta será:" 
                              : "Con este margen, tu precio de venta será:"}
                          </div>
                          <div className="flex justify-center items-center mb-4">
                            <motion.div
                              animate={{
                                scale: [1, 1.03, 1],
                                transition: { 
                                  repeat: Number.POSITIVE_INFINITY, 
                                  repeatType: "reverse", 
                                  duration: 2 
                                }
                              }}
                            >
                              
                              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                                {cost && marginValue
                                  ? formatCurrency(
                                      marginMethod === "markup"
                                        ? Number(cost) * (1 + Number(marginValue) / 100)
                                        : Number(cost) / (1 - Number(marginValue) / 100)
                                    )
                                  : "--"}
                              </div>
                            </motion.div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {marginMethod === "markup"
                              ? "Fórmula: Precio = Costo × (1 + Markup%)"
                              : "Fórmula: Precio = Costo ÷ (1 - Margen%)"}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                    <span>Anterior</span>
                  </button>
                  
                  <motion.button
                    onClick={handleNextStep}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeStep === "taxes" && (
          <motion.div
            key="taxes"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600">
                      <Percent className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Impuestos y Descuentos</h2>
                  </div>
                  <div className="text-sm text-gray-500">Paso 3 de 4</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">¿Vendes con IVA?</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={sellWithVAT} 
                          onCheckedChange={setSellWithVAT} 
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-gray-700">{sellWithVAT ? "Sí" : "No"}</span>
                      </div>
                      
                      {sellWithVAT && (
                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">IVA en Venta</Label>
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
                          <p className="text-xs text-gray-600 mt-1">
                              Precio de venta + {saleVatPercentage}% IVA
                            </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-medium">¿Vendes con Mercado Pago?</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={useMercadoPago} 
                          onCheckedChange={setUseMercadoPago} 
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-gray-700">{useMercadoPago ? "Sí" : "No"}</span>
                      </div>
                      
                      {useMercadoPago && (
                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Método de pago</Label>
                              <Select value={mercadoPagoMethod} onValueChange={setMercadoPagoMethod}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccione el método de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Point">Point</SelectItem>
                                  <SelectItem value="QR">QR</SelectItem>
                                  <SelectItem value="Link de pago">Link de pago</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {mercadoPagoMethod && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Medio de pago</Label>
                                <Select 
                                  value={mercadoPagoMedium} 
                                  onValueChange={setMercadoPagoMedium}
                                  disabled={!mercadoPagoMethod}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el medio de pago" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableMediums(mercadoPagoMethod).map((medium) => (
                                      <SelectItem key={medium} value={medium}>
                                        {medium}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {mercadoPagoMethod && mercadoPagoMedium && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Disponibilidad del dinero</Label>
                                <Select 
                                  value={mercadoPagoAvailability} 
                                  onValueChange={setMercadoPagoAvailability}
                                  disabled={!mercadoPagoMedium}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione la disponibilidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableAvailabilities(mercadoPagoMethod, mercadoPagoMedium).map((availability) => (
                                      <SelectItem key={availability} value={availability}>
                                        {availability}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {mercadoPagoMethod && mercadoPagoMedium && mercadoPagoAvailability && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Comisión aplicada:</span>
                                  <span className="text-sm font-bold">
                                    {mercadoPagoRate === "0" ? "Gratis" : `${mercadoPagoRate}%`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
</div>
                    
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-medium flex items-center">
                        Descuento
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 ml-1.5 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Puedes aplicar un descuento porcentual o un monto fijo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Tipo de descuento:</span>
                            <div className="flex items-center space-x-1 bg-white rounded-full p-1 border border-gray-200">
                              <button
                                onClick={() => setDiscountType("percentage")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  discountType === "percentage" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                Porcentaje
                              </button>
                              <button
                                onClick={() => setDiscountType("fixed")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  discountType === "fixed" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                Monto fijo
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center relative w-full">
                          {discountType === "percentage" ? (
                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          ) : (
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          )}
                          <NumericFormat
                            value={discountValue}
                            onValueChange={(values) => setDiscountValue(values.value)}
                            decimalSeparator=","
                            suffix={discountType === "percentage" ? "%" : ""}
                            prefix={discountType === "fixed" ? "$" : ""}
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            placeholder={`Ingrese el descuento ${discountType === "percentage" ? "porcentual" : "fijo"}`}
                          />
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-2">
                          El descuento se aplicará sobre el precio final de venta.
                        </p>
                      </div>
</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-100">
                      <h3 className="font-semibold text-gray-800 mb-3">Percepciones e Impuestos</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Añade percepciones o impuestos adicionales que deban aplicarse a la venta
                      </p>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const newPerception = { name: "IIBB", rate: 0 };
                            setPerceptions([...perceptions, newPerception]);
                          }}
                          className="w-full bg-white border border-purple-200 hover:border-purple-300 text-purple-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Añadir Percepción IIBB</span>
                        </button>
                        
                        <button
                          onClick={() => setInternalTaxes([...internalTaxes, { name: "", rate: 0 }])}
                          className="w-full bg-white border border-blue-200 hover:border-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Añadir Tasa Interna</span>
                        </button>
                      </div>
                      
                      {(perceptions.length > 0 || internalTaxes.length > 0) && (
  <div className="mt-4 space-y-3">
    {perceptions.map((perception, index) => (
      <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-purple-100">
        <div className="flex-shrink-0 text-xs font-bold text-purple-700 w-16 flex items-center justify-center">
          IIBB
        </div>

        <Select 
          value={perception.name === "IIBB" ? perception.name + " - " + (perception.rate > 0 ? perception.rate.toString() : "0") : perception.name} 
          onValueChange={(value) => {
            const updatedPerceptions = [...perceptions];
            const selectedProvince = value.replace("IIBB - ", "");
            const provinceData = iibbRates.find(p => p.province === selectedProvince);
            
            if (provinceData) {
              updatedPerceptions[index] = {
                name: "IIBB - " + provinceData.province,
                rate: provinceData.rate
              };
            } else {
              updatedPerceptions[index] = {
                name: value,
                rate: perception.rate
              };
            }
            
            setPerceptions(updatedPerceptions);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Seleccione provincia" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="default" disabled>Seleccione provincia</SelectItem>
            {iibbRates.map((province) => (
              <SelectItem key={province.province} value={`IIBB - ${province.province}`}>
                {province.province} ({province.rate}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mostrar el valor calculado inmediatamente después de la selección */}
        {results && perception.rate > 0 && (
          <span className="text-xs font-medium">
            {formatCurrency(results.netAmount * (perception.rate / 100))}
            
          </span>
        )}

        <button
          onClick={() => {
            setPerceptions(perceptions.filter((_, i) => i !== index));
          }}
          className="h-6 w-6 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}

                        {internalTaxes.map((tax, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-blue-100">
                            <Select 
                              value={tax.name || "default"} 
                              onValueChange={(value) => {
                                const updatedTaxes = [...internalTaxes]
                                updatedTaxes[index].name = value
                                setInternalTaxes(updatedTaxes)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default" disabled>Seleccione tasa</SelectItem>
                                <SelectItem value="TASAS MUNICIPALES">TASAS MUNICIPALES</SelectItem>
                                <SelectItem value="TASAS PROVINCIALES">TASAS PROVINCIALES</SelectItem>
                                <SelectItem value="TASAS AL COMBUSTIBLE">TASAS AL COMBUSTIBLE</SelectItem>
                              </SelectContent>
                            </Select>

                            <NumericFormat
                              value={tax.rate}
                              onValueChange={(values) => {
                                const updatedTaxes = [...internalTaxes]
                                updatedTaxes[index].rate = Number(values.value)
                                setInternalTaxes(updatedTaxes)
                              }}
                              suffix="%"
                              decimalSeparator=","
                              className="h-8 w-20 rounded-md border border-input text-xs"
                            />
                            
                            <span className="text-xs font-medium">
                              {formatCurrency((Number(cost) / (1 + Number(vatPercentage) / 100)) * (tax.rate / 100))}
                            </span>

                            <button
                              onClick={() => {
                                setInternalTaxes(internalTaxes.filter((_, i) => i !== index))
                              }}
                              className="h-6 w-6 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                                        </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                    <span>Anterior</span>
                  </button>
                  
                  <motion.button
                    onClick={handleNextStep}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md"
                  >
                    <span>{isCalculating ? "Calculando..." : "Calcular Margen"}</span>
                    {isCalculating ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Calculator className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeStep === "results" && results && (
          <motion.div
            key="results"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Results Summary Card */}
            <Card className="border border-gray-200 shadow-lg overflow-hidden bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <motion.div 
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-green-100 p-3 rounded-full"
                  >
                    <Check className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Resultados del cálculo</h2>
                    <p className="text-green-600 font-medium">¡Cálculo de margen completado con éxito!</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Costo Total</div>
                      <div className="bg-blue-50 p-1.5 rounded">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold">{formatCurrency(Number(cost))}</div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                      {costComponents.length} componentes de costo
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Precio de Venta</div>
                      <div className="bg-green-50 p-1.5 rounded">
                        <DollarSign className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold">{formatCurrency(results.salePriceDiscount)}</div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                    {sellWithVAT 
                    ? `IVA: ${formatCurrency(saleVATAmount)}` 
                    : "Sin IVA"
                  }

                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Ganancia Neta</div>
                      <div className="bg-purple-50 p-1.5 rounded">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-green-600">{results.netProfit}</div>
                    <div className="mt-1 text-xs flex items-center">
                      <span className="text-gray-500 mr-1">Margen:</span>
                      <span className="text-green-600 font-medium">{results.netMarginPercentage}%</span>
                    </div>
                  </motion.div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800 mb-2">
                        <span className="font-medium">Resumen:</span> Compras el producto por {formatCurrency(Number(cost))} y lo vendes por {formatCurrency(results.salePrice)}.
                      </p>
                      
                      <p className="text-gray-800">
                        Tu ganancia después de impuestos es de <span className="font-semibold text-green-600">{results.netProfit}</span>, 
                        que representa el <span className="font-semibold text-green-600">{results.netMarginPercentage}%</span> del precio de venta.
                      </p>
                      
                      {sellWithVAT && (
                        <p className="mt-2 text-gray-800">
                          Recuerda que del IVA que cobras en la venta ({formatCurrency(saleVATAmount)}, al {saleVatPercentage}%), 
                          debes { results.vatBalance < 0 ? "pagar" : "recibir"}{" "}
                          <span className={results.vatBalance < 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                            {formatCurrency(results.vatBalance)}
                          </span>{" "}
                          {results.vatBalance < 0 ? "al" : "del"} gobierno.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed Results Tabs */}
            <Tabs defaultValue="breakdown" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="breakdown" className="flex items-center gap-1.5">
                  <PieChart className="h-4 w-4" />
                  <span>Desglose Visual</span>
                </TabsTrigger>
                <TabsTrigger value="taxes" className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4" />
                  <span>Impuestos y VAT</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4" />
                  <span>Datos Detallados</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="breakdown">
                {chartData && (
                  <PriceBreakdownChart
                    cost={chartData.cost}
                    costVAT={purchaseVAT}
                    sellingPrice={results.salePrice}
                    sellingPriceDiscount={chartData.salePriceDiscount}
                    sellingPriceVAT={saleVATAmount || 0}
                    profit={chartData.netProfit}
                    discount={chartData.discountAmount}
                    vatBalance={Math.abs(chartData.vatBalance)}
                    taxes = {chartData.taxes || 0}
                    perceptions = {chartData.perceptions || 0}
                    costBreakdown={chartData.costBreakdown}
                    mercadoPagoFee={chartData.mercadoPagoFee}
                    mercadoPagoRate={chartData.mercadoPagoRate}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="taxes">
                {sellWithVAT && (
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4">Desglose de IVA</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">IVA en la compra:</span>
                              <span>{formatCurrency(purchaseVAT)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">IVA en la venta:</span>
                              <span>{formatCurrency(saleVATAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                              <span className="font-semibold">Balanza de IVA:</span>
                              <span
                                className={
                                  results.vatBalance < 0
                                    ? "text-red-500 font-semibold" 
                                    : "text-green-600 font-semibold"
                                }
                              >
                                {formatCurrency(results.vatBalance)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Explicación:</h4>
                            <p className="text-sm text-gray-700">
                              {results.vatBalance < 0
                                ? "Deberás pagar este monto al fisco en concepto de IVA. Esto ocurre cuando el IVA que cobras es mayor al IVA que pagas en tus compras."
                                : "Recibirás este monto del fisco en concepto de IVA. Esto ocurre cuando el IVA que pagas en tus compras es mayor al IVA que cobras."}
                            </p>
                          </div>
                        </div>
                        
                        {(perceptions.length > 0 || internalTaxes.length > 0) && (
                          <div className="space-y-4">
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Percepciones e Impuestos:</h4>
                              
                              {perceptions.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-purple-800 mb-1">Percepciones</div>
                                  {perceptions.map((perception, index) => (
                                    <div key={index} className="flex justify-between items-center mb-1 text-sm">
                                      <span>{perception.name} ({perception.rate}%)</span>
                                      <span>{formatCurrency( results.netAmount * (perception.rate / 100) )}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {internalTaxes.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-blue-800 mb-1">Tasas Internas</div>
                                  {internalTaxes.map((tax, index) => (
                                    <div key={index} className="flex justify-between items-center mb-1 text-sm">
                                      <span>{tax.name} ({tax.rate}%)</span>
                                      <span>{formatCurrency( (results.netAmount) * (tax.rate / 100)) }</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {results.mercadoPagoFee > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-[#00aff0] mb-1">Mercado Pago</div>
                                  <div className="flex justify-between items-center mb-1 text-sm">
                                      <span>Comisión del {mercadoPagoRate}%</span>
                                      <span>{formatCurrency( results.mercadoPagoFee) }</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 pt-2 border-t border-purple-200 flex justify-between items-center">
                                <span className="font-medium">Total Impuestos:</span>
                                <span className="font-semibold">{formatCurrency(results.totalTaxes)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {!sellWithVAT && (
                  <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <AlertDescription>
                      No has seleccionado la opción de vender con IVA, por lo que no hay información de IVA para mostrar.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="details">
                {chartData && (
                  <ResultState
                    cost={chartData.cost}
                    costVAT={purchaseVAT}
                    sellingPrice={chartData.salePrice}
                    sellingPriceDiscount={chartData.salePriceDiscount}
                    sellingPriceVAT={saleVATAmount || 0}
                    profit={chartData.netProfit}
                    discount={chartData.discountAmount}
                    vatBalance={chartData.vatBalance}
                    taxes = {chartData.taxes || 0}
                    perceptions = {chartData.perceptions || 0}
                    costBreakdown={chartData.costBreakdown}
                    mercadoPagoFee={chartData.mercadoPagoFee}
                    mercadoPagoRate={chartData.mercadoPagoRate}
                  />
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                <span>Volver</span>
              </button>
              
              <motion.button
                onClick={() => {
                  // Reset to start new calculation
                  setActiveStep("costs")
                }}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md"
              >
                <span>Nuevo Cálculo</span>
                <Calculator className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MarginCalculator

