import "./Header.css"

export default function Header({cambiarVista}) {
    return (
      <section className="header">
        <ul>
          <li className="cursor-pointer py-2" onClick={()=>cambiarVista("agendar")}>
            <a className="!text-black text-lg font-medium">Agendar</a>
          </li>
          <li className="cursor-pointer py-2" onClick={()=>cambiarVista("historial")}>
            <a className="!text-black text-lg font-medium">Historial</a>
          </li>
        </ul>
      </section>
    )
  }