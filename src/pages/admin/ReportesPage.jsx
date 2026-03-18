import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  Shield,
  X,
  Image as ImageIcon,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// 1. Añadimos la función utilitaria para limpiar textos con HTML Entities
const decodificarHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(0);
  const [estadisticas, setEstadisticas] = useState({
    TOTAL: 0,
    PENDIENTE: 0,
    EN_REVISION: 0,
    SOLUCIONADO: 0,
  });

  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [comentario, setComentario] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [viendoImagenes, setViendoImagenes] = useState(false);

  useEffect(() => {
    cargarReportes();
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const res = await axiosInstance.get("/reportes/estadisticas");
      const contadores = res.data.data.contadores;
      setEstadisticas({
        TOTAL: contadores?.total || 0,
        PENDIENTE: contadores?.pendientes || 0,
        EN_REVISION: contadores?.enRevision || 0,
        SOLUCIONADO: contadores?.solucionados || 0,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/reportes", {
        params: { page: 0, size: 1000 },
      });

      // 2. Limpiamos los datos básicos de la tabla al cargar
      const datosLimpios = (response.data.data.content || []).map((rep) => ({
        ...rep,
        empresaNombre: decodificarHTML(rep.empresaNombre),
        area: decodificarHTML(rep.area),
        tipoComportamientoNombre: decodificarHTML(rep.tipoComportamientoNombre),
      }));

      setReportes(datosLimpios);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = async (id) => {
    setViendoImagenes(false);
    setLoadingDetalle(true);
    try {
      const res = await axiosInstance.get(`/reportes/${id}`);

      // 3. Limpiamos todos los textos largos del detalle
      let data = res.data.data;
      data.empresaNombre = decodificarHTML(data.empresaNombre);
      data.area = decodificarHTML(data.area);
      data.tipoComportamientoNombre = decodificarHTML(
        data.tipoComportamientoNombre,
      );
      data.descripcionComportamiento = decodificarHTML(
        data.descripcionComportamiento,
      );
      data.medidaContencion = decodificarHTML(data.medidaContencion);

      if (data.historial) {
        data.historial = data.historial.map((h) => ({
          ...h,
          comentario: decodificarHTML(h.comentario),
        }));
      }

      setReporteSeleccionado(data);
      setNuevoEstado(data.estado);
      setComentario("");
    } catch (error) {
      toast.error("Error al cargar el detalle del reporte");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModal = () => {
    setViendoImagenes(false);
    setReporteSeleccionado(null);
    setNuevoEstado("");
    setComentario("");
  };

  const handleGuardarCambios = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.patch(`/reportes/${reporteSeleccionado.id}/estado`, {
        estado: nuevoEstado,
        comentario: comentario,
      });
      toast.success("Actualizado correctamente");
      cargarReportes();
      cargarEstadisticas();
      abrirModal(reporteSeleccionado.id);
      setComentario("");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setIsUpdating(false);
    }
  };

  const estadoCambiado =
    reporteSeleccionado && nuevoEstado !== reporteSeleccionado.estado;
  const comentarioValido = comentario.trim().length > 0;

  const reportesFiltrados = reportes.filter((rep) => {
    const matchBusqueda =
      rep.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.empresaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.area?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filtroEstado === "TODOS" || rep.estado === filtroEstado;

    let matchFecha = true;
    if (fechaDesde && fechaHasta && rep.fechaOcurrido) {
      const fechaRep = new Date(rep.fechaOcurrido);
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      matchFecha = fechaRep >= desde && fechaRep <= hasta;
    }

    return matchBusqueda && matchEstado && matchFecha;
  });

  const totalPaginasCalculadas = Math.ceil(reportesFiltrados.length / 10);
  const reportesPaginados = reportesFiltrados.slice(
    paginaActual * 10,
    (paginaActual + 1) * 10,
  );

  const handleExportCSV = () => {
    if (reportesFiltrados.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const separador = ";";
    const encabezados = [
      "Folio",
      "Fecha",
      "Empresa",
      "Area",
      "Turno",
      "Clasificacion",
      "Estado",
    ].join(separador);

    const limpiarTexto = (texto) => {
      if (!texto) return '""';
      return `"${texto.toString().replace(/"/g, '""').replace(/\n/g, " ")}"`;
    };

    const filas = reportesFiltrados.map((r) =>
      [
        r.folio,
        r.fechaOcurrido,
        limpiarTexto(r.empresaNombre),
        limpiarTexto(r.area),
        r.turno,
        limpiarTexto(r.tipoComportamientoNombre),
        r.estado,
      ].join(separador),
    );

    const contenidoCSV = [encabezados, ...filas].join("\n");
    const blob = new Blob(["\ufeff" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reportes_RADAR_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("CSV generado correctamente");
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Bandeja de Reportes
        </h1>
        <p className="text-slate-500 mt-1">
          Gestión centralizada de incidentes y evidencias
        </p>
      </div>

      <div className="mb-6 space-y-3">
        {/* Controles de Búsqueda y Exportación */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full bg-white rounded-2xl flex items-center px-4 py-3.5 border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <Search className="text-slate-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Buscar por folio, empresa o área..."
              className="bg-transparent w-full outline-none text-sm font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaginaActual(0);
              }}
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 rounded-2xl font-bold transition-all text-sm shadow-sm active:scale-95"
          >
            <Download size={18} /> Exportar CSV
          </button>
        </div>

        {/* Filtros Avanzados */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {["TODOS", "PENDIENTE", "EN_REVISION", "SOLUCIONADO"].map((est) => {
              const cantidadReal =
                est === "TODOS" ? estadisticas.TOTAL : estadisticas[est] || 0;
              return (
                <button
                  key={est}
                  onClick={() => {
                    setFiltroEstado(est);
                    setPaginaActual(0);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filtroEstado === est
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {est.replace("_", " ")}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] ${filtroEstado === est ? "bg-blue-50 text-blue-600" : "bg-slate-200/50 text-slate-500"}`}
                  >
                    {cantidadReal}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-2 text-sm w-full md:w-auto">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPaginaActual(0);
              }}
            />
            <span className="text-slate-400 text-xs mx-1">-</span>
            <input
              type="date"
              className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPaginaActual(0);
              }}
            />

            {(fechaDesde || fechaHasta || filtroEstado !== "TODOS") && (
              <button
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                  setFiltroEstado("TODOS");
                  setPaginaActual(0);
                }}
                className="ml-auto md:ml-2 text-xs text-red-500 hover:text-red-700 font-bold px-4 py-2 bg-red-50 rounded-xl transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="p-6 font-black">Incidente / Folio</th>
              <th className="p-6 font-black">Empresa / Área</th>
              <th className="p-6 font-black text-center">Estado</th>
              <th className="p-6 font-black text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center font-medium animate-pulse text-slate-400"
                >
                  Sincronizando reportes...
                </td>
              </tr>
            ) : reportesPaginados.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center font-medium text-slate-400"
                >
                  No se encontraron reportes con estos filtros.
                </td>
              </tr>
            ) : (
              reportesPaginados.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-5 pl-6">
                    <div className="font-black text-slate-800 tracking-tight">
                      {rep.folio}
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-1.5 uppercase tracking-wider">
                      <Calendar size={12} className="text-blue-500" />{" "}
                      {rep.fechaOcurrido}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-slate-700">
                      {rep.empresaNombre}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {rep.area}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                        rep.estado === "PENDIENTE"
                          ? "bg-amber-100 text-amber-700"
                          : rep.estado === "EN_REVISION"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {rep.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <button
                      onClick={() => abrirModal(rep.id)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm hover:shadow active:scale-95"
                    >
                      {loadingDetalle && reporteSeleccionado?.id === rep.id ? (
                        <Loader2
                          size={18}
                          className="animate-spin text-blue-500"
                        />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPaginasCalculadas > 1 && (
          <div className="p-5 border-t border-slate-100 flex justify-end items-center bg-slate-50/50 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}
                disabled={paginaActual === 0}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                Pág. {paginaActual + 1} de {totalPaginasCalculadas}
              </span>
              <button
                onClick={() =>
                  setPaginaActual((p) =>
                    Math.min(totalPaginasCalculadas - 1, p + 1),
                  )
                }
                disabled={paginaActual >= totalPaginasCalculadas - 1}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-7xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {/* Panel Izquierdo: Información */}
            <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center z-10 bg-white gap-4">
                <div>
                  <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Detalle del Incidente
                  </span>
                  <h2 className="text-2xl font-black text-slate-800 mt-3 flex items-center gap-3">
                    <span className="text-blue-600">
                      {reporteSeleccionado.folio}
                    </span>
                    <span className="text-slate-200 font-light">|</span>
                    <span className="text-slate-600">
                      {reporteSeleccionado.empresaNombre}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setViendoImagenes(!viendoImagenes)}
                  className={`flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm ${
                    viendoImagenes
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100"
                  }`}
                >
                  <ImageIcon size={18} />
                  {viendoImagenes
                    ? "Volver a Detalles"
                    : `Ver Evidencias (${reporteSeleccionado.evidencias?.length || 0})`}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {viendoImagenes ? (
                  <div className="animate-in fade-in duration-300">
                    {reporteSeleccionado.evidencias &&
                    reporteSeleccionado.evidencias.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reporteSeleccionado.evidencias.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-3xl overflow-hidden shadow-md border-4 border-white ring-1 ring-slate-100 aspect-video bg-slate-50"
                          >
                            <img
                              src={img.urlCloudinary}
                              alt="Evidencia"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <a
                              href={img.urlCloudinary}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2 backdrop-blur-sm"
                            >
                              <Eye size={20} /> Ver Original
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <ImageIcon size={48} className="mb-3 text-slate-300" />
                        <p className="font-bold text-slate-500">
                          Sin material fotográfico adjunto
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300 space-y-8">
                    {/* Tarjetas de Datos Rápidos */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Calendar size={14} />{" "}
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Fecha
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 text-lg">
                          {reporteSeleccionado.fechaOcurrido}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Clock size={14} />{" "}
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Turno
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 text-lg">
                          {reporteSeleccionado.turno}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <MapPin size={14} />{" "}
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Área / Lugar
                          </span>
                        </div>
                        <p
                          className="font-bold text-slate-700 truncate text-lg"
                          title={reporteSeleccionado.area}
                        >
                          {reporteSeleccionado.area}
                        </p>
                      </div>
                      <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                          <Shield size={14} />{" "}
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Clasificación
                          </span>
                        </div>
                        <p
                          className="font-black text-blue-700 truncate text-lg"
                          title={reporteSeleccionado.tipoComportamientoNombre}
                        >
                          {reporteSeleccionado.tipoComportamientoNombre}
                        </p>
                      </div>
                    </div>

                    {/* Textos Detallados */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-4">
                          <MessageSquare size={16} className="text-blue-500" />{" "}
                          Descripción de los Hechos
                        </h4>
                        {/* Agregamos whitespace-pre-wrap para respetar los enter y le damos un diseño más limpio */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm text-slate-600 text-sm leading-relaxed h-[220px] overflow-y-auto custom-scrollbar whitespace-pre-wrap font-medium">
                          {reporteSeleccionado.descripcionComportamiento}
                        </div>
                      </div>

                      <div>
                        <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-4">
                          <Shield size={16} className="text-emerald-500" />{" "}
                          Acción Inmediata Tomada
                        </h4>
                        {reporteSeleccionado.medidaContencion ? (
                          <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm text-slate-600 text-sm leading-relaxed h-[220px] overflow-y-auto custom-scrollbar whitespace-pre-wrap font-medium">
                            {reporteSeleccionado.medidaContencion}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-slate-50 border border-slate-100 rounded-[1.5rem] h-[220px] text-sm font-bold text-slate-400">
                            Sin medidas de contención reportadas.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Derecho: Seguimiento y Actualización */}
            <div className="w-full md:w-[420px] bg-slate-900 flex flex-col z-20 border-l border-slate-800 shadow-2xl relative">
              <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0">
                <span className="text-xs font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
                  <Clock size={14} /> Tracking de Estado
                </span>
                <button
                  onClick={cerrarModal}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500 p-2.5 rounded-xl transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Historial */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950">
                {reporteSeleccionado.historial &&
                reporteSeleccionado.historial.length > 0 ? (
                  <div className="space-y-6 pl-3 border-l-2 border-slate-800 ml-2">
                    {reporteSeleccionado.historial.map((hito, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.6)] ring-4 ring-slate-950"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
                          {hito.estadoAnterior}{" "}
                          <ChevronRight size={12} className="text-slate-600" />{" "}
                          <span className="text-blue-400">
                            {hito.estadoNuevo}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold mb-3 mt-1">
                          {new Date(hito.fechaCambio).toLocaleString()} — Por:{" "}
                          {hito.usuarioModificador || "Sistema"}
                        </p>
                        {hito.comentario && (
                          <div className="bg-slate-900 p-4 rounded-2xl text-xs text-slate-300 border border-slate-800 italic leading-relaxed whitespace-pre-wrap font-medium">
                            "{hito.comentario}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                    <Clock size={32} className="opacity-20" />
                    <p className="text-sm font-bold text-center px-4">
                      Reporte recién ingresado.
                      <br />
                      No registra movimientos.
                    </p>
                  </div>
                )}
              </div>

              {/* Zona de Actualización */}
              <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-5 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Actualizar a:
                  </span>
                  {!estadoCambiado && (
                    <span className="text-[10px] text-amber-500 font-bold tracking-wide animate-pulse bg-amber-500/10 px-2 py-1 rounded-md">
                      * Selecciona un nuevo estado
                    </span>
                  )}
                </div>

                <div className="flex bg-slate-950 p-1.5 rounded-2xl w-full border border-slate-800 shadow-inner">
                  {["PENDIENTE", "EN_REVISION", "SOLUCIONADO"].map((est) => (
                    <button
                      key={est}
                      onClick={() => setNuevoEstado(est)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider ${
                        nuevoEstado === est
                          ? est === "PENDIENTE"
                            ? "bg-amber-500 text-slate-900 shadow-md"
                            : est === "EN_REVISION"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-emerald-500 text-slate-900 shadow-md"
                          : "text-slate-500 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {est.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <textarea
                    rows="3"
                    placeholder={
                      estadoCambiado
                        ? "Justifica el cambio de estado (Opcional)..."
                        : "Cambia el estado para comentar."
                    }
                    disabled={!estadoCambiado}
                    className="w-full bg-slate-950 text-sm text-white border border-slate-800 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed resize-none custom-scrollbar font-medium"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  ></textarea>

                  {/* Etiquetas rápidas */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Falta evidencia",
                      "En proceso de evaluación",
                      "Medida correctiva aplicada",
                    ].map((resp, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setComentario((prev) =>
                            prev ? `${prev} ${resp}. ` : `${resp}. `,
                          )
                        }
                        disabled={!estadoCambiado}
                        className="text-[10px] font-bold bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/50"
                      >
                        + {resp}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGuardarCambios}
                  disabled={isUpdating || !comentarioValido || !estadoCambiado}
                  className={`w-full py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-widest mt-4 ${
                    !comentarioValido || !estadoCambiado
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
                  }`}
                >
                  {isUpdating ? "Procesando..." : "Confirmar Actualización"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
