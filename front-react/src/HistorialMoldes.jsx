import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg"; 
import "./css/GestionMoldes.css";
import { FaEye, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";

function HistorialMoldes() {
  const navigate = useNavigate();

  // Datos simulados
  const [moldes, setMoldes] = useState([
    { codigo: "M-001", nombre: "Molde Polo Básico", version: "v1", fecha: "03/09/2025" },
    { codigo: "M-002", nombre: "Molde Pantalón", version: "v1", fecha: "06/09/2025" },
  ]);

  const [filtro, setFiltro] = useState("codigo");
  const [busqueda, setBusqueda] = useState("");

  // Filtrado simple
  const moldesFiltrados = moldes.filter((molde) =>
    molde[filtro].toLowerCase().includes(busqueda.toLowerCase())
  );

  // Redirección
  const handleRegistrar = () => navigate("/moldes");

  // Ver detalles
  const handleVer = (molde) => {
    Swal.fire({
      title: "Detalles del molde",
      html: `
        <p><strong>Código:</strong> ${molde.codigo}</p>
        <p><strong>Nombre:</strong> ${molde.nombre}</p>
        <p><strong>Versión:</strong> ${molde.version}</p>
        <p><strong>Fecha:</strong> ${molde.fecha}</p>
      `,
      confirmButtonColor: "#2f6d6d",
      confirmButtonText: "Cerrar",
    });
  };

  // Eliminar
  const handleEliminar = (codigo) => {
    Swal.fire({
      title: "¿Eliminar molde?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#2f6d6d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setMoldes(moldes.filter((m) => m.codigo !== codigo));
        Swal.fire({
          title: "Eliminado",
          text: "El molde ha sido eliminado correctamente",
          icon: "success",
          confirmButtonColor: "#2f6d6d",
        });
      }
    });
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
            <li className="active">Historial de Moldes</li>
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
            <li onClick={() => navigate("/ordenproduccion")}>Orden de Produccion</li>
            <li>Historial de Optimización</li>
          </ul>

          <button className="gestion-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div className="historial-header">
            <h1>Historial de Moldes</h1>
            <button className="btn-registrar" onClick={handleRegistrar}>
              <FaPlus /> Registrar molde
            </button>
          </div>

          {/* Filtros */}
          <div className="historial-filtros">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="codigo">Código</option>
              <option value="nombre">Nombre</option>
              <option value="version">Versión</option>
              <option value="fecha">Fecha</option>
            </select>
            <div className="buscar-container">
              <input
                type="text"
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button><FaSearch /></button>
            </div>
            <button
              className="btn-filtrar"
              onClick={() => setBusqueda("")}
            >
              Resetear
            </button>
          </div>

          {/* Tabla */}
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {moldesFiltrados.length > 0 ? (
                moldesFiltrados.map((molde) => (
                  <tr key={molde.codigo}>
                    <td>{molde.codigo}</td>
                    <td>{molde.nombre}</td>
                    <td>{molde.version}</td>
                    <td>{molde.fecha}</td>
                    <td className="tabla-acciones">
                      <FaEye
                        className="icono-ver"
                        title="Ver detalles"
                        onClick={() => handleVer(molde)}
                      />
                      <FaTrashAlt
                        className="icono-eliminar"
                        title="Eliminar"
                        onClick={() => handleEliminar(molde.codigo)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No se encontraron moldes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HistorialMoldes;
