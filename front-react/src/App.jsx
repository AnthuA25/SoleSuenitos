import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import GestionMoldes from "./GestionMoldes.jsx";
import './css/Global.css' 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal = login */}
        <Route path="/" element={<Login />} />

        {/* vista de gestion de moldes*/}
        <Route path="/moldes" element={<GestionMoldes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;