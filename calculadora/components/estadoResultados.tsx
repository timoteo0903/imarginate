import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, ResponsiveContainer, Treemap, Rectangle, PieChart, Pie, Cell, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "./MarginCalculator"

interface ResultStateProps {
  cost: number
  costVAT: number
  sellingPrice?: number
  sellingPriceDiscount?: number
  sellingPriceVAT: number
  vatBalance: number
  taxes: number
  perceptions: number
  profit: number
  discount: number
  mercadoPagoFee?: number
  mercadoPagoRate?: string
  costBreakdown?: { name: string; value: number }[]
}


// Modificar la función principal del componente para incluir Mercado Pago y corregir el gráfico circular
const ResultState: React.FC<ResultStateProps> = ({
  cost,
  sellingPrice = 0,
  sellingPriceDiscount = 0,
  vatBalance,
  profit,
  discount,
  mercadoPagoFee = 0,
  taxes = 0 , 
  perceptions = 0,
}) => {
  // Main price breakdown data - Corregir para mostrar correctamente el IVA
  const data = [
    { name: "Costo", value: cost, color: "#FF3D3D"  },
    { name: "Ganancia", value: profit, color: "#00c49f"},
    { name: "Balanza IVA", value: vatBalance, color: "#f17345"},
    { name: "Descuento", value: discount , color: "#c628ff"},
    ...(mercadoPagoFee > 0 ? [{ name: "Comisión Mercado Pago", value: mercadoPagoFee , color: "#00aff0"}] : []),
  ].filter((item) => item.value > 0)

  // Añadir la presentación de datos detallados como estado de resultados
  const renderDetailedIncomeStatement = () => {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Estado de Resultados</h4>
  
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Concepto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Monto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {discount > 0 && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-700">Precio de Venta Inicial</td>
                    <td className="text-right py-3 px-4 text-gray-700">{formatCurrency(sellingPrice)}</td>
                    <td className="text-right py-3 px-4 text-gray-500">-</td>
                  </tr>
                )}
  
                {discount > 0 && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-red-600 flex items-center">
                      <span className="inline-block w-5 text-center mr-2">-</span>
                      <span>Descuento</span>
                    </td>
                    <td className="text-right py-3 px-4 text-red-600 font-medium">{formatCurrency(discount)}</td>
                    <td className="text-right py-3 px-4 text-red-500">-</td>
                  </tr>
                )}
  
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">Precio de Venta</td>
                  <td className="text-right py-3 px-4 font-medium text-gray-800">
                    {formatCurrency(sellingPriceDiscount)}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-gray-600">100%</td>
                </tr>
  
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-red-600 flex items-center">
                    <span className="inline-block w-5 text-center mr-2">-</span>
                    <span>Costo del Producto</span>
                  </td>
                  <td className="text-right py-3 px-4 text-red-600 font-medium">{formatCurrency(cost)}</td>
                  <td className="text-right py-3 px-4 text-red-500">
                    {sellingPriceDiscount > 0 ? ((cost / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
                  </td>
                </tr>
  
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-800">Ganancia Bruta</td>
                  <td
                    className={`text-right py-3 px-4 font-semibold ${cost >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(sellingPriceDiscount - cost)}
                  </td>
                  <td
                    className={`text-right py-3 px-4 font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {sellingPriceDiscount > 0 ? ((profit / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
                  </td>
                </tr>
  
                {vatBalance !== undefined && vatBalance !== null && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-700">Balanza de IVA</td>
                    <td
                      className={`text-right py-3 px-4 font-medium ${vatBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(vatBalance)}
                    </td>
                    <td className={`text-right py-3 px-4 ${vatBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {sellingPriceDiscount > 0 ? ((Math.abs(vatBalance) / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                )}
  
                {mercadoPagoFee !== 0 && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-red-600 flex items-center">
                      <span className="inline-block w-5 text-center mr-2">-</span>
                      <span>Comisión Mercado Pago</span>
                    </td>
                    <td className="text-right py-3 px-4 text-red-600 font-medium">{formatCurrency(mercadoPagoFee)}</td>
                    <td className="text-right py-3 px-4 text-red-500">
                      {((mercadoPagoFee / sellingPriceDiscount) * 100).toFixed(1)}%
                    </td>
                  </tr>
                )}
  
                {taxes !== 0 && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-red-600 flex items-center">
                      <span className="inline-block w-5 text-center mr-2">-</span>
                      <span>Tasas</span>
                    </td>
                    <td className="text-right py-3 px-4 text-red-600 font-medium">{formatCurrency(taxes)}</td>
                    <td className="text-right py-3 px-4 text-red-500">
                      {((taxes / sellingPriceDiscount) * 100).toFixed(1)}%
                    </td>
                  </tr>
                )}
  
                {perceptions !== 0 && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-red-600 flex items-center">
                      <span>Impuestos a los IIBB</span>
                    </td>
                    <td className="text-right py-3 px-4 text-red-600 font-medium">{formatCurrency(perceptions * (-1))} </td>
                    <td className="text-right py-3 px-4 text-red-500">
                      {((perceptions / sellingPriceDiscount) * 100).toFixed(1)}%
                    </td>
                  </tr>
                )}
  
                <tr className={`${profit >= 0 ? "bg-green-50" : "bg-red-50"} rounded-b-lg`}>
                  <td className={`py-4 px-4 font-bold text-lg ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                    Ganancia Neta
                  </td>
                  <td
                    className={`text-right py-4 px-4 font-bold text-lg ${profit >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(profit)}
                  </td>
                  <td className={`text-right py-4 px-4 font-bold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {((profit / sellingPriceDiscount) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Añadir esta línea antes del return final
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold"> Estado de Resultados </CardTitle>
      </CardHeader>
      <CardContent>

        {renderDetailedIncomeStatement()}
      </CardContent>
    </Card>
  )
}


export default ResultState


