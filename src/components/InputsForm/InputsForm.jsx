  import styles from   "./InputsForm.module.css"

  export default function InputsForm({titulo, type, placeholder, input, value, name, changePayload}) {
      const MedioOpciones = [
        { value: 1, label: "Directo" },
        { value: 2, label: "Facebook" },
        { value: 3, label: "Instagram" },
        { value: 99, label: "Otro" }
      ];

      const estadoOpciones = [
        { value: 1, label: "Pendiente" },
        { value: 2, label: "Abonada" },
        { value: 3, label: "Cancelada" },
        { value: 4, label: "No concretada" },
        { value: 5, label: "Pagada" }
      ];
      
      function inputType(input){
        if(input === 'input'){
          return <input type={type} className={styles.inputForm} placeholder={placeholder} id={name} name={name} value={value} onChange={changePayload}/>
        }
        if(input === 'textarea'){
          return <textarea className={styles.inputForm} placeholder={placeholder} name={name} id={name} value={value} onChange={changePayload}/>
        }
        if(input === 'select'){
          return <select className={`form-control ${styles.selectForm}`} name={name} id={name} onChange={changePayload}>
            <option value="0">Selecciona un estado</option>
            {name === "medioCliente" && MedioOpciones.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            {name === "estado" && estadoOpciones.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        }
      }
      return (
        <div className="flex flex-col gap-1">
          <label className={styles.inputLabel}>{titulo}</label>
          {inputType(input)}
        </div>
      )
    }