import styles from "./InputsForm.module.css";
import {
  ESTADO_OPCIONES,
  MODALIDAD_OPCIONES,
  DURACION_OPCIONES,
  TIPO_SESION_OPCIONES,
  GENERO_OPCIONES,
} from "../../constants/estados";

export default function InputsForm({ titulo, type, placeholder, input, value, name, changePayload }) {
  function getOpciones() {
    if (name === "estado") return ESTADO_OPCIONES;
    if (name === "modalidad") return MODALIDAD_OPCIONES;
    if (name === "duracionMinutos") return DURACION_OPCIONES;
    if (name === "tipoSesion") return TIPO_SESION_OPCIONES;
    if (name === "genero") return GENERO_OPCIONES;
    return [];
  }

  function inputType(kind) {
    if (kind === 'input') {
      return (
        <input
          type={type}
          className={styles.inputForm}
          placeholder={placeholder}
          id={name}
          name={name}
          value={value}
          onChange={changePayload}
        />
      );
    }
    if (kind === 'textarea') {
      return (
        <textarea
          className={styles.inputForm}
          placeholder={placeholder}
          name={name}
          id={name}
          value={value}
          onChange={changePayload}
        />
      );
    }
    if (kind === 'select') {
      const opciones = getOpciones();
      return (
        <select
          className={`form-control ${styles.selectForm}`}
          name={name}
          id={name}
          value={value ?? ''}
          onChange={changePayload}
        >
          <option value="">Selecciona una opción</option>
          {opciones.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <label className={styles.inputLabel}>{titulo}</label>
      {inputType(input)}
    </div>
  );
}
