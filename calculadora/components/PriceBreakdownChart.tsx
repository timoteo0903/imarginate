import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, ResponsiveContainer, Treemap, Rectangle, PieChart, Pie, Cell, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "./MarginCalculator"

interface PriceBreakdownChartProps {
  cost: number
  vatBalance: number
  profit: number
  discount: number
  costBreakdown?: { name: string; value: number }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6666"]
const COST_BREAKDOWN_COLORS = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#DD4477", "#66AA00"]

const PriceBreakdownChart: React.FC<PriceBreakdownChartProps> = ({
  cost,
  profit,
  vatBalance,
  discount,
  costBreakdown,
}) => {
  // Main price breakdown data
  const data = [
    { name: "Costo", value: cost },
    { name: "Ganancia", value: profit },
    { name: "Balanza IVA", value: vatBalance },
    { name: "Descuento", value: discount },
  ].filter((item) => item.value > 0)

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);


  // Format cost breakdown data for treemap
  const formatCostBreakdownData = (data: { name: string; value: number }[]) => {
    return [
      {
        name: "Componentes de Costo",
        children: data.map((item, index) => ({
          name: item.name,
          size: item.value,
          color: COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length],
        })),
      },
    ]
  }

  // Format data for pie chart
  const formatPieChartData = (data: { name: string; value: number }[]) => {
    return data.filter((item) => item.value > 0)
  }

  // Custom renderer for pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Desglose del Precio de Venta</CardTitle>
      </CardHeader>
      <CardContent>
        {costBreakdown && costBreakdown.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-medium mb-4">Desglose de Componentes de Costo</h4>
            <div className="overflow-x-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Componente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">% del Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costBreakdown.map((entry, index) => {
                    const totalValue = costBreakdown.reduce((sum, item) => sum + item.value, 0)
                    const percentage = totalValue > 0 ? (entry.value / totalValue) * 100 : 0

                    return (
                      <TableRow key={`row-${index}`}>
                        <TableCell className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length] }}
                          />
                          {entry.name}
                        </TableCell>
                        <TableCell className="text-right">${entry.value.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={formatCostBreakdownData(costBreakdown)}
                dataKey="size"  
                aspectRatio={4 / 3}
                // stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent />}
              >
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}

        <h4 className="text-md font-medium mb-4">Desglose General del Precio</h4>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={formatPieChartData(data)}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomizedLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(value), name]}
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Custom content component for Treemap
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, size, color } = props

  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color || "#8884d8",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 13,
            fontWeight: "bold",
            fill: "#fff",
            pointerEvents: "none",
          }}
        >
          {name}
        </text>
      ) : null}
      {width > 100 && height > 50 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 12,
            fill: "#fff",
            pointerEvents: "none",
          }}
        >
          ${size?.toFixed(2)}
        </text>
      ) : null}
    </g>
  )
}

export default PriceBreakdownChart

