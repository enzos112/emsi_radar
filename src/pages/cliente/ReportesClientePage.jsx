import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";
import { FileText, Eye, X, Clock, CheckCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportesClientePage() {
  const { user } = useAuthStore();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal y Detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteDetalle, setReporteDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    if (user?.empresaId) cargarReportes();
  }, [page, user]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/reportes", {
        params: { empresaId: user.empresaId, page, size: 10 }
      });
      setReportes(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    setModalOpen(true);
    setLoadingDetalle(true);
    try {
      const { data } = await axiosInstance.get(`/reportes/${id}`);
      setReporteDetalle(data.data);
    } catch (error) {
      toast.error("Error al cargar el detalle");
      setModalOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-PE", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
      EN_REVISION: "bg-blue-100 text-blue-700 border-blue-200",
      SOLUCIONADO: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${estilos[estado] || "bg-slate-100 text-slate-600"}`}>{estado.replace("_", " ")}</span>;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Tus Reportes</h2>
          <p className="text-slate-500 text-sm">Historial de incidencias reportadas en tu empresa.</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="p-4 font-bold">Folio</th>
              <th className="p-4 font-bold">Tipo</th>
              <th className="p-4 font-bold">Fecha / Área</th>
              <th className="p-4 font-bold">Estado</th>
              <th className="p-4 font-bold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 animate-pulse">Cargando reportes...</td></tr>
            ) : reportes.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400">No hay reportes registrados aún.</td></tr>
            ) : (
              reportes.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{rep.folio}</td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-slate-800">{rep.tipoComportamientoNombre}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600 font-medium flex items-center gap-1"><Calendar size={14}/> {formatearFecha(rep.fechaOcurrido)}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{rep.area}</p>
                  </td>
                  <td className="p-4">{getEstadoBadge(rep.estado)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => verDetalle(rep.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-slate-500">Página {page + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={20}/></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={20}/></button>
          </div>
        </div>
      )}

      {/* Modal Detalle y Línea Temporal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{reporteDetalle?.folio}</h2>
                <p className="text-slate-500 text-sm mt-1">{reporteDetalle?.tipoComportamientoNombre}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {loadingDetalle ? (
              <div className="py-10 text-center text-slate-400 animate-pulse">Cargando detalles...</div>
            ) : reporteDetalle ? (
              <div className="space-y-8">
                {/* Datos básicos */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Área / Ubicación</p>
                    <p className="font-semibold text-slate-700 text-sm">{reporteDetalle.area}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Turno de Trabajo</p>
                    <p className="font-semibold text-slate-700 text-sm">{reporteDetalle.turno || "No especificado"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estado Actual</p>
                    <div className="mt-1">{getEstadoBadge(reporteDetalle.estado)}</div>
                  </div>
                  
                  <div className="col-span-2 mt-2 pt-4 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Descripción del Incidente</p>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                      {reporteDetalle.descripcionComportamiento}
                    </p>
                  </div>

                  {reporteDetalle.medidaContencion && (
                    <div className="col-span-2 mt-2">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Medida de Contención Inmediata</p>
                      <p className="text-sm text-amber-700 mt-1.5 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100/50">
                        {reporteDetalle.medidaContencion}
                      </p>
                    </div>
                  )}

                  {/* Mapeo de Campos Dinámicos Seguro */}
                  {(() => {
                    let campos = {};
                    try {
                      campos = typeof reporteDetalle.camposDinamicos === 'string' 
                        ? JSON.parse(reporteDetalle.camposDinamicos) 
                        : (reporteDetalle.camposDinamicos || {});
                    } catch (e) {
                      campos = {};
                    }

                    return Object.keys(campos).length > 0 ? (
                      <div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
                        {Object.entries(campos).map(([key, value]) => (
                          <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="font-semibold text-slate-700 text-sm truncate" title={String(value)}>
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Línea Temporal */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-500"/> Historial de Seguimiento</h3>
                  <div className="space-y-6 border-l-2 border-slate-100 ml-3 pl-6 relative">
                    {reporteDetalle.historial?.length > 0 ? (
                      reporteDetalle.historial.map((hist, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200 text-slate-400">
                            {hist.estadoNuevo === 'SOLUCIONADO' ? <CheckCircle size={16} className="text-emerald-500"/> : <AlertCircle size={16} className="text-blue-500"/>}
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase">{formatearFecha(hist.fechaCambio)}</p>
                          <p className="font-bold text-slate-700 mt-1">Cambio a {hist.estadoNuevo.replace("_", " ")}</p>
                          {hist.comentario && <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl mt-2 italic">"{hist.comentario}"</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aún no hay actualizaciones para este reporte.</p>
                    )}
                    {/* Evento de creación (siempre al final de la línea) */}
                    <div className="relative">
                      <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200 text-slate-400">
                        <FileText size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{formatearFecha(reporteDetalle.createdAt)}</p>
                      <p className="font-bold text-slate-700 mt-1">Reporte Registrado</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}