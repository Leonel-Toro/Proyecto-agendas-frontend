import InputsForm from "../InputsForm/InputsForm"
import ModalExito from "../ModalExito/ModalExito"
import "./Formulario.css"
import "../../App.css"
import CalendarioHora from "./CalendarioHora/CalendarioHora"
import { useState } from "react"

export default function Formulario() {
    const urlBase = import.meta.env.VITE_URL_BACKEND;
    const [payload, setPayload] = useState({
        nombreCliente: "",
        medioCliente: "",
        nombreProducto: "",
        estado: "",
        fechaReserva: new Date(),
        lugarEncuentro: "",
        precio: 0,
        mensajePersonalizado: "",
        abonado: 0
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [errors, setErrors] = useState({
        nombreCliente: "",
        medioCliente: "",
        nombreProducto: "",
        estado: "",
        fechaReserva: "",
        lugarEncuentro: "",
        precio: "",
        abonado: ""
    });
    const [touched, setTouched] = useState({
        nombreCliente: false,
        medioCliente: false,
        nombreProducto: false,
        estado: false,
        fechaReserva: false,
        lugarEncuentro: false,
        precio: false,
        abonado: false
    });

    function validateFieldWithPayload(name, value, currentPayload = payload) {
        let error = "";
        
        switch(name) {
            case "nombreCliente":
                if (!value || value.trim() === "") {
                    error = "El nombre es obligatorio";
                } else if (/\d/.test(value)) {
                    error = "El nombre no puede contener números";
                }
                break;
            case "medioCliente":
                if (!value || value === "") {
                    error = "El medio de contacto es obligatorio";
                }
                break;
            case "nombreProducto":
                if (!value || value.trim() === "") {
                    error = "El nombre del producto es obligatorio";
                }
                break;
            case "estado":
                if (!value || value === "") {
                    error = "El estado es obligatorio";
                }
                break;
            case "lugarEncuentro":
                if (!value || value.trim() === "") {
                    error = "El lugar de entrega es obligatorio";
                }
                break;
            case "abonado":
                const abonadoNum = Number(value);
                if (value === "" || value === "0") {
                    error = "El precio es obligatorio";
                } else if (abonadoNum < 0) {
                    error = "El precio debe ser mayor o igual a 0";
                } else if (abonadoNum > Number(currentPayload.precio)) {
                    error = "El abonado no puede ser mayor al precio total";
                }
                break;
            case "precio":
                const precioNum = Number(value);
                if (value === "" || value === "0") {
                    error = "El precio es obligatorio";
                } else if (precioNum <= 0) {
                    error = "El precio debe ser mayor a 0";
                }
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        return error;
    }

    function validateField(name, value) {
        return validateFieldWithPayload(name, value, payload);
    }
    
    function handlePayload(inputEvent){
        const name = inputEvent.target !== undefined ? inputEvent.target.name : inputEvent.name;
        let value = inputEvent.target !== undefined ? inputEvent.target.value : inputEvent.value;
        
        if (name === "precio" || name === "abonado") {
            const soloNum = value.replace(/\D/g, "");
            if (soloNum !== value) {
                return;
            }
            value = soloNum;
        }

        const nuevoPayload = {
            ...payload,
            [name]: value
        };

        setPayload(nuevoPayload);
        
        // Marcar el campo como tocado
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validar solo los campos que han sido tocados
        Object.keys(errors).forEach(fieldName => {
            if (touched[fieldName] || fieldName === name) {
                validateFieldWithPayload(fieldName, nuevoPayload[fieldName], nuevoPayload);
            }
        });
    }

    async function enviarFormulario(e){        
        e.preventDefault();
        
        // Marcar todos los campos como tocados
        const allTouched = Object.keys(touched).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        // Validar todos los campos antes de enviar
        const camposValidar = [
            { name: "nombreCliente", value: payload.nombreCliente },
            { name: "medioCliente", value: payload.medioCliente },
            { name: "nombreProducto", value: payload.nombreProducto },
            { name: "estado", value: payload.estado },
            { name: "fechaReserva", value: payload.fechaReserva },
            { name: "lugarEncuentro", value: payload.lugarEncuentro },
            { name: "precio", value: payload.precio },
            { name: "abonado", value: payload.abonado }
        ];
        
        let hayErrores = false;
        camposValidar.forEach(campo => {
            const error = validateField(campo.name, campo.value);
            if (error) hayErrores = true;
        });
        
        if (hayErrores) {
            setErrorMessage("Por favor, corrige los errores del formulario");
            return;
        }
        const payloadNormalizado = {
            precio: Number(payload.precio),
            abonado: Number(payload.abonado),
            abono: Number(payload.abonado),
            estado: payload.estado,
            nombreProducto: payload.nombreProducto,
            fechaReserva: payload.fechaReserva,
            fechaTermino: null,
            lugarEncuentro: payload.lugarEncuentro,
            nombreCliente: payload.nombreCliente,
            medioCliente: payload.medioCliente,
            mensajePersonalizado: payload.mensajePersonalizado
        }
        
        console.log("Payload enviado a la API:", payloadNormalizado);

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
                console.error("Error del servidor:", res.status, data.mensaje);
                setErrorMessage(data.mensaje || "Ha ocurrido un error");
                return;
            }
            
            // Mostrar modal de éxito
            const mensajeRespuesta = typeof data === 'object' && data?.mensaje 
                ? data.mensaje 
                : 'La reserva se ha agendado correctamente';
            setMensajeExito(mensajeRespuesta);
            setModalExitoAbierto(true);
        }catch(error) {
            console.error("Error de red:", error);
            setErrorMessage("Error de conexión con el servidor");
            return;
        }
    }

    const handleCerrarModalExito = () => {
        setModalExitoAbierto(false);
        setMensajeExito('');
        window.location.reload();
    };

    return (
        <section className='formulario'>
            {errorMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-red-800 font-medium text-sm">
                                    {errorMessage}
                                </p>
                            </div>
                            <button
                                onClick={() => setErrorMessage("")}
                                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                aria-label="Cerrar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="container-formulario">
                <div className="card">
                    <form >
                        <div className="card-details">
                            <div className="mb-6">
                                <div className=" titulo-formulario bg-white/80 p-1 inline-flex items-center gap-2 shadow-md ">
                                    <span className="w-1.5 h-8 bg-[#4a4238] rounded-full"></span>
                                    <span className="text-base font-bold text-gray-800 pr-3">Datos del cliente</span>
                                </div>                            
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-1 my-[1rem] gap-3">
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Nombre" type="text" placeholder="Ej: Juan Perez" input="input" name="nombreCliente"  changePayload={handlePayload} value={payload.nombreCliente}/>
                                    {touched.nombreCliente && errors.nombreCliente && <p className="text-red-500 text-xs mt-1 ml-1">{errors.nombreCliente}</p>}
                                </div>
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Medio de contacto" input="select" name="medioCliente"  changePayload={handlePayload} value={payload.medioCliente}/>
                                    {touched.medioCliente && errors.medioCliente && <p className="text-red-500 text-xs mt-1 ml-1">{errors.medioCliente}</p>}
                                </div>
                            </div>
                            <div className="mt-[2.5rem] mb-6">
                                <div className="titulo-formulario bg-white/80 p-1 inline-flex items-center gap-2 shadow-md ">
                                    <span className="w-1.5 h-8 bg-[#4a4238] rounded-full"></span>
                                    <span className="text-base font-bold text-gray-800 pr-3">Datos del pedido</span>
                                </div>                             
                            </div>
                            <div className="grid grid-cols-2 my-[1rem] gap-3">
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Nombre del producto" input="input" type="text" name="nombreProducto" placeholder="Snoopy..."  changePayload={handlePayload} value={payload.nombreProducto}/>
                                    {touched.nombreProducto && errors.nombreProducto && <p className="text-red-500 text-xs mt-1 ml-1">{errors.nombreProducto}</p>}
                                </div>
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Estado" input="select"  changePayload={handlePayload} value={payload.estado} name="estado"/>
                                    {touched.estado && errors.estado && <p className="text-red-500 text-xs mt-1 ml-1">{errors.estado}</p>}
                                </div>
                            </div>   
                            <div className="mt-[2.5rem] mb-6">
                                <div className="titulo-formulario bg-white/80 p-1 inline-flex items-center gap-2 shadow-md ">
                                    <span className="w-1.5 h-8 bg-[#4a4238] rounded-full"></span>
                                    <span className="text-base font-bold text-gray-800 pr-3">Detalles de la reserva</span>
                                </div>  
                            </div>
                            <div className="grid grid-cols-1 my-[1rem] gap-3">
                                <div>
                                    <CalendarioHora name="fechaReserva"  changePayload={handlePayload} value={payload.fechaReserva}/>
                                    {touched.fechaReserva && errors.fechaReserva && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fechaReserva}</p>}
                                </div>
                            </div>                              
                            <div className="grid grid-cols-3 gap-3" style={{ alignItems: 'end' }}>
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Lugar de entrega" type="text" input="input" placeholder="Ej: Metro El bosque" name="lugarEncuentro"  changePayload={handlePayload} value={payload.lugarEncuentro} />
                                    {touched.lugarEncuentro && errors.lugarEncuentro && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lugarEncuentro}</p>}
                                </div>
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Abonado" type="text" placeholder="Ej:$10000" input="input"  changePayload={handlePayload} value={payload.abonado} name="abonado"/>
                                    {touched.abonado && errors.abonado && <p className="text-red-500 text-xs mt-1 ml-1">{errors.abonado}</p>}
                                </div>
                                <div className="min-h-[95px]">
                                    <InputsForm titulo="Precio total" type="text" placeholder="Ej:$10000" input="input"  changePayload={handlePayload} value={payload.precio} name="precio"/>
                                    {touched.precio && errors.precio && <p className="text-red-500 text-xs mt-1 ml-1">{errors.precio}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 my-[1rem] gap-3">
                                <InputsForm titulo="Mensaje" placeholder="Pedido personalizado..." input="textarea" name="mensajePersonalizado"  changePayload={handlePayload} value={payload.mensaje}/>
                            </div>  
                        </div>
                        <div className="card-actions">
                            <button 
                                className="px-8 py-3 bg-[#4a4238] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                                onClick={enviarFormulario}
                                disabled={Object.values(errors).some(error => error !== "")}
                            >
                                Reservar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {modalExitoAbierto && (
                <ModalExito
                    mensaje={mensajeExito}
                    onClose={handleCerrarModalExito}
                />
            )}
        </section>
    )
}