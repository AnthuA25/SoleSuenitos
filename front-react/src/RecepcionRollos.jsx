import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg";
import "./css/GestionMoldes.css";

function RecepcionRollos() {
  const navigate = useNavigate();
  const [tipoTela, setTipoTela] = useState("");
  const [ancho, setAncho] = useState("");
  const [color, setColor] = useState("");
  const [metraje, setMetraje] = useState("");
  const [proveedor, setProveedor] = useState("");

  // Manejo del formulario
  const handleGuardar = () => {
    if (!tipoTela || !ancho || !color || !metraje || !proveedor) {
      Swal.fire({
        title: "¡Error!",
        text: "Por favor complete todos los campos",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    } else {
      Swal.fire({
        title: "Registro Guardado",
        text: "La recepción del rollo se guardó correctamente.",
        icon: "success",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) navigate("/");
    });
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE</h2> <span>Sueñitos</span>
            </div>
          </div>

          <ul>
            <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
            <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
            <li className="active">Recepción de Rollos</li>
            <li>Historial de Rollos</li>
            <li>Orden de Producción</li>
            <li>Historial de Optimización</li>
          </ul>

          <button className="gestion-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <h1>Recepción de Rollos</h1>
          <h3>Registro de rollo de tela</h3>

          <form className="gestion-form">
            {/* Tipo de tela */}
            <label>Tipo de tela</label>
            <input
              type="text"
              value={tipoTela}
              onChange={(e) => setTipoTela(e.target.value)}
              placeholder="Tipo de tela"
            />
            <div className="gestion-ancho-color">
                <div>
                    <label>Ancho (mm)</label>
                    <input
                    type="text"
                    value={ancho}
                    onChange={(e) => setAncho(e.target.value)}
                    placeholder="Ancho"
                    />
                </div>
                <div>
                    <label>Color</label>
                    <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Color"
                    />
                </div>
            </div>

            {/* Metraje */}
            <label>Metraje (m)</label>
            <input
              type="text"
              value={metraje}
              onChange={(e) => setMetraje(e.target.value)}
              placeholder="Metraje"
            />

            {/* Proveedor */}
            <label>Proveedor</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Proveedor"
            />

            <div className="gestion-form-buttons">
              <button
                className="gestion-cancel-button"
                onClick={(e) => {
                  e.preventDefault();
                  // Limpiar campos
                  setTipoTela("");
                  setAncho("");
                  setColor("");
                  setMetraje("");
                  setProveedor("");
                }}
              >
                Cancelar
              </button>
              <button className="gestion-save-button" onClick={handleGuardar}>
                Guardar
              </button>
            </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default RecepcionRollos;
