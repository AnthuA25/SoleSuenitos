import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import logo_blanco from "./images/logo_blanco.svg";
import "./css/GestionMoldes.css";

function HistorialOptimizaciones() {
  const navigate = useNavigate();

  // Estado del usuario y menú
  const user = { nombre: "Sole Sueñitos" };
  const userInicial = user.nombre.charAt(0).toUpperCase();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Estado de optimizaciones (datos simulados)
  const [optimizaciones, setOptimizaciones] = useState([
    {
      id: 1,
      modelo: "Pijama invierno",
      talla: "M",
      fecha: "2025-10-15",
      telaUtilizada: "3.2 m",
      aprovechamiento: "92%",
      desperdicio: "8%",
    },
    {
      id: 2,
      modelo: "Polo clásico",
      talla: "L",
      fecha: "2025-10-10",
      telaUtilizada: "2.7 m",
      aprovechamiento: "88%",
      desperdicio: "12%",
    },
  ]);

  // Cerrar sesión
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que quieres salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente",
          icon: "success",
          confirmButtonColor: "#2f6d6d",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  // Ver detalles
  const handleVerDetalles = (opt) => {
    Swal.fire({
      title: `<strong>Detalles de Optimización</strong>`,
      html: `
        <div style="text-align:left; font-size:15px;">
          <p><b>Modelo:</b> ${opt.modelo}</p>
          <p><b>Talla:</b> ${opt.talla}</p>
          <p><b>Fecha:</b> ${opt.fecha}</p>
          <p><b>Tela utilizada:</b> ${opt.telaUtilizada}</p>
          <p><b>Aprovechamiento:</b> ${opt.aprovechamiento}</p>
          <p><b>Desperdicio:</b> ${opt.desperdicio}</p>
        </div>
      `,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#204e4e",
      background: "#f7f7f7",
    });
  };

  // Eliminar optimización
  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Eliminar optimización?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#204e4e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setOptimizaciones(optimizaciones.filter((o) => o.id !== id));
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "La optimización fue eliminada correctamente.",
          confirmButtonColor: "#204e4e",
        });
      }
    });
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* SIDEBAR */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>
                SOLE <br /> <span>Sueñitos</span>
              </h2>
            </div>
          </div>

          <ul>
            <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
            <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
            <li onClick={() => navigate("/ordenproduccion")}>Orden de Producción</li>
            <li>
              Historial de Optimización
            </li>
          </ul>
        </div>

        {/* CONTENIDO */}
        <div className="gestion-content">
          {/* HEADER SUPERIOR CON USUARIO */}
          <div className="gestion-header">
            <div className="user-menu-container">
              <div
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-circle">{userInicial}</div>
                <span className="user-name">{user.nombre}</span>
              </div>
              {showUserMenu && (
                <div className="user-dropdown_sesion">
                  <button
                    className="botoncerrarsesion"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TÍTULO */}
          <h1>Reportes de Optimización</h1>
          <p style={{ color: "#666", marginBottom: 15 }}>
            Revisa los marcadores generados y gestiona tus reportes.
          </p>

          {/* TABLA */}
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 20,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            {optimizaciones.length === 0 ? (
              <p
                style={{
                  color: "#777",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                No hay optimizaciones registradas aún.
              </p>
            ) : (
              <div className="tabla-scroll">
                <table className="orden-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Modelo</th>
                      <th>Talla</th>
                      <th>Fecha</th>
                      <th>Aprovechamiento</th>
                      <th>Desperdicio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizaciones.map((opt) => (
                      <tr key={opt.id}>
                        <td>{opt.id}</td>
                        <td>{opt.modelo}</td>
                        <td>{opt.talla}</td>
                        <td>{opt.fecha}</td>
                        <td>{opt.aprovechamiento}</td>
                        <td>{opt.desperdicio}</td>
                        <td
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="elegir-btn"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => handleVerDetalles(opt)}
                          >
                            Ver
                          </button>
                          <button
                            className="cancelar-btn"
                            style={{
                              padding: "6px 12px",
                              background: "#c0392b",
                              border: "none",
                            }}
                            onClick={() => handleEliminar(opt.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorialOptimizaciones;
