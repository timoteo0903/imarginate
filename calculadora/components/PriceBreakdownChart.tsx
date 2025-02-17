import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PriceBreakdownChartProps {
  cost: number
  finalPrice: number
  totalTaxes:number
  profit: number
  discount: number
  vatBalance:number
}


const PriceBreakdownChart: React.FC<PriceBreakdownChartProps> = ({
  cost,
  finalPrice,
  profit,
  discount,
  vatBalance,
  totalTaxes,
}) => {
  // Calcular los porcentajes en función del precio de venta
  const costPercentage = (cost / finalPrice) * 100
  const profitPercentage = (profit / finalPrice) * 100
  const discountPercentage = (discount / finalPrice) * 100
  const vatBalancePercentage = (vatBalance / finalPrice) * 100
  const totalTaxesPercentage = (totalTaxes / finalPrice) * 100

  const data = [
    { name: "Costo", value: costPercentage, label: cost , color: "#1b263b"},
    { name: "Ganancia", value: profitPercentage , label: profit, color:"#16a34a"},
    { name: "Descuento", value: discountPercentage , label: discount, color: "#ae2012"},
    { name: "IVA", value: vatBalancePercentage , label: vatBalance, color: "#415a77"},
    { name: "Tasas y Percepciones", value: totalTaxesPercentage , label: totalTaxes, color: "#ff7d00"},
  ]

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Desglose de la Composición del Precio de Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
                formatter={(value, name) => {
                const item = data.find((d) => d.name === name)
                return [`$${item?.label.toFixed(1)}`]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Costo:</strong> El costo representa el <strong>{costPercentage.toFixed(1)}%</strong> del precio de venta.</p>
          <p><strong>Ganancia:</strong> La ganancia representa el <strong>{profitPercentage.toFixed(1)}%</strong> del precio de venta.</p>
          <p><strong>Descuento:</strong> El descuento aplicado representa el <strong>{discountPercentage.toFixed(1)}%</strong> del precio de venta.</p>
          <p><strong>IVA:</strong> El saldo de IVA representa el <strong>{vatBalancePercentage.toFixed(1)}%</strong> del precio de venta.</p>
          <p><strong>Tasas Y Percepciones:</strong> Las Tasas y Percepciones representan el <strong>{totalTaxesPercentage.toFixed(1)}%</strong> del precio de venta.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceBreakdownChart
