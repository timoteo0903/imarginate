import InstallmentsCalculator from "@/components/InstallmentsCalculator"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InstallmentsCalculatorPage() {
  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/" passHref>
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>
      <InstallmentsCalculator />
    </main>
  )
}

