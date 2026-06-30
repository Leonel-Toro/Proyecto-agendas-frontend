import { useState } from 'react';
import { X, Sparkles, Send, Check, Pencil, RotateCcw, Bot } from 'lucide-react';
import { apiPost } from '../../api/apiClient';
import '../DetalleReservaModal/DetalleReservaModal.css';

export default function AgenteIAModal({ nota, reserva, onClose, onNotaGuardada }) {
  const [mensaje, setMensaje] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const sessionId = `nota-${nota.idNota}`;

  const handleConsultar = async () => {
    const trimmed = mensaje.trim();
    if (!trimmed) return;
    setConsultando(true);
    setError('');
    setRespuesta(null);
    try {
      const prompt = `Nota de sesión clínica: "${nota.nota}"\n\nConsulta del psicólogo: ${trimmed}`;
      const resp = await apiPost('/agent/chat', { sessionId, message: prompt });
      setRespuesta(resp);
    } catch (e) {
      setError(e.message || 'Error al consultar al asistente');
    } finally {
      setConsultando(false);
    }
  };

  const handleNuevaConsulta = () => {
    setRespuesta(null);
    setMensaje('');
    setModoEdicion(false);
    setTextoEdicion('');
    setError('');
  };

  const handleGuardarNota = async (texto) => {
    setGuardando(true);
    setError('');
    try {
      const resp = await apiPost('/admin/notas', {
        idReserva: reserva.id,
        nota: texto.trim(),
      });
      onNotaGuardada?.(resp?.entidad);
      onClose();
    } catch (e) {
      setError(e.message || 'Error al guardar la nota');
      setGuardando(false);
    }
  };

  const iniciarEdicion = () => {
    setTextoEdicion(respuesta.response);
    setModoEdicion(true);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      {error && (
        <div className="fixed top-4 right-4" style={{ zIndex: 1200 }}>
          <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-800 font-medium text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal-content">
        {/* Header */}
        <div
          className="modal-header-decorative"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}
        >
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
          <div className="modal-header-content flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white opacity-90" />
            <div>
              <h2 className="modal-title">Asistente IA</h2>
              <p className="modal-subtitle">Melia · Asistente clínico para psicólogos</p>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* Nota original */}
          <div className="mb-[1.5rem]">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
              Nota de sesión
            </p>
            <div className="rounded-xl p-[1.2rem] bg-amber-50 border border-amber-100 text-sm text-[#4a4238] leading-relaxed">
              {nota.nota}
            </div>
          </div>

          {/* Input de consulta — visible solo cuando no hay respuesta */}
          {!respuesta && !consultando && (
            <div className="mb-[1.5rem]">
              <p className="text-xs font-semibold text-[#4a4238] uppercase tracking-wide mb-[0.3rem]">
                Tu consulta
              </p>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleConsultar()}
                rows={3}
                placeholder="¿Qué querés preguntarle a Melia sobre esta nota?"
                className="input-field-custom resize-none"
                autoFocus
              />
              <p className="text-xs text-zinc-400 mt-1.5">
                Enter para enviar · Shift+Enter para nueva línea
              </p>
            </div>
          )}

          {/* Estado cargando */}
          {consultando && (
            <div className="flex items-center justify-center py-[2.5rem] text-violet-400 gap-3">
              <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-sm font-medium">Melia está pensando...</span>
            </div>
          )}

          {/* Respuesta de Melia */}
          {respuesta && (
            <div className="mb-[1.5rem]">
              <div className="flex items-center gap-2 mb-[0.3rem]">
                <Bot className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                  Respuesta de Melia
                </p>
              </div>
              {modoEdicion ? (
                <textarea
                  value={textoEdicion}
                  onChange={e => setTextoEdicion(e.target.value)}
                  rows={6}
                  className="input-field-custom resize-none"
                  autoFocus
                />
              ) : (
                <div className="rounded-xl p-4 bg-violet-50 border border-violet-100 text-sm text-[#4a4238] leading-relaxed whitespace-pre-wrap">
                  {respuesta.response}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {/* Sin respuesta aún */}
          {!respuesta && !consultando && (
            <>
              <button onClick={onClose} className="btn-cancelar">
                Cancelar
              </button>
              <button
                onClick={handleConsultar}
                disabled={!mensaje.trim()}
                className="btn-guardar flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Send className="w-4 h-4" />
                Consultar a Melia
              </button>
            </>
          )}

          {/* Respuesta recibida, modo vista */}
          {respuesta && !modoEdicion && (
            <>
              <button onClick={handleNuevaConsulta} className="btn-cancelar flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Nueva consulta
              </button>
              <button
                onClick={iniciarEdicion}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-violet-200 text-violet-600 font-semibold text-sm hover:bg-violet-50 transition-all"
              >
                <Pencil className="w-4 h-4" />
                Editar y guardar
              </button>
              <button
                onClick={() => handleGuardarNota(respuesta.response)}
                disabled={guardando}
                className="btn-guardar flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Check className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar como nota'}
              </button>
            </>
          )}

          {/* Modo edición de la respuesta */}
          {modoEdicion && (
            <>
              <button onClick={() => setModoEdicion(false)} className="btn-cancelar">
                Cancelar edición
              </button>
              <button
                onClick={() => handleGuardarNota(textoEdicion)}
                disabled={!textoEdicion.trim() || guardando}
                className="btn-guardar flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
