import DatePicker from "react-datepicker"
import styles from "../../InputsForm/InputsForm.module.css"
import { format, addMinutes, setHours, setMinutes, setSeconds } from "date-fns"
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { apiGet } from "../../../api/apiClient";
import "react-datepicker/dist/react-datepicker.css";

const HORA_APERTURA = 8;
const HORA_CIERRE = 23; // último slot seleccionable: 23:45

export default function CalendarioHora({name, changePayload, value, highlightDates = [new Date()], psicologoId, excludeReservaId}) {
  const fechaFormateada = value ? format(value, "dd/MM/yyyy HH:mm", { locale: es }) : "Seleccione fecha y hora";
  const diaVisible = value ?? new Date();
  const fechaVisible = format(diaVisible, "yyyy-MM-dd");

  const [excludeTimes, setExcludeTimes] = useState([]);

  useEffect(() => {
    if (!psicologoId) {
      setExcludeTimes([]);
      return;
    }

    let params = `psicologoId=${psicologoId}&fecha=${fechaVisible}`;
    if (excludeReservaId) params += `&excludeReservaId=${excludeReservaId}`;

    apiGet(`/reservas/disponibilidad?${params}`)
      .then(data => {
        const ocupados = Array.isArray(data?.entidad) ? data.entidad : [];
        const horasBloqueadas = [];
        ocupados.forEach(({ inicio, fin }) => {
          let cursor = new Date(inicio);
          const finRango = new Date(fin);
          while (cursor < finRango) {
            horasBloqueadas.push(new Date(cursor));
            cursor = addMinutes(cursor, 15);
          }
        });
        setExcludeTimes(horasBloqueadas);
      })
      .catch(() => setExcludeTimes([]));
  }, [psicologoId, excludeReservaId, fechaVisible]);

  return (
    <div className="grid gap-3">
        <label className={`${styles.inputForm}`}>
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
          highlightDates={highlightDates}
          minDate={new Date()}
          minTime={setHours(setMinutes(setSeconds(new Date(), 0), 0), HORA_APERTURA)}
          maxTime={setHours(setMinutes(setSeconds(new Date(), 45), 0), HORA_CIERRE)}
          excludeTimes={excludeTimes}
        />
      </div>
    </div>
  );
}
