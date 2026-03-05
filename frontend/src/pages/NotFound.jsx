import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft, Terminal } from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import SEO from '@/components/ui/SEO'
import { useState, useEffect } from 'react'

const NotFound = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans overflow-hidden relative">
      <SEO
        title="404 - Lost in Cyberspace | Nexura Solutions"
        description="The page you requested could not be found. Let's get you back to safety."
      />

      {/* Absolute Header just for 404 */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all duration-300">
            <span className="font-bold text-xl">N</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight hidden sm:block">Nexura</span>
        </Link>
        <Link to="/" className="text-gray-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Main Site
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10 w-full">
        {/* Dynamic Glow following mouse */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Code Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[15%] left-[10%] animate-float"><Terminal className="w-16 h-16 text-blue-400" /></div>
          <div className="absolute top-[60%] right-[15%] animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}><span className="text-4xl text-purple-400 font-mono">{"</>"}</span></div>
          <div className="absolute bottom-[20%] left-[20%] animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }}><span className="text-5xl text-indigo-400 font-bold opacity-50">404</span></div>
        </div>

        <div className="max-w-2xl w-full text-center relative z-10">
          {/* Glitchy 404 Text */}
          <div className="relative inline-block mb-4 group">
            <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] select-none">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg blur-xl"></div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Lost in Cyberspace
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            The page you're searching for has either evaporated into the void,
            been abducted by aliens, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="group relative px-8 py-4 bg-white text-gray-950 font-bold rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center group-hover:text-white transition-colors duration-300">
                <Home className="w-5 h-5 mr-2" />
                Return to Base
              </span>
            </Link>

            <Link
              to="/contact"
              className="px-8 py-4 bg-gray-900 border border-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 w-full sm:w-auto flex items-center justify-center hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <Search className="w-5 h-5 mr-2" />
              Report Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Grid Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-900/20 to-transparent flex items-end justify-center perspective-[1000px] pointer-events-none">
        <div className="w-[200%] h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(50px)] [transform-origin:bottom]"></div>
      </div>
    </div>
  )
}

export default NotFound