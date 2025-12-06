import DetalleHistorial from "../DetalleHistorial/DetalleHistorial"
import InputsForm from "../InputsForm/InputsForm"
import "./Formulario.css"
import "../../App.css"
import { CalendarContainer } from "react-datepicker"
import CalendarioHora from "./CalendarioHora/CalendarioHora"
import { useEffect, useState } from "react"

export default function Formulario() {
    const urlBase = import.meta.env.VITE_URL_BACKEND;
    const [payload, setPayload] = useState({
        nombreCliente: "",
        emailCliente: "",
        telefonoCliente: "",
        medioCliente: "",
        nombreProducto: "",
        estado: "",
        fechaReserva: new Date(),
        lugarEncuentro: "",
        precio: 0,
        mensajePersonalizado: ""
    });
    
    function handlePayload(inputEvent){
        const name = inputEvent.target !== undefined ? inputEvent.target.name : inputEvent.name;
        let value = inputEvent.target !== undefined ? inputEvent.target.value : inputEvent.value;
        
        if (name === "precio" || name === "telefonoCliente") {
            const soloNum = value.replace(/\D/g, "");
            if (soloNum !== value) {
                return;
            }
            value = soloNum;
        }

        setPayload(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function enviarFormulario(e){        
        e.preventDefault();
        const payloadNormalizado = {
            ...payload,
            precio: Number(payload.precio)
        }

        try {
            const res = await fetch(`${urlBase}/reservas/agendar`, {
                method: "POST",            
                headers: {
                    "Content-Type": "application/json",          
                },
                body: JSON.stringify(payloadNormalizado)
            });

            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();
            
            if (!res.ok) {
                console.error("Error del servidor:", res.status, data);
                return;
            }
            window.location.reload();
        }catch(error) {
            console.error("Error de red:", error);
            return;
        }
    }

    return (
        <section className='formulario'>
            <div className="container-formulario">
                <div className="card">
                    <form >
                        <div className="card-details">
                            <div className="mb-4">
                                <span className="text-base font-semibold text-slate-900 rounded-[20px] bg-[#fff38b] p-[.7rem]">Datos del cliente</span>                                
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-1 my-[1rem] gap-3">
                                <InputsForm titulo="Nombre" type="text" placeholder="Ej: Juan Perez" input="input" name="nombreCliente"  changePayload={handlePayload} value={payload.nombre}/>
                                <InputsForm titulo="Email" type="email" placeholder="Ej: ejemplo@gmail.com" input="input" name="emailCliente"  changePayload={handlePayload} value={payload.email}/>
                                <InputsForm titulo="Teléfono" type="text" placeholder="+569 1234 5678" input="input" name="telefonoCliente"  changePayload={handlePayload} value={payload.telefonoCliente}/>
                                <InputsForm titulo="Medio de contacto" input="select" name="medioCliente"  changePayload={handlePayload} value={payload.medioContacto}/>
                            </div>
                            <div className="mt-[2rem] mb-[1.5rem]">
                                <span className="text-base font-semibold text-slate-900 rounded-[20px] bg-[#fff38b] p-[.7rem]">Datos del pedido</span>                                
                            </div>
                            <div className="grid grid-cols-2 my-[1rem] gap-3">
                                <InputsForm titulo="Nombre del producto" input="input" type="text" name="nombreProducto" placeholder="Snoopy..."  changePayload={handlePayload} value={payload.nombreProducto}/>
                                <InputsForm titulo="Estado" input="select"  changePayload={handlePayload} value={payload.estado} name="estado"/>
                            </div>   
                            <div className="mt-[2rem] mb-[1.5rem]">
                                <span className="text-base font-semibold text-slate-900 rounded-[20px] bg-[#fff38b] p-[.7rem]">Detalles de la reserva</span>  
                            </div>
                            <div className="grid grid-cols-1 my-[1rem] gap-3">
                                <CalendarioHora name="fechaReserva"  changePayload={handlePayload} value={payload.fechaReserva}/>
                            </div>                              
                            <div className="grid grid-cols-2 gap-3">
                                <InputsForm titulo="Lugar de entrega" type="text" input="input" placeholder="Ej: Metro El bosque" name="lugarEncuentro"  changePayload={handlePayload} value={payload.lugarEntrega} />
                                <InputsForm titulo="Precio total" type="text" placeholder="Ej:$10000" input="input"  changePayload={handlePayload} value={payload.precio} name="precio"/>
                            </div>
                            <div className="grid grid-cols-1 my-[1rem] gap-3">
                                <InputsForm titulo="Mensaje" placeholder="Pedido personalizado..." input="textarea" name="mensajePersonalizado"  changePayload={handlePayload} value={payload.mensaje}/>
                            </div>  
                        </div>
                        <div className="card-actions">
                            <button className="btn btn-primary" onClick={enviarFormulario}>Reservar</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}