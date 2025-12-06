import "./BotonHeader.css"
import "../../App.css"

export default function BotonHeader({titulo, onSelect}) {
    return (
        <div className="btn-header">
            <button className="btn-primary" onClick={onSelect}>
                <span>{titulo}</span>
            </button>
        </div>
    )
}