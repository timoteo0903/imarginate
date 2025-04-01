import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, ResponsiveContainer, Treemap, Rectangle, PieChart, Pie, Cell, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PriceBreakdownChartProps {
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6666"]
const COST_BREAKDOWN_COLORS = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#DD4477", "#66AA00"]

// Modificar la función principal del componente para incluir Mercado Pago y corregir el gráfico circular
const PriceBreakdownChart: React.FC<PriceBreakdownChartProps> = ({
  cost,
  sellingPrice = 0,
  sellingPriceDiscount = 0,
  vatBalance,
  profit,
  discount,
  mercadoPagoFee = 0,
  costBreakdown,
}) => {
  const totalPrice = sellingPriceDiscount > 0 ? sellingPriceDiscount : sellingPrice;

  const data = [
    { name: "Costo", value: cost, color: "#FF3D3D" },
    { name: "Ganancia", value: profit, color: "#00c49f" },
    { name: "Balanza IVA", value: vatBalance, color: "#f17345" },
    { name: "Descuento", value: discount, color: "#c628ff" },
    ...(mercadoPagoFee > 0 ? [{ name: "Comisión Mercado Pago", value: mercadoPagoFee, color: "#00aff0" }] : []),
  ].filter((item) => item.value > 0);
  
  // Función para ordenar y calcular porcentajes
  const sortedData = (data: { name: string; value: number; color?: string }[]) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    return [...data]
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
        // Si no se requiere cambiar el color original, se puede comentar la siguiente línea.
        color: COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length],
      }));
  };
  
  // Función para formatear los datos para el Treemap
  const formatCostBreakdownData = (data: { name: string; value: number }[]) => {
    const sorted = sortedData(data);
    return [
      {
        name: "Componentes de Costo",
        children: sorted.map(item => ({
          name: item.name,
          size: item.value,
          color: item.color,
          percentage: item.percentage,
        })),
      },
    ];
  };
  
  // En el componente, usamos 'sortedData' para la tabla
  const sortedCostBreakdown = sortedData(costBreakdown ?? []);
  
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Desglose de Componentes de Costo</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCostBreakdown && sortedCostBreakdown.length > 0 && (
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
                {sortedCostBreakdown.map((entry, index) => (
                  <TableRow key={`row-${index}`}>
                    <TableCell className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length] }}
                      />
                      {entry.name}
                    </TableCell>
                    <TableCell className="text-right">${entry.value.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{entry.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={formatCostBreakdownData(costBreakdown ?? [])}
                dataKey="size"
                aspectRatio={4 / 3}
                fill="#8884d8"
                content={<CustomizedContent />}
              >
                <Tooltip
                  formatter={(value, name) => [`$${value}`, name]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mejorar la visualización del treemap
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size, color } = props

    // Calcular el tamaño ideal de la fuente basado en el espacio disponible
    const calculateFontSize = () => {
      // Base el tamaño en el ancho y alto disponible
      const baseOnWidth = name ? width / (name.length * 0.6) : width / 3;
      const baseOnHeight = height / 3; // Reservamos aproximadamente 1/3 del alto para el texto
      
      // Tomar el valor más pequeño para asegurarnos que el texto cabe
      let fontSize = Math.min(baseOnWidth, baseOnHeight);
      
      // Limitar el tamaño máximo y mínimo
      fontSize = Math.min(fontSize, 16); // No más grande que 16px
      fontSize = Math.max(fontSize, 8); // No más pequeño que 8px
      
      return fontSize;
    };

    // Calcular el tamaño de la fuente para el valor (normalmente un poco más pequeño que el nombre)
    const calculateValueFontSize = (nameFontSize: number) => {
      return Math.max(nameFontSize * 0.85, 7); // 85% del tamaño del nombre, pero no menor a 7px
    };

    // Determinar si hay suficiente espacio para mostrar el texto
    const nameFontSize = calculateFontSize();
    const valueFontSize = calculateValueFontSize(nameFontSize);
    
    // Umbral de espacio para mostrar texto
    const showName = width > 25 && height > 18 && name;
    const showValue = width > 50 && height > 35;

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
        {showName && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (showValue ? valueFontSize / 1.5 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: nameFontSize,
              fontWeight: "bold",
              fill: "#fff",
              pointerEvents: "none",
              textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
            }}
          >
            {name}
          </text>
        )}
        {showValue && (
          <text
            x={x + width / 2}
            y={y + height / 2 + nameFontSize / 1.2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: valueFontSize,
              fill: "#fff",
              pointerEvents: "none",
              textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
            }}
          >
            ${size?.toFixed(2)}
          </text>
        )}
      </g>
    );
  };


export default PriceBreakdownChart

