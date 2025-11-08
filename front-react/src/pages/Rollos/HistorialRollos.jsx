// src/pages/HistorialRollos.jsx
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import UserHeader from "../../components/UserHeader";
import { FaEye, FaRegEdit, FaSearch, FaTrashAlt } from "react-icons/fa";
import {
  listarRollos,
  editarRollo,
  eliminarRollo,
  filtrarRollos,
  obtenerRolloPorId,
} from "../../api/rolloService";
import SidebarMenu from "../../components/SliderMenu";

function HistorialRollos() {
  // const navigate = useNavigate();
  const [rollos, setRollos] = useState([]);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("codigo");
  const [filtroEstado, setFiltroEstado] = useState("");
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [modalData, setModalData] = useState({
    tipoTela: "",
    metrajeM: "",
    anchoCm: "",
    color: "",
    proveedor: "",
  });

  useEffect(() => {
    const fetchRollos = async () => {
      try {
        const data = await listarRollos();
        setRollos(data);
      } catch (error) {
        Swal.fire({
          title: "Error al cargar rollos",
          text: error.message || "No se pudieron obtener los rollos.",
          icon: "error",
          confirmButtonColor: "#2f6d6d",
        });
      }
    };
    fetchRollos();
  }, []);

  useEffect(() => {
    const aplicarFiltros = async () => {
      try {
        if (!filtroCodigo.trim() && !filtroEstado) {
          const data = await listarRollos();
          setRollos(data);
          return;
        }

        const data = await filtrarRollos(
          filtroTipo,
          filtroCodigo.trim(),
          filtroEstado
        );
        setRollos(data);
      } catch {
        setRollos([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      aplicarFiltros();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filtroCodigo, filtroTipo, filtroEstado]);

  // Reset filtros
  const handleReset = async () => {
    setFiltroCodigo("");
    setFiltroTipo("codigo");
    setFiltroEstado("");
    try {
      const data = await listarRollos();
      setRollos(data);
    } catch {
      Swal.fire("Error", "No se pudieron recargar los rollos.", "error");
    }
  };

  // Eliminar rollo
  const handleEliminar = async (id) => {
    Swal.fire({
      title: "¿Eliminar rollo?",
      text: "Esta acción marcará el rollo como eliminado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await eliminarRollo(id);
          Swal.fire("Eliminado", res.message, "success");
          setRollos((prev) => prev.filter((r) => r.idRollo !== id));
        } catch (error) {
          Swal.fire("Error", error.message || "No se pudo eliminar.", "error");
        }
      }
    });
  };

  const handleVer = async (idRollo) => {
    try {
      const detalle = await obtenerRolloPorId(idRollo);

      Swal.fire({
        title: "Detalles del rollo",
        html: `
            <p><strong>Código:</strong> ${detalle.codigoRollo}</p>
          <p><strong>Tipo Tela:</strong> ${detalle.tipoTela}</p>
          <p><strong>Color:</strong> ${detalle.color}</p>
          <p><strong>Ancho (cm):</strong> ${detalle.anchoCm}</p>
          <p><strong>Metraje (m):</strong> ${detalle.metrajeM}</p>
          <p><strong>Proveedor:</strong> ${detalle.proveedor}</p>
          <p><strong>Estado:</strong> ${detalle.estado}</p>
          <p><strong>Fecha Recepción:</strong> ${new Date(
            detalle.fechaRecepcion
          ).toLocaleDateString()}</p>
            
          `,
        confirmButtonColor: "#2f6d6d",
      });
    } catch (error) {
      Swal.fire({
        title: "Error al obtener detalles",
        text: error.message || "No se pudieron cargar los detalles del rollo.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  // 🔹 Abrir modal de edición
  const openEditarModal = (index) => {
    const r = rollos[index];
    setModalIndex(index);
    setModalData({
      tipoTela: r.tipoTela || "",
      metrajeM: r.metrajeM || "",
      anchoCm: r.anchoCm || "",
      color: r.color || "",
      proveedor: r.proveedor || "",
    });
    setIsModalOpen(true);
  };

  //Guardar cambios (editar)
  const handleGuardarEdicion = async () => {
    if (modalIndex === null) return;
    const rolloSeleccionado = rollos[modalIndex];

    const payload = {
      tipoTela: modalData.tipoTela,
      anchoCm: parseFloat(modalData.anchoCm),
      color: modalData.color,
      metrajeM: parseFloat(modalData.metrajeM),
      proveedor: modalData.proveedor,
    };

    try {
      const response = await editarRollo(rolloSeleccionado.idRollo, payload);
      Swal.fire("Guardado", response.message, "success");
      const data = await listarRollos();
      setRollos(data);
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "No se pudo actualizar el rollo.",
        "error"
      );
    }
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
          <SidebarMenu />
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div
            className="gestion-header"
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h1>Historial de Rollos</h1>
          </div>

          <p style={{ color: "#666", marginBottom: 12 }}>
            Listado de rollos registrados con su metraje, tipo de tela, ancho y
            fechas de carga
          </p>

          {/* Filtros */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaSearch
                  style={{
                    position: "absolute",
                    left: 10,
                    color: "#666",
                    fontSize: 14,
                  }}
                />
                <input
                  placeholder="Buscar"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  style={{
                    padding: "8px 8px 8px 30px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    width: 180,
                    backgroundColor: "#fff",
                    color: "black",
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "black",
                }}
              >
                <option value="codigo">Código</option>
                <option value="metraje">Metraje</option>
                <option value="color">Color</option>
                <option value="tipoTela">Tipo de tela</option>
                <option value="ancho">Ancho</option>
                <option value="proveedor">Proveedor</option>
              </select>

              {/*Filtro por estado */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "black",
                }}
              >
                <option value="">Estado</option>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              style={{
                backgroundColor: "#2f6d6d",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Resetear
            </button>
          </div>

          {/* Tabla */}
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
                  <th style={{ padding: "12px 10px" }}>Metraje (m)</th>
                  <th style={{ padding: "12px 10px" }}>Color</th>
                  <th style={{ padding: "12px 10px" }}>Tipo tela</th>
                  <th style={{ padding: "12px 10px" }}>Ancho (mm)</th>
                  <th style={{ padding: "12px 10px" }}>Proveedor</th>
                  <th style={{ padding: "12px 10px" }}>Estado</th>
                  <th style={{ padding: "12px 10px" }}>Fecha ingreso</th>
                  <th style={{ padding: "12px 10px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rollos.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#666",
                      }}
                    >
                      No hay rollos registrados
                    </td>
                  </tr>
                ) : (
                  rollos.map((r, i) => (
                    <tr
                      key={r.idRollo}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: 12, color: "#222" }}>
                        {r.codigoRollo}
                      </td>
                      <td style={{ padding: 12, color: "#222" }}>
                        {r.metrajeM}
                      </td>
                      <td style={{ padding: 12, color: "#222" }}>{r.color}</td>
                      <td style={{ padding: 12, color: "#222" }}>
                        {r.tipoTela}
                      </td>
                      <td style={{ padding: 12, color: "#222" }}>{r.ancho}</td>
                      <td style={{ padding: 12, color: "#222" }}>
                        {r.proveedor}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: 20,
                            background:
                              r.estado === "disponible" ? "#d7fbe8" : "#fbd7d7",
                            color:
                              r.estado === "disponible" ? "#056b32" : "#a10000",
                            fontWeight: 600,
                          }}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td style={{ padding: 12, color: "#444" }}>
                        {new Date(r.fechaRecepcion).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 12 }}>
                        <FaRegEdit
                          onClick={() => openEditarModal(i)}
                          title="Ver / Editar"
                          style={{
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            marginRight: 8,
                            color: "#878787",
                          }}
                        />
                        <FaEye
                          onClick={() => handleVer(r.idRollo)}
                          title="Ver / Editar"
                          style={{
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            marginRight: 8,
                            color: "#878787",
                          }}
                        />

                        <FaTrashAlt
                          onClick={() => handleEliminar(r.idRollo)}
                          title="Eliminar"
                          style={{
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            color: "#878787",
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 640,
              maxWidth: "95%",
              background: "#fff",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: 8, color: "black" }}>Editar rollo</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <label
                  style={{ display: "block", marginBottom: 6, color: "black" }}
                >
                  Tipo tela
                </label>
                <input
                  value={modalData.tipoTela}
                  onChange={(e) =>
                    setModalData({ ...modalData, tipoTela: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", marginBottom: 6, color: "black" }}
                >
                  Metraje (m)
                </label>
                <input
                  value={modalData.metrajeM}
                  onChange={(e) =>
                    setModalData({ ...modalData, metraje: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", marginBottom: 6, color: "black" }}
                >
                  Ancho (mm)
                </label>
                <input
                  value={modalData.anchoCm}
                  onChange={(e) =>
                    setModalData({ ...modalData, ancho: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", marginBottom: 6, color: "black" }}
                >
                  Color
                </label>
                <input
                  value={modalData.color}
                  onChange={(e) =>
                    setModalData({ ...modalData, color: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{ display: "block", marginBottom: 6, color: "black" }}
                >
                  Proveedor
                </label>
                <input
                  value={modalData.proveedor}
                  onChange={(e) =>
                    setModalData({ ...modalData, proveedor: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  color: "black",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEdicion}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2f6d6d",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialRollos;
