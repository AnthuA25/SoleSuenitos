import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function HistorialRollos() {
  const navigate = useNavigate();
  const [rollos, setRollos] = useState([]);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [modalData, setModalData] = useState({
    tipoTela: "",
    metraje: "",
    ancho: "",
    color: "",
    proveedor: "",
  });

  // Usuario y dropdown
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = { nombre: "Sole Suenito" };
  const userInicial = user.nombre.charAt(0).toUpperCase();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("rollos") || "[]");
    setRollos(data);
  }, []);

  const saveRollos = (newRollos) => {
    localStorage.setItem("rollos", JSON.stringify(newRollos));
    setRollos(newRollos);
  };

  const ordenarPorFecha = () => {
    const ordenado = [...rollos].sort((a, b) => {
      const fechaA = new Date(a.fechaIngreso);
      const fechaB = new Date(b.fechaIngreso);
      return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });
    setRollos(ordenado);
    setOrdenAscendente(!ordenAscendente);
  };

  const handleEliminar = (index) => {
    const r = rollos[index];
    Swal.fire({
      title: "¿Eliminar rollo?",
      html: `<p>¿Eliminar rollo <strong>${r?.codigo}</strong>?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevos = [...rollos];
        nuevos.splice(index, 1);
        saveRollos(nuevos);
        Swal.fire("Eliminado", "El rollo ha sido eliminado.", "success");
      }
    });
  };

  const openEditarModal = (index) => {
    const r = rollos[index];
    setModalIndex(index);
    setModalData({
      tipoTela: r?.tipoTela || "",
      metraje: r?.metraje || "",
      ancho: r?.ancho || "",
      color: r?.color || "",
      proveedor: r?.proveedor || "",
    });
    setIsModalOpen(true);
  };

  const handleGuardarEdicion = () => {
    if (modalIndex === null) return;
    const nuevos = [...rollos];
    nuevos[modalIndex] = {
      ...nuevos[modalIndex],
      tipoTela: modalData.tipoTela,
      metraje: modalData.metraje,
      ancho: modalData.ancho,
      color: modalData.color,
      proveedor: modalData.proveedor,
    };
    saveRollos(nuevos);
    setIsModalOpen(false);
    setModalIndex(null);
    Swal.fire("Guardado", "Los cambios se guardaron correctamente.", "success");
  };

  const rollosFiltrados = rollos.filter((r) => {
    const coincideCodigo = filtroCodigo
      ? (r.codigo || "").toLowerCase().includes(filtroCodigo.toLowerCase())
      : true;
    const coincideEstado = filtroEstado ? r.estado === filtroEstado : true;
    return coincideCodigo && coincideEstado;
  });

  const handleReset = () => {
    setFiltroCodigo("");
    setFiltroEstado("");
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
    }).then((res) => {
      if (res.isConfirmed) navigate("/");
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
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li className="active" onClick={() => navigate("/historialrollos")}>
              Historial de Rollos
            </li>
            <li onClick={() => navigate("/ordenproduccion")}>Orden de Producción</li>
            <li onClick={() => navigate("/historialopti")}>Historial de Optimización</li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          {/* HEADER superior con usuario */}
          <div className="gestion-header" style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="user-menu-container">
              <div 
                className="user-button" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <div className="user-circle" style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  backgroundColor: "#2f6d6d",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px"
                }}>{userInicial}</div>
                <span style={{fontWeight: 600, color:"#2f6d6d"}}>{user.nombre}</span>
              </div>
              {showUserMenu && (
                <div className="user-dropdown_sesion" style={{
                  position: "absolute",
                  backgroundColor: "#2f6d6d",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "6px",
                  marginTop: "8px",
                  right: 0
                }}>
                  <button 
                    className="botoncerrarsesion" 
                    onClick={handleLogout}
                    style={{
                      background: "#2f6d6d",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h1>Historial de Rollos</h1>
          </div>

          <p style={{ color: "#666", marginBottom: 12 }}>
            Listado de rollos registrados con su metraje, tipo de tela, ancho y fechas de carga
          </p>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Buscar código..."
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", flex: 1, backgroundColor: "#e0f7fa", color: "black" }}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#e0f7fa", color: "black" }}
            >
              <option value="">Estado</option>
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
            </select>
            <button
              onClick={handleReset}
              style={{
                backgroundColor: "#2f6d6d",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          {/* Tabla */}
          <div style={{ overflowX: "auto", background: "white", borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} className="historial-tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Metraje (m)</th>
                  <th>Color</th>
                  <th>Tipo de tela</th>
                  <th>Ancho (mm)</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th style={{ cursor: "pointer" }} onClick={ordenarPorFecha}>
                    Fecha ingreso{" "}
                    <span style={{ color: "#2f6d6d", fontSize: "14px", marginLeft: 6 }}>
                      {ordenAscendente ? "▲" : "▼"}
                    </span>
                  </th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {rollosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 20, color: "#666" }}>
                      No hay rollos registrados
                    </td>
                  </tr>
                ) : (
                  rollosFiltrados.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: 12, color: "black"}}>{r.codigo}</td>
                      <td style={{ padding: 12, color: "black" }}>{r.metraje}</td>
                      <td style={{ padding: 12, color: "black" }}>{r.color}</td>
                      <td style={{ padding: 12, color: "black" }}>{r.tipoTela}</td>
                      <td style={{ padding: 12, color: "black" }}>{r.ancho}</td>
                      <td style={{ padding: 12, color: "black" }}>{r.proveedor}</td>
                      <td style={{ padding: 12, color: "black" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 8px",
                            borderRadius: 8,
                            background: r.estado === "Disponible" ? "#b7f2c2" : "#f8c7c7",
                            color: r.estado === "Disponible" ? "#065f10" : "#a10000",
                            
                          }}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td style={{ padding: 12 , color: "black"}}>{r.fechaIngreso}</td>
                      <td style={{ padding: 12, color: "black" }}>
                        <button
                          onClick={() => openEditarModal(i)}
                          title="Editar"
                          style={{ marginRight: 8, background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEliminar(i)}
                          title="Eliminar"
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
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
            <h3 style={{ marginBottom: 8 , color: "black"}}>Editar rollo</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6 , color: "black"}}>Tipo de tela</label>
                <input
                  value={modalData.tipoTela}
                  onChange={(e) => setModalData({ ...modalData, tipoTela: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 , color: "black"}}>Metraje (m)</label>
                <input
                  value={modalData.metraje}
                  onChange={(e) => setModalData({ ...modalData, metraje: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 , color: "black"}}>Ancho (mm)</label>
                <input
                  value={modalData.ancho}
                  onChange={(e) => setModalData({ ...modalData, ancho: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6 , color: "black"}}>Color</label>
                <input
                  value={modalData.color}
                  onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6 , color: "black"}}>Proveedor</label>
                <input
                  value={modalData.proveedor}
                  onChange={(e) => setModalData({ ...modalData, proveedor: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  color: "black"
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
