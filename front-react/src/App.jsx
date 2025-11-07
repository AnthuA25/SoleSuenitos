import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login/Login.jsx";
import GestionMoldes from "./pages/Moldes/GestionMoldes.jsx";
import HistorialMoldes from "./pages/Moldes/HistorialMoldes.jsx";
import RecepcionRollos from "./pages/Rollos/RecepcionRollos.jsx";
import HistorialRollos from "./pages/Rollos/HistorialRollos.jsx";
import OrdenProduccion from "./pages/Optimizacion/OrdenProduccion.jsx";
import HistorialOptimizaciones from "./pages/Optimizacion/HistorialOptimizaciones.jsx";

// Operario de Corte
import AprobacionMarcadores from "./pages/OperariodeCorte/AprobacionMarcadores.jsx";
import MarcadorDigitalV1 from "./pages/OperariodeCorte/MarcadorDigitalV1.jsx";
import MarcadorDigitalV2 from "./pages/OperariodeCorte/MarcadorDigitalV2.jsx";
import HistorialOptimizacionesOperario from "./pages/OperariodeCorte/HistorialOptimizacionesope.jsx";

// Inspector de Calidad
import HistorialInspeccion from "./pages/Inspector Calidad/HistorialInspeccion.jsx";
import RegistrarInspeccion from "./pages/Inspector Calidad/RegistrarInspeccion.jsx";

import "./css/Global.css";
import "./css/GestionMoldes.css";

function App() {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.rol && usuario?.logueado) {
      setRol(usuario.rol);
    } else {
      setRol(null);
    }
  } catch (error) {
    console.error("Error al cargar usuario:", error);
    localStorage.removeItem("usuario");
  } finally {
    setLoading(false);
  }
}, []);


  // Mostrar loading mientras verifica sesión
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar solo login
  if (!rol) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PARA ADMIN / ENCARGADO DE LOGÍSTICA */}
        {rol === "admin" && (
          <>
            <Route path="/moldes" element={<GestionMoldes />} />
            <Route path="/historialmoldes" element={<HistorialMoldes />} />
            <Route path="/recepcionrollos" element={<RecepcionRollos />} />
            <Route path="/historialrollos" element={<HistorialRollos />} />
            <Route path="/ordenproduccion" element={<OrdenProduccion />} />
            <Route path="/historialopti" element={<HistorialOptimizaciones />} />
            
            {/* Redirigir / al dashboard principal */}
            <Route path="/" element={<Navigate to="/moldes" replace />} />
          </>
        )}

        {/* RUTAS PARA OPERARIO DE CORTE */}
        {rol === "operario" && (
          <>
            <Route path="/aprobacionmarcadores" element={<AprobacionMarcadores />} />
            
            {/* Rutas separadas para V1 y V2 */}
            <Route path="/marcadordigitalv1" element={<MarcadorDigitalV1 />} />
            <Route path="/marcadordigitalv2" element={<MarcadorDigitalV2 />} />
            
            <Route path="/historialoptioperario" element={<HistorialOptimizacionesOperario />} />
            
            {/* Redirigir / al dashboard principal */}
            <Route path="/" element={<Navigate to="/aprobacionmarcadores" replace />} />
          </>
        )}

        {/* RUTAS PARA INSPECTOR DE CALIDAD */}
        {rol === "calidad" && (
          <>           
            {/* Rutas separadas para V1 y V2 */}
            <Route path="/historialinspeccion" element={<HistorialInspeccion/>} />
            <Route path="/registrarinspeccion" element={<RegistrarInspeccion />} />
            
            {/* Redirigir / al dashboard principal */}
            <Route path="/" element={<Navigate to="/registrarinspeccion" replace />} />
          </>
        )}

        {/* Ruta catch-all - redirige según rol */}
        <Route
          path="*"
          element={
            <Navigate 
              to={rol === "admin" ? "/moldes" : "/aprobacionmarcadores"} 
              replace 
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;