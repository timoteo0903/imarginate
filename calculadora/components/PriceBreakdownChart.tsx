import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PriceBreakdownChartProps {
  cost: number
  salePrice: number
  totalTaxes:number
  netProfit: number
  discountAmount: number
  vatBalance:number
}


const PriceBreakdownChart: React.FC<PriceBreakdownChartProps> = ({
  cost,
  salePrice,
  netProfit,
  discountAmount,
  vatBalance,
  totalTaxes,
}) => {
  // Calcular los porcentajes en función del precio de venta
  const costPercentage = (cost / salePrice) * 100
  const profitPercentage = (netProfit / salePrice) * 100
  const discountPercentage = (discountAmount / salePrice) * 100
  const vatBalancePercentage = (vatBalance / salePrice) * 100
  const totalTaxesPercentage = (totalTaxes / salePrice) * 100
  
  const data = [
    { name: "Costo", value: costPercentage, label: cost , color: "#1b263b", prefix: "El"},
    { name: "Ganancia", value: profitPercentage , label: netProfit, color:"#16a34a", prefix: "La"},
    { name: "Descuento", value: discountPercentage , label: discountAmount, color: "#ae2012", prefix:"El"},
    { name: "IVA", value: vatBalancePercentage , label: vatBalance, color: "#415a77", prefix: "El"},
    { name: "Tasas y Percepciones", value: totalTaxesPercentage , label: totalTaxes, color: "#ff7d00", prefix: "Las"},
  ]

  const dataFiltered = data.filter((item) => item.value > 0)

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
              data={dataFiltered}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name} ${(value).toFixed(1)}%`}
            >
              {dataFiltered.map((entry, index) => (
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
          {dataFiltered.map((item) => (
            <p key={item.name}>
              <strong style={{ color: item.color }}>{item.name}: </strong >{item.prefix} {item.name} <strong style={{ color: item.color }}> (${item.label.toFixed(1).replace(".",",")})</strong> representa el <strong style={{ color: item.color }}>{item.value.toFixed(1)}%</strong> del precio de venta.
            </p>
            ))}
        </div>  
      </CardContent>
    </Card>
  )
}

export default PriceBreakdownChart
