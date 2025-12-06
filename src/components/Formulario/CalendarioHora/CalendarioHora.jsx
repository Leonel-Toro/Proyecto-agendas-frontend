import DatePicker from "react-datepicker"
import styles from "../../InputsForm/InputsForm.module.css"
import { format } from "date-fns"
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

export default function CalendarioHora({name, changePayload, value}) {
  const fechaFormateada = value ? format(value, "dd/MM/yyyy HH:mm", { locale: es }) : "";

  return (
    <div className="grid gap-3">
        <label className={`w-[80%] ${styles.inputForm}`}>
              {fechaFormateada}
        </label>
      <div className={styles.calendario}>
        <DatePicker
          selected={value}
          onChange={(date) => changePayload({ name, value: date })}
          showTimeSelect
          timeIntervals={15}
          timeFormat="HH:mm"
          dateFormat="dd/MM/yyyy HH:mm"
          locale={es}
          inline
          timeCaption="Hora"
        />
      </div>
    </div>
  );
}
