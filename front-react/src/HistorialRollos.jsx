import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg";
import "./css/GestionMoldes.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";

function HistorialRollos() {
  const navigate = useNavigate();

  const [rollos, setRollos] = useState([
    {
      codigo: "R-2025-001",
      metraje: "150 m",
      color: "Azul Marino",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Disponible",
      fecha: "7/09/2025",
    },
    {
      codigo: "R-2025-002",
      metraje: "0 m",
      color: "Celeste",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Agotado",
      fecha: "7/09/2025",
    },
    { codigo: "R-2025-003", 
      metraje: "180 m",
      color: "Amarillo",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Disponible",
      fecha: "7/09/2025",
    },
    { codigo: "R-2025-004",
      metraje: "250 m",
      color: "Azul Marino",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Disponible",
      fecha: "7/09/2025",
    },
    { codigo: "R-2025-005",
      metraje: "180 m",
      color: "Rosa Palo",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Disponible",
      fecha: "7/09/2025",
    },
    { codigo: "R-2025-006",
      metraje: "150 m",
      color: "Coral",
      tipoTela: "Algodón",
      ancho: "1600 mm",
      proveedor: "TextilPeru S.A.C",
      estado: "Disponible",
      fecha: "7/09/2025",
    },
  ]);

  // 🔹 Editar rollo
  const handleEditar = (rollo, index) => {
    Swal.fire({
      title: "Editar Rollo",
      html: `
        <input id="codigo" class="swal2-input" placeholder="Código" value="${rollo.codigo}">
        <input id="metraje" class="swal2-input" placeholder="Metraje" value="${rollo.metraje}">
        <input id="color" class="swal2-input" placeholder="Color" value="${rollo.color}">
        <input id="tipoTela" class="swal2-input" placeholder="Tipo de tela" value="${rollo.tipoTela}">
        <input id="ancho" class="swal2-input" placeholder="Ancho" value="${rollo.ancho}">
        <input id="proveedor" class="swal2-input" placeholder="Proveedor" value="${rollo.proveedor}">
        <select id="estado" class="swal2-input">
          <option value="Disponible" ${rollo.estado === "Disponible" ? "selected" : ""}>Disponible</option>
          <option value="Agotado" ${rollo.estado === "Agotado" ? "selected" : ""}>Agotado</option>
        </select>
        <input id="fecha" type="date" class="swal2-input" value="${rollo.fecha.split('/').reverse().join('-')}">
      `,
      focusConfirm: false,
      confirmButtonText: "Guardar",
      confirmButtonColor: "#2f6d6d",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      preConfirm: () => {
        return {
          codigo: document.getElementById("codigo").value,
          metraje: document.getElementById("metraje").value,
          color: document.getElementById("color").value,
          tipoTela: document.getElementById("tipoTela").value,
          ancho: document.getElementById("ancho").value,
          proveedor: document.getElementById("proveedor").value,
          estado: document.getElementById("estado").value,
          fecha: document.getElementById("fecha").value
            ? new Date(document.getElementById("fecha").value)
                .toLocaleDateString("es-PE")
            : rollo.fecha,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosRollos = [...rollos];
        nuevosRollos[index] = result.value;
        setRollos(nuevosRollos);
        Swal.fire({
          icon: "success",
          title: "¡Registro actualizado!",
          text: "Los datos del rollo se han guardado correctamente.",
          confirmButtonColor: "#2f6d6d",
        });
      }
    });
  };

  // 🔹 Eliminar rollo
  const handleEliminar = (index) => {
    Swal.fire({
      title: "¿Eliminar este rollo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#2f6d6d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosRollos = rollos.filter((_, i) => i !== index);
        setRollos(nuevosRollos);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El rollo ha sido eliminado correctamente.",
          confirmButtonColor: "#2f6d6d",
        });
      }
    });
  };

  return (
    <div className="gestion-container">
      <div className="gestion-rollo-box">
        {/* Sidebar */}
        <div className="gestion-sidebar">
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
            <li className="active">Historial de Rollos</li>
            <li onClick={() => navigate("/ordenproduccion")}>Orden de Producción</li>
            <li>Historial de Optimización</li>
          </ul>

          <button className="gestion-logout" onClick={() => navigate("/")}>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div className="historial-header">
            <h1>Historial de Rollos</h1>
          </div>

          {/* Filtros */}
          <div className="historial-filtros">
            <select className="filtro-select">
              <option>Código</option>
              <option>Color</option>
              <option>Proveedor</option>
            </select>

            <div className="buscar-container">
              <input type="text" placeholder="Buscar" />
              <button>
                <FaSearch />
              </button>
            </div>

            <select className="filtro-select">
              <option>Estado</option>
              <option>Disponible</option>
              <option>Agotado</option>
            </select>

            <button className="btn-filtrar">Filtrar</button>
            <button className="btn-filtrar">Resetear</button>
          </div>

          {/* Tabla */}
          <table className="historial-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Metraje (m)</th>
                <th>Color</th>
                <th>Tipo de tela</th>
                <th>Ancho (mm)</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Fecha Ingreso</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rollos.map((rollo, index) => (
                <tr key={index}>
                  <td>{rollo.codigo}</td>
                  <td>{rollo.metraje}</td>
                  <td>{rollo.color}</td>
                  <td>{rollo.tipoTela}</td>
                  <td>{rollo.ancho}</td>
                  <td>{rollo.proveedor}</td>
                  <td>
                    <span
                      className={`estado-tag ${
                        rollo.estado === "Disponible"
                          ? "estado-disponible"
                          : "estado-agotado"
                      }`}
                    >
                      {rollo.estado}
                    </span>
                  </td>
                  <td>{rollo.fecha}</td>
                  <td className="tabla-acciones">
                    <FaEdit
                      className="icono-ver"
                      title="Editar"
                      onClick={() => handleEditar(rollo, index)}
                    />
                    <FaTrash
                      className="icono-eliminar"
                      title="Eliminar"
                      onClick={() => handleEliminar(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HistorialRollos;
