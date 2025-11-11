import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import UserHeader from "../../components/UserHeader";
import SidebarMenu from "../../components/SliderMenu";
import {
  agregarComentario,
  listarComentarios,
  listarOrdenesDisponibles,
} from "../../api/ordenesDisponibles";
import Swal from "sweetalert2";

function OrdenesDisponibles() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentariosOrden, setComentariosOrden] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const data = await listarOrdenesDisponibles();
        setOrdenes(data);
      } catch (error) {
        Swal.fire({
          title: "Error al cargar órdenes",
          text:
            error.message || "No se pudieron obtener las órdenes disponibles.",
          icon: "error",
          confirmButtonColor: "#2f6d6d",
        });
      }
    };
    cargarOrdenes();
  }, []);

  const abrirModal = async (orden) => {
    setOrdenSeleccionada(orden);
    try {
      const comentarios = await listarComentarios(orden.idOp);
      setComentariosOrden(comentarios);
    } catch {
      setComentariosOrden([]);
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setNuevoComentario("");
    setOrdenSeleccionada(null);
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      await agregarComentario({
        idOp: ordenSeleccionada.idOp,
        mensaje: nuevoComentario,
      });

      Swal.fire("Éxito", "Comentario agregado correctamente", "success");

      const comentarios = await listarComentarios(ordenSeleccionada.idOp);
      setComentariosOrden(comentarios);
      setNuevoComentario("");
    } catch (error) {
      Swal.fire({
        title: "Error al agregar comentario",
        text: error.message || "No se pudo agregar el comentario.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  const handleVerOptimizaciones = (idOp) => {
    navigate(`/historialoptiope/${idOp}`);
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div
          className="gestion-sidebar"
          style={{ justifyContent: "flex-start" }}
        >
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>
                SOLE
                <br />
                <span>Sueñitos</span>
              </h2>
            </div>
          </div>

          <ul style={{ marginTop: "20px" }}>
            <SidebarMenu />
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div className="gestion-header">
            <UserHeader />
          </div>

          <h1>Órdenes de Producción disponibles</h1>
          <p style={{ color: "#666", marginBottom: 20 }}>
            Seleccione una orden para ver las optimizaciones disponibles
          </p>

          <div
            style={{
              overflowX: "auto",
              background: "white",
              borderRadius: 10,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <table
              className="historial-tabla"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead
                style={{
                  backgroundColor: "#2f6d6d",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <tr>
                  <th style={{ padding: "12px 10px" }}>Código</th>
                  <th style={{ padding: "12px 10px" }}>Producto</th>
                  <th style={{ padding: "12px 10px" }}>Estado</th>
                  <th style={{ padding: "12px 10px" }}>Fecha</th>
                  <th style={{ padding: "12px 10px" }}>Comentarios</th>
                  <th style={{ padding: "12px 10px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12, color: "#222", fontWeight: 600 }}>
                      {orden.codigoOp}
                    </td>
                    <td style={{ padding: 12, color: "#222" }}>
                      {orden.modelo}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          background:
                            orden.estado === "Listo"
                              ? "#d4edda"
                              : orden.estado === "En proceso"
                              ? "#fff3cd"
                              : "#f8d7da",
                          color:
                            orden.estado === "Listo"
                              ? "#155724"
                              : orden.estado === "En proceso"
                              ? "#856404"
                              : "#721c24",
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td style={{ padding: 12, color: "#222" }}>
                      {orden.fechaCreacion
                        ? new Date(orden.fechaCreacion).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => abrirModal(orden)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2f6d6d",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        [ Ver ({orden.comentarios?.length || orden.Comentarios?.length || 0}) ]
                      </button>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleVerOptimizaciones(orden.idOp)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2f6d6d",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        [ Ver optimizaciones ]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Comentarios */}
          {mostrarModal && ordenSeleccionada && (
            <div
              onClick={cerrarModal}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3000,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 600,
                  maxWidth: "95%",
                  background: "#fff",
                  borderRadius: 10,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  position: "relative",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
              >
                <button
                  onClick={cerrarModal}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 24,
                    color: "#666",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ⊗
                </button>

                <h3 style={{ marginBottom: 20, color: "black", fontSize: 18 }}>
                  Comentarios - {ordenSeleccionada.modelo}
                </h3>

                <div
                  style={{
                    marginBottom: 20,
                    maxHeight: 300,
                    overflowY: "auto",
                    background: "#f9f9f9",
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  {comentariosOrden.length === 0 ? (
                    <p
                      style={{
                        color: "#999",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      No hay comentarios aún
                    </p>
                  ) : (
                    comentariosOrden.map((com, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 12,
                          padding: 12,
                          background: "white",
                          borderRadius: 6,
                          borderLeft: "3px solid #2f6d6d",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#2f6d6d",
                            marginBottom: 4,
                            fontSize: 14,
                          }}
                        >
                          {com.usuario}:
                        </div>
                        <div
                          style={{
                            color: "#333",
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          {com.mensaje}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribir comentario..."
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      fontSize: 14,
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={cerrarModal}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleAgregarComentario}
                    disabled={!nuevoComentario.trim()}
                    style={{
                      background: nuevoComentario.trim() ? "#2f6d6d" : "#ccc",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: 6,
                      cursor: nuevoComentario.trim()
                        ? "pointer"
                        : "not-allowed",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdenesDisponibles;
