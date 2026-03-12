import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom"; // <-- Agregamos NavLink
import { useAuthStore } from "../../store/authStore";
import { LogOut, ShieldCheck, LayoutDashboard, FileText } from "lucide-react"; // <-- Más iconos

export default function TopbarCliente() {
  const navigate = useNavigate();
  const { user, setLogout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    const tokenPublico = user?.empresaToken;
    if (tokenPublico) {
      navigate(`/reportar/${tokenPublico}`);
      setTimeout(() => setLogout(), 100); 
    } else {
      setLogout();
      navigate("/cliente/login");
    }
  };

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        
        {/* Lado izquierdo: Logo */}
        <div className="flex items-center gap-3 w-1/4">
          <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">Portal SST</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
              {user?.empresaNombre || "Empresa Cliente"}
            </p>
          </div>
        </div>

        {/* CENTRO: Menú de Navegación */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex-1 justify-center max-w-sm">
          <NavLink
            to="/cliente/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`
            }
          >
            <LayoutDashboard size={16} /> Resumen
          </NavLink>
          <NavLink
            to="/cliente/reportes"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`
            }
          >
            <FileText size={16} /> Mis Reportes
          </NavLink>
        </div>

        {/* Lado derecho: Usuario y Salir */}
        <div className="flex items-center gap-6 w-1/4 justify-end">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-slate-700">{user?.nombre}</p>
            <p className="text-xs text-slate-500">Supervisor</p>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Salida (se mantiene igual) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} className="ml-1" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Cerrar Sesión?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Saldrás del panel de estadísticas y volverás a la vista pública para generar reportes.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmLogout} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}