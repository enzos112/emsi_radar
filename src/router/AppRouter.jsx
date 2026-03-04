import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import FormularioReportePage from "../pages/publico/FormularioReportePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        //Rutas
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reportar" element={<FormularioReportePage />} />
      </Routes>
    </BrowserRouter>
  );
}
