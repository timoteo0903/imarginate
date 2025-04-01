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
      <div className="mt-6">
        <h4 className="text-md font-medium mb-4">Estado de Resultados</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border border-gray-200">Concepto</th>
              <th className="text-right p-2 border border-gray-200">Monto</th>
              <th className="text-right p-2 border border-gray-200">%</th>
            </tr>
          </thead>
          <tbody>
          {discount > 0 && (
            <tr>
              <td className="p-2 border border-gray-200 font-medium">Precio de Venta Inicial</td>
              <td className="text-right p-2 border border-gray-200">{formatCurrency(sellingPrice)}</td>
              <td className="text-right p-2 border border-gray-200">-</td>
            </tr>
           )}

            {discount > 0 && (
              <tr className="bg-red-50 text-red-700">
                <td className="p-2 border border-gray-200">(-) Descuento</td>
                <td className="text-right p-2 border border-gray-200">{formatCurrency(discount)}</td>
                <td className="text-right p-2 border border-gray-200">-</td>
              </tr>
            )}

            <tr>
              <td className="p-2 border border-gray-200 font-medium">Precio de Venta</td>
              <td className="text-right p-2 border border-gray-200">{formatCurrency(sellingPriceDiscount)}</td>
              <td className="text-right p-2 border border-gray-200">100%</td>
            </tr>

            <tr className="bg-red-50 text-red-700">
              <td className="p-2 border border-gray-200">(-) Costo del Producto</td>
              <td className="text-right p-2 border border-gray-200">{formatCurrency(cost)}</td>
              <td className="text-right p-2 border border-gray-200">
                {sellingPriceDiscount > 0 ? ((cost / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
              </td>
            </tr>

            <tr className="bg-gray-50 text-black-700 font-bold ">
              <td className="p-2 border border-gray-200">Ganancia Bruta</td>
              <td className="text-right p-2 border border-gray-200">{formatCurrency(sellingPriceDiscount - cost)}</td>
              <td className="text-right p-2 border border-gray-200">
                {sellingPriceDiscount > 0 ? (((sellingPriceDiscount - cost) / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
              </td>
            </tr>

            {vatBalance !== undefined && vatBalance !== null && (
              <tr className={`font-medium ${vatBalance < 0 ? "text-red-500" : "text-green-600"}`}>
                <td className="p-2 border border-gray-200">Balanza de IVA</td>
                <td className="text-right p-2 border border-gray-200">{formatCurrency(vatBalance)}</td>
                <td className="text-right p-2 border border-gray-200">
                  {sellingPriceDiscount > 0 ? ((Math.abs(vatBalance) / sellingPriceDiscount) * 100).toFixed(1) : "0"}%
                </td>
              </tr>
            )}

            {mercadoPagoFee != 0 && (
              <tr className="bg-red-50 text-red-700">
                <td className="p-2 border border-gray-200">(-) Comisión Mercado Pago</td>
                <td className="text-right p-2 border border-gray-200">{formatCurrency(mercadoPagoFee)}</td>
                <td className="text-right p-2 border border-gray-200">
                  {((mercadoPagoFee / sellingPriceDiscount) * 100).toFixed(1)}%
                </td>
              </tr>
            )}

            {taxes != 0 && (
              <tr className="bg-red-50 text-red-700">
                <td className="p-2 border border-gray-200">(-) Tasas</td>
                <td className="text-right p-2 border border-gray-200">{formatCurrency(taxes)}</td>
                <td className="text-right p-2 border border-gray-200">
                  {((taxes / sellingPriceDiscount) * 100).toFixed(1)}%
                </td>
              </tr>
            )}

            {perceptions != 0 && (
              <tr className="bg-red-50 text-red-700">
                <td className="p-2 border border-gray-200">(-) Impuestos a los IIBB</td>
                <td className="text-right p-2 border border-gray-200">{formatCurrency(perceptions)}</td>
                <td className="text-right p-2 border border-gray-200">
                  {((perceptions / sellingPriceDiscount) * 100).toFixed(1)}%
                </td>
              </tr>
            )}

            <tr className="bg-green-50 font-bold">
              <td className="bg-green-50 p-2 text-green-700 font-medium font-bold-text">Ganancia Neta</td> 
              <td className="text-right p-2 border border-gray-200 text-green-700 font-medium font-bold-text">{formatCurrency(profit)}</td>
              <td className="text-right p-2 border border-gray-200 text-green-700 font-medium font-bold-text">
                {((profit / sellingPriceDiscount) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>

          </table>
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


