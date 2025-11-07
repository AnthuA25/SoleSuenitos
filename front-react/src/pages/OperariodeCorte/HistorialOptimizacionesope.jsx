import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function HistorialOptimizaciones() {
  const navigate = useNavigate();
  const { codigo } = useParams(); // Para capturar el código de la orden si viene por URL
  const [optimizaciones, setOptimizaciones] = useState([]);

  useEffect(() => {
    // Fetch genérico: aquí conectarás con tu backend real
    const fetchData = async () => {
      try {
        const url = codigo 
          ? `http://localhost:8080/api/optimizaciones/${codigo}`
          : "http://localhost:8080/api/optimizaciones";
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener optimizaciones");
        const data = await response.json();
        setOptimizaciones(data);
      } catch (error) {
        console.error("⚠️ Error cargando optimizaciones:", error);
        
        // Datos de ejemplo mientras no hay backend
        setOptimizaciones([
          {
            id: 1,
            version: "v1",
            telaUtilizada: "84 m",
            desperdicio: "16 m",
            aprovechamiento: "85%",
            tiempoEstimado: "3h 00min",
            codigoOrden: codigo || "OP-2025-001"
          },
          {
            id: 2,
            version: "v2",
            telaUtilizada: "69 m",
            desperdicio: "15 m",
            aprovechamiento: "85%",
            tiempoEstimado: "3h 20min",
            codigoOrden: codigo || "OP-2025-001"
          },
        ]);
      }
    };
    fetchData();
  }, [codigo]);

  const handleVerMarcador = (version) => {
    navigate(`/marcador/${version}`);
  };

  const handleVolver = () => {
    navigate('/ordenesdisponibles');
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE<br/><span>Sueñitos</span></h2>
            </div>
          </div>

          <ul>
            <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
            <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
            <li onClick={() => navigate("/ordenproduccion")}>Orden de Producción</li>
            <li onClick={() => navigate("/ordenesdisponibles")}>Órdenes Disponibles</li>
            <li className="active" onClick={() => navigate("/historialopti")}>
              Historial de Optimización
            </li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          {/* Header con usuario */}
          <div className="gestion-header">
            <UserHeader />
          </div>

          {/* Título con botón de volver */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {codigo && (
              <button
                onClick={handleVolver}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#2f6d6d',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 24
                }}
              >
                ←
              </button>
            )}
            <h1 style={{ margin: 0 }}>Historial de optimizaciones</h1>
          </div>

          <p style={{ color: '#666', marginBottom: 20 }}>
            Selecciona una versión de marcador para visualizar o descargar
          </p>

          {/* Mostrar código de orden si existe */}
          {codigo && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>
                {codigo}
              </span>
            </div>
          )}

          {/* Tabla de optimizaciones */}
          <div style={{ 
            overflowX: 'auto', 
            background: 'white', 
            borderRadius: 10, 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
          }}>
            <table className="historial-tabla" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#2f6d6d', color: 'white', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 10px' }}>Versión de optimización</th>
                  <th style={{ padding: '12px 10px' }}>Tela utilizada</th>
                  <th style={{ padding: '12px 10px' }}>Desperdicio</th>
                  <th style={{ padding: '12px 10px' }}>Aprovechamiento</th>
                  <th style={{ padding: '12px 10px' }}>Tiempo estimado</th>
                  <th style={{ padding: '12px 10px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {optimizaciones.length === 0 ? (
                  <tr>
                    <td 
                      colSpan="6" 
                      style={{ 
                        textAlign: 'center', 
                        padding: 20, 
                        color: '#666' 
                      }}
                    >
                      No hay optimizaciones registradas
                    </td>
                  </tr>
                ) : (
                  optimizaciones.map((opt) => (
                    <tr key={opt.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 12, color: '#222' }}>{opt.version}</td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.telaUtilizada}</td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.desperdicio}</td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.aprovechamiento}</td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.tiempoEstimado}</td>
                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => handleVerMarcador(opt.version)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2f6d6d',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: 14
                          }}
                        >
                          [Ver]
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
    </div>
  );
}

export default HistorialOptimizaciones;