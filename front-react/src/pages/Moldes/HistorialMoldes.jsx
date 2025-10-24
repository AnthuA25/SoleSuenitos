import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import { FaEye, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";
import {
  listarMoldes,
  eliminarMolde,
  obtenerMoldePorId,
  buscarMoldes,
} from "../../api/moldeService";

function HistorialMoldes() {
  const navigate = useNavigate();
  const [moldes, setMoldes] = useState([]);
  const [filtro, setFiltro] = useState("codigoMolde");
  const [busqueda, setBusqueda] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = { nombre: "Sole Sueñitos" };
  const userInicial = user.nombre.charAt(0).toUpperCase();

  // 🔹 Cargar moldes al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listarMoldes();
        setMoldes(data);
      } catch (error) {
        Swal.fire({
          title: "Error al cargar moldes",
          text: error.message || "No se pudieron obtener los moldes.",
          icon: "error",
          confirmButtonColor: "#2f6d6d",
        });
      }
    };
    fetchData();
  }, []);

  // 🔍 Buscar moldes en el backend
  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      const data = await listarMoldes();
      setMoldes(data);
      return;
    }

    try {
      const resultados = await buscarMoldes(filtro, busqueda);
      setMoldes(resultados);
    } catch (error) {
      Swal.fire({
        title: "Sin resultados",
        text: error.message || "No se encontraron moldes con ese criterio.",
        icon: "info",
        confirmButtonColor: "#2f6d6d",
      });
      setMoldes([]);
    }
  };

  // 👁️ Ver detalles
  const handleVer = async (molde) => {
    try {
      const detalle = await obtenerMoldePorId(molde.idMolde);

      Swal.fire({
        title: "Detalles del molde",
        html: `
          <p><strong>Código:</strong> ${detalle.codigoMolde}</p>
          <p><strong>Nombre:</strong> ${detalle.nombreMolde}</p>
          <p><strong>Versión:</strong> ${detalle.versionMolde}</p>
          <p><strong>Fecha:</strong> ${new Date(
            detalle.fechaSubida
          ).toLocaleDateString()}</p>
          <p><strong>Archivo:</strong> ${detalle.nombreArchivoOriginal}</p>
        `,
        confirmButtonColor: "#2f6d6d",
      });
    } catch (error) {
      Swal.fire({
        title: "Error al obtener detalles",
        text: error.message || "No se pudieron cargar los detalles del molde.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  // 🗑️ Eliminar molde
  const handleEliminar = async (idMolde) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar molde?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#2f6d6d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await eliminarMolde(idMolde);
      setMoldes((prev) => prev.filter((m) => m.idMolde !== idMolde));
      Swal.fire({
        title: "Eliminado",
        text: "El molde ha sido eliminado correctamente.",
        icon: "success",
        confirmButtonColor: "#2f6d6d",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error al eliminar",
        text: error.message || "No se pudo eliminar el molde.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  const handleRegistrar = () => navigate("/moldes");

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
            <li onClick={() => navigate("/recepcionrollos")}>
              Recepción de Rollos
            </li>
            <li onClick={() => navigate("/historialrollos")}>
              Historial de Rollos
            </li>
            <li onClick={() => navigate("/ordenproduccion")}>
              Orden de Producción
            </li>
            <li onClick={() => navigate("/historialopti")}>
              Historial de Optimización
            </li>
          </ul>
        </div>

        {/* Contenido principal */}
        <div className="gestion-content">
          <div className="historial-header">
            <h1>Historial de Moldes</h1>
            <button className="btn-registrar" onClick={handleRegistrar}>
              <FaPlus /> Registrar molde
            </button>
          </div>

          {/* 🔍 Filtros */}
          <div className="historial-filtros">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="filtro-select"
              style={{ backgroundColor: "#e0f7fa", color: "black" }}
            >
              <option value="codigoMolde">Código</option>
              <option value="nombreMolde">Nombre</option>
              <option value="versionMolde">Versión</option>
            </select>

            <div
              className="buscar-container"
              style={{ backgroundColor: "#e0f7fa" }}
            >
              <input
                type="text"
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                style={{ backgroundColor: "#e0f7fa", color: "black" }}
              />
              <button onClick={handleBuscar}>
                <FaSearch />
              </button>
            </div>

            {/* 🔁 Resetear */}
            <button
              className="btn-filtrar"
              onClick={async () => {
                try {
                  setBusqueda("");
                  const data = await listarMoldes(); // 🔁 vuelve a traer todos los moldes
                  setMoldes(data);
                } catch (error) {
                  Swal.fire({
                    title: "Error al recargar moldes",
                    text: error.message || "No se pudieron obtener los moldes.",
                    icon: "error",
                    confirmButtonColor: "#2f6d6d",
                  });
                }
              }}
              style={{
                backgroundColor: "#fff",
                color: "black",
                border: "1px solid #0f836fff",
              }}
            >
              Resetear
            </button>
          </div>

          {/* 📋 Tabla */}
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
              {moldes.length > 0 ? (
                moldes.map((m) => (
                  <tr key={m.idMolde}>
                    <td style={{ color: "gray" }}>{m.codigoMolde}</td>
                    <td style={{ color: "gray" }}>{m.nombreMolde}</td>
                    <td style={{ color: "gray" }}>{m.versionMolde}</td>
                    <td style={{ color: "gray" }}>
                      {new Date(m.fechaSubida).toLocaleDateString()}
                    </td>
                    <td className="tabla-acciones" style={{ color: "gray" }}>
                      <FaEye
                        className="icono-ver"
                        title="Ver detalles"
                        onClick={() => handleVer(m)}
                      />
                      <FaTrashAlt
                        className="icono-eliminar"
                        title="Eliminar"
                        onClick={() => handleEliminar(m.idMolde)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", color: "gray" }}
                  >
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
