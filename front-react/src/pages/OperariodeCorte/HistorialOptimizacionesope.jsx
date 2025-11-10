import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function HistorialOptimizacionesOperario() {
  const navigate = useNavigate();
  const { codigo } = useParams();

  console.log("Código recibido:", codigo); // Debug

  // 📌 DATOS FICTICIOS con ESTADO
  const optimizacionesPorOrden = {
    "OP-2025-001": {
      producto: "Polo Básico",
      optimizaciones: [
        {
          version: "v1",
          telaUtilizada: "87 m",
          desperdicio: "13 m",
          aprovechamiento: "85%",
          tiempoEstimado: "2h 00min",
          estado: "Descartado"
        },
        {
          version: "v2",
          telaUtilizada: "69 m",
          desperdicio: "15 m",
          aprovechamiento: "82%",
          tiempoEstimado: "3h 20min",
          estado: "Óptima"
        }
      ]
    },
    "OP-2025-002": {
      producto: "Pantalón Cargo",
      optimizaciones: [
        {
          version: "v1",
          telaUtilizada: "125 m",
          desperdicio: "20 m",
          aprovechamiento: "83%",
          tiempoEstimado: "4h 30min",
          estado: "Descartado"
        },
        {
          version: "v2",
          telaUtilizada: "110 m",
          desperdicio: "18 m",
          aprovechamiento: "86%",
          tiempoEstimado: "4h 00min",
          estado: "Óptima"
        }
      ]
    },
    "OP-2025-003": {
      producto: "Bata de Bebé",
      optimizaciones: [
        {
          version: "v1",
          telaUtilizada: "45 m",
          desperdicio: "8 m",
          aprovechamiento: "88%",
          tiempoEstimado: "1h 30min",
          estado: "Descartado"
        },
        {
          version: "v2",
          telaUtilizada: "40 m",
          desperdicio: "6 m",
          aprovechamiento: "91%",
          tiempoEstimado: "1h 15min",
          estado: "Óptima"
        }
      ]
    },
    "OP-2025-004": {
      producto: "Camisa Formal",
      optimizaciones: [
        {
          version: "v1",
          telaUtilizada: "95 m",
          desperdicio: "12 m",
          aprovechamiento: "87%",
          tiempoEstimado: "2h 45min",
          estado: "Descartado"
        },
        {
          version: "v2",
          telaUtilizada: "88 m",
          desperdicio: "10 m",
          aprovechamiento: "90%",
          tiempoEstimado: "2h 30min",
          estado: "Óptima"
        }
      ]
    }
  };

  const datosOrden = optimizacionesPorOrden[codigo];

  const handleVerMarcador = (version) => {
    navigate(`/marcador/${codigo}/${version}`);
  };

  const handleVolver = () => {
    navigate('/OrdenesDisponiblesope');
  };

  // Si no existe la orden
  if (!datosOrden) {
    return (
      <div className="gestion-container">
        <div className="gestion-box">
          <div className="gestion-sidebar" style={{ justifyContent: 'flex-start' }}>
            <div className="sidebar-header">
              <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
              <div className="sidebar-title">
                <h2>SOLE<br/><span>Sueñitos</span></h2>
              </div>
            </div>
            <ul style={{ marginTop: '20px' }}>
              <li className="active" onClick={() => navigate("/OrdenesDisponiblesope")}>
                Ordenes Disponibles
              </li>
            </ul>
          </div>

          <div className="gestion-content">
            <div className="gestion-header">
              <UserHeader />
            </div>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <h2 style={{ color: '#d33', marginBottom: 20 }}>
                Orden no encontrada
              </h2>
              <p style={{ color: '#666', marginBottom: 20 }}>
                No se encontraron datos para el código: {codigo}
              </p>
              <button 
                onClick={handleVolver}
                style={{
                  background: '#2f6d6d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Volver a órdenes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div className="gestion-sidebar" style={{ justifyContent: 'flex-start' }}>
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE<br/><span>Sueñitos</span></h2>
            </div>
          </div>

          <ul style={{ marginTop: '20px' }}>
            <li className="active" onClick={() => navigate("/OrdenesDisponiblesope")}>
              Ordenes Disponibles
            </li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <div className="gestion-header">
            <UserHeader />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
            <h1 style={{ margin: 0 }}>Historial de optimizaciones</h1>
          </div>

          <p style={{ color: '#666', marginBottom: 20 }}>
            Selecciona una versión de marcador para visualizar o descargar
          </p>

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>
              {codigo} - {datosOrden.producto}
            </span>
          </div>

          {datosOrden.optimizaciones.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: 40, 
              background: 'white', 
              borderRadius: 10, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
              No hay optimizaciones registradas para esta orden
            </p>
          ) : (
            <div style={{ 
              overflowX: 'auto', 
              background: 'white', 
              borderRadius: 10, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
              <table className="historial-tabla" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#2f6d6d', color: 'white', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '12px 10px' }}>Versión</th>
                    <th style={{ padding: '12px 10px' }}>Tela utilizada</th>
                    <th style={{ padding: '12px 10px' }}>Desperdicio</th>
                    <th style={{ padding: '12px 10px' }}>Aprovechamiento</th>
                    <th style={{ padding: '12px 10px' }}>Tiempo estimado</th>
                    <th style={{ padding: '12px 10px' }}>Estado</th>
                    <th style={{ padding: '12px 10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {datosOrden.optimizaciones.map((opt, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 12, color: '#222', fontWeight: 600 }}>
                        {opt.version.toUpperCase()}
                      </td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.telaUtilizada}</td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.desperdicio}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          background: parseFloat(opt.aprovechamiento) >= 85 ? '#d4edda' : '#fff3cd',
                          color: parseFloat(opt.aprovechamiento) >= 85 ? '#155724' : '#856404',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {opt.aprovechamiento}
                        </span>
                      </td>
                      <td style={{ padding: 12, color: '#222' }}>{opt.tiempoEstimado}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          background: opt.estado === 'Óptima' ? '#d4edda' : '#f8d7da',
                          color: opt.estado === 'Óptima' ? '#155724' : '#721c24',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {opt.estado}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => handleVerMarcador(opt.version)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2f6d6d',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: 14,
                            fontWeight: 500
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