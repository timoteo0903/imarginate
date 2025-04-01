import Link from "next/link"
import { Twitter, Instagram, TwitterIcon as TikTok, Github, Heart } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 flex items-center justify-center text-center">
      <div className="container px-4 ">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center mb-4">
            <span className="text-gray-700 font-medium mr-2">Imarginate, Tu calculadora Financiera</span>
            <span className="text-gray-500 text-sm flex items-center">
              <Heart className="h-3 w-3 text-red-500 mr-1" />
              Hecho con pasión, por Timoteo Garcia
            </span>
          </div>

          <div className="flex items-center space-x-6 mb-4">
          <Link href="https://x.com/TimoteoGarciaa" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 text-gray-600 hover:text-blue-400" />
              <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://instagram.com/timoteogarciaa" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 text-gray-600 hover:text-pink-500" />
              <span className="sr-only">Instagram</span>
              </Link>
            <a
            href="https://cafecito.app/timoteoo"
            rel="noreferrer noopener"
            target="_blank"
            className="hover:opacity-90 transition-opacity"
          >
            <img
              srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
              src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
              alt="Invitame un café en cafecito.app"
            />
          </a>
          </div>

          <div className="mb-4">

          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Imarginate. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

