import BreakEvenCalculator from "@/components/BreakEvenCalculator"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BreakEvenCalculatorPage() {
  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/" passHref>
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>
      <BreakEvenCalculator />
    </main>
  )
}

