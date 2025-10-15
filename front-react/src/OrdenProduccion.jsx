import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg";
import "./css/GestionMoldes.css";

function OrdenProduccion() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [modelo, setModelo] = useState("");
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [rollos, setRollos] = useState(["R-2025-002", "R-2025-001"]);

  const moldes = [
    { pieza: "Delantero", dimensiones: "600 × 800", area: 4800, repeticiones: 1, orientacion: "Recto hilo" },
    { pieza: "Espalda", dimensiones: "600 × 800", area: 4800, repeticiones: 1, orientacion: "Recto hilo" },
    { pieza: "Manga", dimensiones: "400 × 600", area: 2400, repeticiones: 2, orientacion: "Libre" },
    { pieza: "Cuello", dimensiones: "100 × 400", area: 400, repeticiones: 1, orientacion: "Restringido" },
  ];

  // 🔹 Cerrar sesión
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) navigate("/");
    });
  };

  // 🔹 Optimización de corte
  const handleOptimizarCorte = () => {
    Swal.fire({
      title: "Corte optimizado",
      text: "Se generó la optimización del corte correctamente.",
      icon: "success",
      confirmButtonColor: "#2f6d6d",
    });
  };

  // 🔹 Click en “Subir molde”
  const handleSubirMoldeClick = () => {
    fileInputRef.current.click(); // abre el explorador de archivos
  };

  // 🔹 Manejo del archivo seleccionado
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension !== "dxl") {
      Swal.fire({
        icon: "error",
        title: "Formato no permitido",
        text: "Solo se aceptan archivos con extensión .dxl",
        confirmButtonColor: "#d33",
      });
      event.target.value = ""; // limpia el input
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Archivo cargado",
      text: `Se seleccionó el archivo: ${file.name}`,
      confirmButtonColor: "#2f6d6d",
    });
  };

  return (
    <div className="orden-container">
      <div className="orden-box">
        {/* Sidebar */}
        <div className="orden-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE</h2>
              <span>Sueñitos</span>
            </div>
          </div>
          <ul>
            <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
            <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
            <li className="active">Orden de Producción</li>
            <li>Historial de Optimización</li>
          </ul>
          <button className="orden-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido */}
        <div className="orden-content">
          <h1>Orden de Producción</h1>

          <div className="orden-inputs">
            <div className="input-group">
              <label>Modelo</label>
              <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Talla</label>
              <input type="text" value={talla} onChange={(e) => setTalla(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Cantidad</label>
              <input type="text" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Rollos seleccionados</label>
              <div className="rollos-container">
                {rollos.map((rollo, index) => (
                  <span key={index} className="rollo-tag">{rollo}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="orden-buttons">
            <button className="subir-btn" onClick={handleSubirMoldeClick}>
              📤 Subir molde
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".dxl"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button className="elegir-btn">Elegir molde</button>
          </div>

          {/* Tabla de moldes */}
          <table className="orden-table">
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Dimensiones</th>
                <th>Área (cm)</th>
                <th>Repeticiones</th>
                <th>Orientación</th>
              </tr>
            </thead>
            <tbody>
              {moldes.map((molde, index) => (
                <tr key={index}>
                  <td>{molde.pieza}</td>
                  <td>{molde.dimensiones}</td>
                  <td>{molde.area}</td>
                  <td>{molde.repeticiones}</td>
                  <td>{molde.orientacion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="orden-actions">
            <button className="cancelar-btn">Cancelar</button>
            <button className="optimizar-btn" onClick={handleOptimizarCorte}>
              Optimizar Corte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdenProduccion;

