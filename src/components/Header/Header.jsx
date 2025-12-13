import "./Header.css"
import { Calendar, Clock, Sparkles } from 'lucide-react'

export default function Header({cambiarVista}) {
    return (
      <section className="header">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-7 h-7 text-white" />
            <h1 className="text-2xl font-bold text-white">Mi Agenda</h1>
          </div>
          <nav className="space-y-2">
            <div 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 cursor-pointer transition-all duration-200 group"
              onClick={()=>cambiarVista("agendar")}
            >
              <Calendar className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white text-lg font-medium">Agendar</span>
            </div>
            <div 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 cursor-pointer transition-all duration-200 group"
              onClick={()=>cambiarVista("historial")}
            >
              <Clock className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white text-lg font-medium">Historial</span>
            </div>
          </nav>
        </div>
      </section>
    )
  }