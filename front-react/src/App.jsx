// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login.jsx";
import GestionMoldes from "./pages/Moldes/GestionMoldes.jsx";
import HistorialMoldes from "./pages/Moldes/HistorialMoldes.jsx";
import RecepcionRollos from "./pages/Rollos/RecepcionRollos.jsx";
import HistorialRollos from "./pages/Rollos/HistorialRollos.jsx";
import OrdenProduccion from "./pages/Optimizacion/OrdenProduccion.jsx";
import HistorialOptimizaciones from "./pages/Optimizacion/HistorialOptimizaciones.jsx";

// Operario de Corte
import OrdenesDisponibles from "./pages/OperariodeCorte/OrdenesDisponiblesope.jsx";
import MarcadorDigital from "./pages/OperariodeCorte/MarcadorDigital.jsx";
import HistorialOptimizacionesOperario from "./pages/OperariodeCorte/HistorialOptimizacionesope.jsx";

// Inspector de Calidad
import HistorialInspeccion from "./pages/InspectorCalidad/HistorialInspeccion.jsx";
import RegistrarInspeccion from "./pages/InspectorCalidad/RegistrarInspeccion.jsx";
import "./css/Global.css";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal = login */}
        <Route path="/" element={<Login />} />

        {/* vista de gestion de moldes*/}
        <Route path="/moldes" element={<GestionMoldes />} />

        {/*vista de historial de moldes*/}
        <Route path="/historialmoldes" element={<HistorialMoldes />} />

        {/*vista de recepcion de Rollos*/}
        <Route path="/recepcionrollos" element={<RecepcionRollos />} />

        {/*vista de Historial de Rollos*/}
        <Route path="/historialrollos" element={<HistorialRollos />} />

        {/*vista de Orden de Produccion*/}
        <Route path="/ordenproduccion" element={<OrdenProduccion />} />

        {/*vista de Historial de Optimizacion*/}
        <Route path="/historialopti" element={<HistorialOptimizaciones />} />

        <Route path="/OrdenesDisponiblesope" element={<OrdenesDisponibles />} />

        {/*vista de Marcador Digital V1*/}
        <Route
          path="/marcador/:codigo/:version"
          element={<MarcadorDigital />}
        />

        {/*vista de Marcador Digital V2*/}
        <Route
          path="/marcadordigitalv1"
          element={<Navigate to="/marcador/v1" replace />}
        />
        <Route
          path="/marcadordigitalv2"
          element={<Navigate to="/marcador/v2" replace />}
        />

        {/*vista de Historial de Optimizacion Operario de Corte*/}
        <Route
          path="/historialoptiope/:codigo"
          element={<HistorialOptimizacionesOperario />}
        />

        {/*vista de Historial de Inspeccion*/}
        <Route path="/historialinspeccion" element={<HistorialInspeccion />} />

        {/*vista de Registrar Inspeccion*/}
        <Route path="/registrarinspeccion" element={<RegistrarInspeccion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
