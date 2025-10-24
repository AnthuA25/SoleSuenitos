// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import GestionMoldes from "./GestionMoldes.jsx";
import HistorialMoldes from "./HistorialMoldes.jsx";
import RecepcionRollos from "./RecepcionRollos.jsx";
import HistorialRollos from "./HistorialRollos.jsx";
import OrdenProduccion from "./OrdenProduccion.jsx";
import './css/Global.css' 
import HistorialOptimizaciones from "./HistorialOptimizaciones.jsx";



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
        <Route path="/optimizacion" element={<Optimizacion />} />   

      {/*vista de Historial de Optimizacion*/}
        <Route path="/historialopti" element={<HistorialOptimizaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
