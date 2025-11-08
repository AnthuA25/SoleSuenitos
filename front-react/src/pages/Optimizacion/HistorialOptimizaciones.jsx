import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import UserHeader from "../../components/UserHeader";
import {
  eliminarOrdenProduccion,
  listarOptimizaciones,
  obtenerDetalleOptimizacion,
} from "../../api/ordenProducciónService";
import SidebarMenu from "../../components/SliderMenu";

function HistorialOptimizaciones() {
  const [optimizaciones, setOptimizaciones] = useState([]);

  useEffect(() => {
    cargarOptimizaciones();
  }, []);

  const cargarOptimizaciones = async () => {
    try {
      const data = await listarOptimizaciones();
      setOptimizaciones(data);
    } catch (error) {
      Swal.fire({
        title: "Error al cargar optimizaciones",
        text: error.message || "No se pudieron obtener las optimizaciones.",
        icon: "error",
          confirmButtonColor: "#2f6d6d",
      });
    }
  };

  // Ver detalles
  const handleVerDetalles = async (opt) => {
    try {
      const detalle = await obtenerDetalleOptimizacion(opt.idOpt || opt.IdOpt);
      Swal.fire({
        title: `<strong>Detalles de Optimización</strong>`,
        html: `
          <div style="text-align:left; font-size:15px;">
            <p><b>Código OP:</b> ${detalle.codigoOp ?? "-"}</p>
            <p><b>Modelo:</b> ${detalle.modelo}</p>
            <p><b>Talla:</b> ${detalle.talla}</p>
            <p><b>Versión:</b> ${detalle.nombreVersion}</p>
            <p><b>Tela utilizada:</b> ${
              detalle.telaUtilizadaM?.toFixed(2) ?? "-"
            } m</p>
          <p><b>Aprovechamiento:</b> ${
            detalle.aprovechamientoPorcent?.toFixed(2) ?? "-"
          } %</p>
          <p><b>Desperdicio:</b> ${
            detalle.desperdicioM?.toFixed(2) ?? "-"
          } %</p>
            <p><b>Fecha:</b> ${new Date(
              detalle.FechaGeneracion
            ).toLocaleString()}</p>
          </div>
        `,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#204e4e",
      });
    } catch {
      Swal.fire("Error", "No se pudieron obtener los detalles.", "error");
    }
  };

  // Eliminar optimización
  const handleEliminar = async (idOpt) => {
    Swal.fire({
      title: "¿Eliminar optimización?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#204e4e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarOrdenProduccion(idOpt); 

          setOptimizaciones((prev) => prev.filter((o) => o.idOpt !== idOpt));

          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "La optimización fue eliminada correctamente.",
            confirmButtonColor: "#204e4e",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              "No se pudo eliminar la optimización.",
            confirmButtonColor: "#204e4e",
          });
        }
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

          <SidebarMenu />
        </div>

        {/* CONTENIDO */}
        <div className="gestion-content">
          {/* HEADER SUPERIOR CON USUARIO */}
          <div className="gestion-header">
            {/* HEADER superior */}
            <div className="gestion-header">
              <UserHeader nombreUsuario="Sole Sueñitos" />
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
                      <th>Código</th>
                      <th>Modelo</th>
                      <th>Talla</th>
                      <th>Fecha</th>
                      <th>Versión</th>
                      <th>Aprovechamiento</th>
                      <th>Desperdicio</th>
                      <th>Tela Utilizada</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizaciones.map((opt) => (
                      <tr key={opt.idOpt}>
                        <td>{opt.codigoOp}</td>
                        <td>{opt.modelo}</td>
                        <td>{opt.talla}</td>
                        <td>{new Date(opt.fecha).toLocaleDateString()}</td>
                        <td>{opt.nombreVersion || "-"}</td>
                        <td>
                          {opt.aprovechamientoPorcent?.toFixed(2) ?? "-"} %
                        </td>
                        <td>{opt.desperdicioM?.toFixed(2) ?? "-"} %</td>
                        <td>{opt.telaUtilizadaM?.toFixed(2) ?? "-"} m</td>
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
                              color: "#fff",
                            }}
                            onClick={() => handleEliminar(opt.idOpt)}
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
