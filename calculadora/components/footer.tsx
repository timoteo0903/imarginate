import Link from "next/link"
import { Twitter, Instagram} from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto flex justify-center items-center space-x-6">
        <Link href="https://twitter.com/TimoteoGarciaa" target="_blank" rel="noopener noreferrer">
          <Twitter className="w-6 h-6 text-gray-600 hover:text-blue-400" />
          <span className="sr-only">Twitter</span>
        </Link>
        <Link href="https://instagram.com/timoteogarciaa" target="_blank" rel="noopener noreferrer">
          <Instagram className="w-6 h-6 text-gray-600 hover:text-pink-500" />
          <span className="sr-only">Instagram</span>
        </Link>
      </div>
    </footer>
  )
}

export default Footer