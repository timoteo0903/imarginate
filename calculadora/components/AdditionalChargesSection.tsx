import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NumericFormat } from "react-number-format"
import { Trash2 } from "lucide-react"

interface AdditionalCharge {
  name: string
  rate: number
}

interface AdditionalChargesSectionProps {
  perceptions: AdditionalCharge[]
  internalTaxes: AdditionalCharge[]
  updatePerception: (index: number, field: "name" | "rate", value: string) => void
  updateInternalTax: (index: number, field: "name" | "rate", value: string) => void
  removePerception: (index: number) => void
  removeInternalTax: (index: number) => void
  addPerception: () => void
  addInternalTax: () => void
  results: {
    netAmount: string
  } | null
  formatCurrency: (value: number) => string
}

const AdditionalChargesSection: React.FC<AdditionalChargesSectionProps> = ({
  perceptions,
  internalTaxes,
  updatePerception,
  updateInternalTax,
  removePerception,
  removeInternalTax,
  addPerception,
  addInternalTax,
  results,
  formatCurrency,
}) => {
  return (
    <Card className=" mt-4">
      <CardHeader>
        <CardTitle className="mt-0 text-lg">Percepciones y Tasas Internas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <div className=" flex-1 min-w-[280px] ">
            <h4 className="font-semibold mb-2">Percepciones</h4>
            {perceptions.length > 0 ? (
              perceptions.map((perception, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <Select value={perception.name} onValueChange={(value) => updatePerception(index, "name", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IIBB - CABA">IIBB - CABA</SelectItem>
                      <SelectItem value="IIBB - BUENOS AIRES">IIBB - BUENOS AIRES</SelectItem>
                      <SelectItem value="IIBB - CATAMARCA">IIBB - CATAMARCA</SelectItem>
                      <SelectItem value="IIBB - CHACO">IIBB - CHACO</SelectItem>
                      <SelectItem value="IIBB - CHUBUT">IIBB - CHUBUT</SelectItem>
                      <SelectItem value="IIBB - CÓRDOBA">IIBB - CÓRDOBA</SelectItem>
                      <SelectItem value="IIBB - ENTRE RÍOS">IIBB - ENTRE RÍOS</SelectItem>
                      <SelectItem value="IIBB - FORMOSA">IIBB - FORMOSA</SelectItem>
                      <SelectItem value="IIBB - JUJUY">IIBB - JUJUY</SelectItem>
                      <SelectItem value="IIBB - LA PAMPA">IIBB - LA PAMPA</SelectItem>
                      <SelectItem value="IIBB - LA RIOJA">IIBB - LA RIOJA</SelectItem>
                      <SelectItem value="IIBB - MENDOZA">IIBB - MENDOZA</SelectItem>
                      <SelectItem value="IIBB - MISIONES">IIBB - MISIONES</SelectItem>
                      <SelectItem value="IIBB - NEUQUÉN">IIBB - NEUQUÉN</SelectItem>
                      <SelectItem value="IIBB - RÍO NEGRO">IIBB - RÍO NEGRO</SelectItem>
                      <SelectItem value="IIBB - SALTA">IIBB - SALTA</SelectItem>
                      <SelectItem value="IIBB - SAN JUAN">IIBB - SAN JUAN</SelectItem>
                      <SelectItem value="IIBB - SAN LUIS">IIBB - SAN LUIS</SelectItem>
                      <SelectItem value="IIBB - SANTA CRUZ">IIBB - SANTA CRUZ</SelectItem>
                      <SelectItem value="IIBB - SANTA FE">IIBB - SANTA FE</SelectItem>
                      <SelectItem value="IIBB - SANTIAGO DEL ESTERO">IIBB - SANTIAGO DEL ESTERO</SelectItem>
                      <SelectItem value="IIBB - TIERRA DEL FUEGO">IIBB - TIERRA DEL FUEGO</SelectItem>
                      <SelectItem value="IIBB - TUCUMÁN">IIBB - TUCUMÁN</SelectItem>
                    </SelectContent>
                  </Select>
                  <NumericFormat
                    value={perception.rate}
                    onValueChange={(values) => updatePerception(index, "rate", values.value)}
                    suffix="%"
                    decimalSeparator=","
                    className="w-10"
                  />
                  {results && (
                    <span className="w-15">
                      {formatCurrency(
                        Number(results.netAmount.replace(/[^\d,-]/g, "").replace(",", ".")) *
                          (perception.rate / 100),
                      )}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removePerception(index)}>
                    <Trash2 className="h-12 w-12" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay percepciones agregadas</p>
            )}
            <Button onClick={addPerception} variant="outline" size="sm" className="mt-2">
              Agregar Percepción
            </Button>
          </div>
          <div className=" flex-1 min-w-[280px] ">
            <h4 className="font-semibold mb-2">Tasas Internas</h4>
            {internalTaxes.length > 0 ? (
              internalTaxes.map((tax, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <Select value={tax.name} onValueChange={(value) => updateInternalTax(index, "name", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TASAS MUNICIPALES">TASAS MUNICIPALES</SelectItem>
                      <SelectItem value="TASAS PROVINCIALES">TASAS PROVINCIALES</SelectItem>
                      <SelectItem value="TASAS AL COMBUSTIBLE">TASAS AL COMBUSTIBLE</SelectItem>
                    </SelectContent>
                  </Select>
                  <NumericFormat
                    value={tax.rate}
                    onValueChange={(values) => updateInternalTax(index, "rate", values.value)}
                    suffix="%"
                    decimalSeparator=","
                    className="w-10"
                  />
                  {results && (
                    <span className="w-15">
                      {formatCurrency(
                        Number(results.netAmount.replace(/[^\d,-]/g, "").replace(",", ".")) * (tax.rate / 100),
                      )}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeInternalTax(index)}>
                    <Trash2 className="h-12 w-12 hover:[#1f2b3e]" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay tasas internas agregadas</p>
            )}
            <Button onClick={addInternalTax} variant="outline" size="sm" className="mt-2">
              Agregar Tasa Interna
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdditionalChargesSection

  