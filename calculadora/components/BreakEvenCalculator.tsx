"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NumericFormat } from "react-number-format"
import { Trash2 } from "lucide-react"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
}

interface FixedCost {
  id: number
  description: string
  amount: string
}

interface Product {
  id: number
  name: string
  variableCost: string
  sellingPrice: string
  grossMargin: string
}

const BreakEvenCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([{ id: 1, description: "", amount: "" }])
  const [hasAddedFixedCost, setHasAddedFixedCost] = useState(false);
  const [hasAddedProduct, setHasAddedProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    { id:1 , name: "", variableCost: "", sellingPrice: "", grossMargin: "0%" },
  ])
  const [results, setResults] = useState<{
    breakEvenPoint: number
    breakEvenRevenue: string
    totalProfit: string
    totalContributionMargin: string
    averageContributionMarginRatio: number
  } | null>(null)

  const [costResults, setCostResults] =useState<{
    costResults: string} | null>(null)

    const addFixedCost = () => {
      setFixedCosts(prevCosts => {
        // Generar el id dinámicamente según el último elemento
        const newId = prevCosts.length > 0 ? prevCosts[prevCosts.length - 1].id + 1 : 1;
    
        // Agregar el nuevo gasto con id único
        const newCosts = [...prevCosts, { id: newId, description: "", amount: "" }];
    
        // Calcular el total de los costos fijos
        const totalCost = newCosts.reduce(
          (sum, cost) => sum + (parseFloat(cost.amount.replace(/[^\d.-]/g, "")) || 0),
          0
        );
    
        // Actualizar el estado con los costos fijos y el total
        setCostResults({
          costResults: formatCurrency(totalCost),  // Formatear el total de costos fijos
        });
    
        return newCosts;
      });
    
      setHasAddedFixedCost(true);
    };
    
    const updateFixedCost = (id: number | null, field: "description" | "amount", value: string) => {
      setFixedCosts(fixedCosts.map(cost => 
        cost.id === id && id !== null ? { ...cost, [field]: value } : cost
      ));
    };

    

    const removeFixedCost = (id: number) => {
      const updatedFixedCosts = fixedCosts
        .filter(cost => cost.id !== id) // Filtrar el costo eliminado
        .map((cost, index) => ({ ...cost, id: index + 1 })); // Reasignar los ID
    
      setFixedCosts(updatedFixedCosts);
    
      // Recalcular el total después de eliminar el gasto
      const costResults = updatedFixedCosts.reduce(
        (sum, cost) => sum + (parseFloat(cost.amount.replace(/[^\d,-]/g, "").replace(",", ".")) || 0),
        0
      );
    
      setCostResults({
        costResults: formatCurrency(costResults),
      });
    };
    
  
  
  const addProduct = () => {
    setProducts([
      ...products,
      { id: products.length + 1, name: "", variableCost: "", sellingPrice: "", grossMargin: "0%" },
    ])


  }

  const updateProduct = (id: number, field: "name" | "variableCost" | "sellingPrice", value: string) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value }
          const variableCost = Number(updatedProduct.variableCost.replace(/[^\d.-]/g, ""))
          const sellingPrice = Number(updatedProduct.sellingPrice.replace(/[^\d.-]/g, ""))
          if (sellingPrice > 0) {
            updatedProduct.grossMargin = (((sellingPrice - variableCost) / sellingPrice) * 100).toFixed(2) + "%"
          } else {
            updatedProduct.grossMargin = "0%"
          }
          return updatedProduct
        }
        return product
      }),
    )
    setHasAddedProduct(true)
  }

  const removeProduct = (id: number) => {
    // Filtrar el producto a eliminar
    const updatedProducts = products.filter(product => product.id !== id);
  
    // Reasignar IDs para evitar duplicados
    const reorderedProducts = updatedProducts.map((product, index) => ({
      ...product,
      id: index + 1, // Se reasignan los IDs en orden
    }));
  
    setProducts(reorderedProducts);
  };
  
  

  const calculateBreakEven = () => {
    const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + Number(cost.amount.replace(/[^\d.-]/g, "")), 0)
    setCostResults({ costResults: formatCurrency(totalFixedCosts) });
    const productDetails = products.map((product) => ({
      variableCost: Number(product.variableCost.replace(/[^\d.-]/g, "")),
      sellingPrice: Number(product.sellingPrice.replace(/[^\d.-]/g, "")),
      contributionMargin:
        Number(product.sellingPrice.replace(/[^\d.-]/g, "")) - Number(product.variableCost.replace(/[^\d.-]/g, "")),
      contributionMarginRatio:
        (Number(product.sellingPrice.replace(/[^\d.-]/g, "")) - Number(product.variableCost.replace(/[^\d.-]/g, ""))) /
        Number(product.sellingPrice.replace(/[^\d.-]/g, "")),
    }))

    const totalContributionMargin = productDetails.reduce((sum, product) => sum + product.contributionMargin, 0)
    const averageContributionMarginRatio =
      productDetails.reduce((sum, product) => sum + product.contributionMarginRatio, 0) / productDetails.length

    const breakEvenRevenue = Math.ceil(totalFixedCosts / averageContributionMarginRatio )
    const breakEvenPoint =
    breakEvenRevenue / (productDetails.reduce((sum, product) => sum + product.sellingPrice, 0) / products.length)
    
    const totalProfit = breakEvenRevenue * averageContributionMarginRatio

    setResults({
      breakEvenPoint: Math.ceil(breakEvenPoint),
      breakEvenRevenue: formatCurrency(breakEvenRevenue),
      totalContributionMargin: formatCurrency(totalContributionMargin),
      averageContributionMarginRatio: averageContributionMarginRatio * 100,
      totalProfit: formatCurrency(totalProfit),
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Calculadora de Punto de Equilibrio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gastos Fijos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Input
                        value={cost.description}
                        onChange={(e) => updateFixedCost(cost.id, "description", e.target.value)}
                        placeholder="Descripción del gasto"
                      />
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={cost.amount}
                        onValueChange={(values) => updateFixedCost(cost.id, "amount", values.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Monto"
                      />
                    </TableCell>
                    <TableCell>
                    {hasAddedFixedCost && (
                    <Button variant="ghost" size="icon" onClick={() => removeFixedCost(cost.id)}>
                      <Trash2 className="h-12 w-12" />
                    </Button>
                            )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex items-center justify-between mt-2">
              <Button
                onClick={addFixedCost}
                className="h-10 text-m font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-[#E24D28] hover:bg-[#A23216] text-white shadow-lg"
                type="button"
              >
                Agregar Gasto Fijo
              </Button>
              <span className="text-m font-semibold">Gastos Fijos Totales: {costResults?.costResults}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Productos/Servicios</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Nombre</TableHead>
                  <TableHead className="text-center">Costo Variable</TableHead>
                  <TableHead className="text-center">Precio de Venta</TableHead>
                  <TableHead className="text-center">Margen de Contribución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Input
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                        placeholder="Producto/servicio"
                      />
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={product.variableCost}
                        onValueChange={(values) => updateProduct(product.id, "variableCost", values.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Costo variable"
                      />
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={product.sellingPrice}
                        onValueChange={(values) => updateProduct(product.id, "sellingPrice", values.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Precio de venta"
                      />
                    </TableCell>
                    <TableCell className="text-center">{product.grossMargin}</TableCell>
                    <TableCell>
                      {hasAddedProduct && (
                      <Button variant="ghost" size="icon" onClick={() => removeProduct(product.id)}>
                        <Trash2 className="h-12 w-12" />
                      </Button>
                              )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
            onClick={addProduct}
            className="mt-2 h-10 text-m font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-[#228176] hover:bg-[#1A6158] text-white shadow-lg"
            type="button"
          >
              Agregar Producto/Servicio
            </Button>
          </div>

          <Button
            onClick={calculateBreakEven}
            className="w-full h-10 text-m font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
            type="button"
          >
            Calcular Punto de Equilibrio
          </Button>
        </div>

        {results && (
          <div className="mt-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Resumen del Punto de Equilibrio</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Punto de Equilibrio (unidades):</span>
                <span>{results.breakEvenPoint.toLocaleString()}</span>

                <span className="font-medium">Ingresos en Punto de Equilibrio:</span>
                <span>{results.breakEvenRevenue}</span>

                <span className="font-medium">Margen de Contribución Total:</span>
                <span>{results.totalContributionMargin}</span>

                <span className="font-medium">Ratio de Margen de Contribución Promedio:</span>
                <span>{results.averageContributionMarginRatio.toFixed(2)}%</span>
              </div>
            </div>

            <Alert variant="default">
              <AlertDescription>
                <p className="mb-2">
                  <strong>Explicación simple:</strong>
                </p>
                <p>
                  Necesitas vender un total de <strong>{results.breakEvenPoint.toLocaleString()} unidades</strong>{" "}
                  (combinando todos tus productos/servicios) para alcanzar el punto de equilibrio.
                </p>
                <p className="mt-2">
                  En este punto, tus ingresos totales serán de <strong>{results.breakEvenRevenue}</strong>,y tu ganancia de <strong>{results.totalProfit}</strong>, lo que
                  cubrirá todos tus costos fijos que son de <strong>{costResults?.costResults}</strong>.
                </p>
                <p className="mt-2">
                  Y a partir de este punto de facturación, obtendras ganancias.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BreakEvenCalculator
