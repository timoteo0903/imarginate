"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { NumericFormat } from "react-number-format"
import { Trash2, Plus, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface CostComponent {
  id: string
  name: string
  amount: string
  includeVAT: boolean
  vatRate: string
  vatAmount: number
  netAmount: number
}

interface CostBreakdownSectionProps {
  costComponents: CostComponent[]
  setCostComponents: React.Dispatch<React.SetStateAction<CostComponent[]>>
  vatPercentage: string
  totalCost: number
  formatCurrency: (value: number) => string
  updateTotalCost: () => void
  onVATChange?: (totalVAT: number) => void
}

const CostBreakdownSection: React.FC<CostBreakdownSectionProps> = ({
  costComponents,
  setCostComponents,
  vatPercentage,
  totalCost,
  formatCurrency,
  updateTotalCost,
  onVATChange,
}) => {
  const [newComponentName, setNewComponentName] = useState("")
  const [newComponentAmount, setNewComponentAmount] = useState("")

  const addCostComponent = () => {
    const name = newComponentName.trim() || `Componente ${costComponents.length + 1}`
    setCostComponents([
      ...costComponents,
      {
        id: `cost-${Date.now()}`,
        name,
        amount: newComponentAmount,
        includeVAT: false,
        vatRate: vatPercentage,
        vatAmount: 0,
        netAmount: Number(newComponentAmount.replace(/[^\d.-]/g, "")) || 0,
      },
    ])
    setNewComponentName("")
    setNewComponentAmount("")
  }

  const removeCostComponent = (id: string) => {
    setCostComponents(costComponents.filter((component) => component.id !== id))
    updateTotalCost()
  }

  const updateCostComponent = (id: string, field: keyof CostComponent, value: string | boolean, updateVAT = false) => {
    setCostComponents(
      costComponents.map((component) => {
        if (component.id === id) {
          const updatedComponent = { ...component, [field]: value }

          // Calculate VAT and net amount if amount or VAT settings change
          if (field === "amount" || field === "includeVAT" || field === "vatRate" || updateVAT) {
            const amount = Number(updatedComponent.amount.replace(/[^\d.-]/g, "")) || 0
            const vatRate = Number(updatedComponent.vatRate) / 100

            if (updatedComponent.includeVAT) {
              // If amount includes VAT, calculate net amount and VAT amount
              const netAmount = amount / (1 + vatRate)
              updatedComponent.netAmount = netAmount
              updatedComponent.vatAmount = amount - netAmount
            } else {
              // If amount doesn't include VAT, net amount is the amount itself
              updatedComponent.netAmount = amount
              updatedComponent.vatAmount = 0
            }
          }

          return updatedComponent
        }
        return component
      }),
    )
    updateTotalCost()
  }

  // Calculate totals
  const totalNetAmount = costComponents.reduce((sum, component) => sum + component.netAmount, 0)
  const totalVATAmount = costComponents.reduce((sum, component) => sum + component.vatAmount, 0)
  const totalGrossAmount = totalNetAmount + totalVATAmount

  // Notify parent component about VAT change
  useEffect(() => {
    if (onVATChange) {
      onVATChange(totalVATAmount)
    }
  }, [totalVATAmount, onVATChange])

  // Remove this section
  // Common cost component types for quick selection
  /*const commonCostTypes = [
    "Materia Prima",
    "Mano de Obra",
    "Logística",
    "Marketing",
    "Empaque",
    "Almacenamiento",
    "Servicios",
  ]*/

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Componentes de Costo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-grow flex gap-2">
              <Input
                value={newComponentName}
                onChange={(e) => setNewComponentName(e.target.value)}
                placeholder="Categoría"
                className="w-full"
              />
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <NumericFormat
                  value={newComponentAmount}
                  onValueChange={(values) => setNewComponentAmount(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  className="h-10 w-[120px] pl-8 rounded-md border border-input bg-gray-50"
                  placeholder="Precio"
                />
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  addCostComponent()
                }}
                size="sm"
                className="flex items-center gap-1 h-10 bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>
          </div>

          {costComponents.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {costComponents.map((component) => (
                  <div key={component.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex-grow grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <p className="text-sm font-medium truncate">{component.name}</p>
                      </div>

                      <div className="col-span-3">
                        <NumericFormat
                          value={component.amount}
                          onValueChange={(values) => updateCostComponent(component.id, "amount", values.value, true)}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="$"
                          className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          placeholder="Monto"
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-1">
                        <Checkbox
                          id={`includeVAT-${component.id}`}
                          checked={component.includeVAT}
                          onCheckedChange={(checked) =>
                            updateCostComponent(component.id, "includeVAT", checked as boolean, true)
                          }
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={`includeVAT-${component.id}`} className="text-xs">
                          Incluye IVA
                        </Label>
                      </div>

                      <div className="col-span-3">
                        {component.includeVAT && (
                          <Select
                            value={component.vatRate}
                            onValueChange={(value) => updateCostComponent(component.id, "vatRate", value, true)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="IVA %" />
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
                        )}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCostComponent(component.id)}
                          className="h-6 w-6 text-red-500 hover:text-red-700 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Costo Total:</span>
                  <span className="font-bold">{formatCurrency(totalGrossAmount)}</span>
                </div>
                {totalVATAmount > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    <div className="flex justify-between">
                      <span>Monto sin IVA:</span>
                      <span>{formatCurrency(totalNetAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA total:</span>
                      <span>{formatCurrency(totalVATAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed rounded-md bg-gray-50">
              <p className="text-sm text-muted-foreground">Agregue componentes de costo para comenzar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CostBreakdownSection

