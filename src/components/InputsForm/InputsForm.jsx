import styles from "./InputsForm.module.css";
import { ESTADOS, MEDIO_OPCIONES } from "../../constants/estados";

export default function InputsForm({ titulo, type, placeholder, input, value, name, changePayload }) {
  const MedioOpciones = Object.entries(MEDIO_OPCIONES).map(([value, label]) => ({ value: Number(value), label }));
  const estadoOpciones = Object.entries(ESTADOS).map(([value, label]) => ({ value: Number(value), label }));

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
      return (
        <select
          className={`form-control ${styles.selectForm}`}
          name={name}
          id={name}
          value={value ?? ''}
          onChange={changePayload}
        >
          <option value="">Selecciona una opción</option>
          {name === "medioCliente" && MedioOpciones.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
          {name === "estado" && estadoOpciones.map((option) => (
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