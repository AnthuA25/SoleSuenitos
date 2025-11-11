import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import { listarOptimizacionesPorOrden } from "../../api/ordenesDisponibles";
import Swal from "sweetalert2";

function HistorialOptimizacionesOperario() {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [optimizaciones, setOptimizaciones] = useState([]);
  const [ordenInfo, setOrdenInfo] = useState(null);
  const location = useLocation();
  const { codigoOp, modelo } = location.state || {};

  // 🔹 Cargar optimizaciones de la orden
  useEffect(() => {
    const cargarOptimizaciones = async () => {
      try {
        const idOp = codigo;

        const data = await listarOptimizacionesPorOrden(idOp);
        console.log("✅ Optimizaciones desde backend:", data);

        if (!data || data.length === 0) {
          Swal.fire({
            title: "Sin optimizaciones",
            text: "No hay versiones registradas para esta orden.",
            icon: "info",
            confirmButtonColor: "#2f6d6d",
          });
          setOptimizaciones([]);
          return;
        }

        setOptimizaciones(data);
        setOrdenInfo({
          codigo: codigoOp || data[0]?.codigoOp || idOp,
          producto: modelo || data[0]?.modelo || "Orden sin nombre",
        });
      } catch (error) {
        console.error("Error al cargar optimizaciones:", error);
        Swal.fire({
          title: "Error",
          text:
            error.message ||
            "No se pudieron cargar las optimizaciones de esta orden.",
          icon: "error",
          confirmButtonColor: "#2f6d6d",
        });
      }
    };

    cargarOptimizaciones();
  }, [codigo, codigoOp, modelo]);

  const handleVerMarcador = (version) => {
    navigate(`/marcador/${codigo}/${version}`);
  };

  const handleVolver = () => {
    navigate("/OrdenesDisponiblesope");
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
            <li
              className="active"
              onClick={() => navigate("/OrdenesDisponiblesope")}
            >
              Ordenes Disponibles
            </li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div className="gestion-header">
            <UserHeader />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <button
              onClick={handleVolver}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#2f6d6d",
                display: "flex",
                alignItems: "center",
                fontSize: 24,
              }}
            >
              ←
            </button>
            <h1 style={{ margin: 0 }}>Historial de optimizaciones</h1>
          </div>

          <p style={{ color: "#666", marginBottom: 20 }}>
            Selecciona una versión de marcador para visualizar o descargar
          </p>

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>
              {ordenInfo
                ? `${ordenInfo.codigo || codigo} – ${ordenInfo.producto|| ""}`
                : codigo}
            </span>
          </div>

          {optimizaciones.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#666",
                padding: 40,
                background: "white",
                borderRadius: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              No hay optimizaciones registradas para esta orden
            </p>
          ) : (
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
                    <th style={{ padding: "12px 10px" }}>Versión</th>
                    <th style={{ padding: "12px 10px" }}>Tela utilizada (m)</th>
                    <th style={{ padding: "12px 10px" }}>Desperdicio (m)</th>
                    <th style={{ padding: "12px 10px" }}>Aprovechamiento</th>
                    <th style={{ padding: "12px 10px" }}>Estado</th>
                    <th style={{ padding: "12px 10px" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizaciones.map((opt, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td
                        style={{ padding: 12, color: "#222", fontWeight: 600 }}
                      >
                        V{opt.versionNum}
                      </td>
                      <td style={{ padding: 12, color: "#222" }}>
                        {opt.telaUtilizadaM ?? "-"}
                      </td>
                      <td style={{ padding: 12, color: "#222" }}>
                        {opt.desperdicioM ?? "-"}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            background:
                              parseFloat(opt.aprovechamientoPorcent) >= 85
                                ? "#d4edda"
                                : "#fff3cd",
                            color:
                              parseFloat(opt.aprovechamientoPorcent) >= 85
                                ? "#155724"
                                : "#856404",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {opt.aprovechamientoPorcent
                            ? `${opt.aprovechamientoPorcent}%`
                            : "-"}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            background:
                              opt.estado === "Óptima" ? "#d4edda" : "#f8d7da",
                            color:
                              opt.estado === "Óptima" ? "#155724" : "#721c24",
                            padding: "4px 12px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {opt.estado || "Pendiente"}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => handleVerMarcador(opt.versionNum)}
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
                          [Ver marcador]
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
  );
}

export default HistorialOptimizacionesOperario;
