// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import GestionMoldes from "./pages/Moldes/GestionMoldes.jsx";
import HistorialMoldes from "./pages/Moldes/HistorialMoldes.jsx";
import RecepcionRollos from "./pages/Rollos/RecepcionRollos.jsx";
import HistorialRollos from "./pages/Rollos/HistorialRollos.jsx";
import OrdenProduccion from "./pages/Optimizacion/OrdenProduccion.jsx";
import HistorialOptimizaciones from "./pages/Optimizacion/HistorialOptimizaciones.jsx";
import './css/Global.css' 



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

      {/*vista de Optimizacionv1*/}
        {/* <Route path="/optimizacion" element={<Optimizacion />} />    */}

      {/*vista de Historial de Optimizacion*/}
        <Route path="/historialopti" element={<HistorialOptimizaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
