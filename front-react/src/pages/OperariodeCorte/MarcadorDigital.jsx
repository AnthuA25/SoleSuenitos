import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function MarcadorDigital() {
  const navigate = useNavigate();
  const { codigo, version } = useParams();

  // 📌 DATOS FICTICIOS - Diferentes datos por código y versión
  const datosMarcadores = {
    "OP-2025-001": {
      producto: "Polo Básico",
      v1: {
        telaUtilizada: "87 m",
        tiempoEstimado: "2h 00min",
        aprovechamiento: "85%",
        desperdicio: "13 m"
      },
      v2: {
        telaUtilizada: "69 m",
        tiempoEstimado: "3h 20min",
        aprovechamiento: "82%",
        desperdicio: "15 m"
      }
    },
    "OP-2025-002": {
      producto: "Pantalón Cargo",
      v1: {
        telaUtilizada: "125 m",
        tiempoEstimado: "4h 30min",
        aprovechamiento: "83%",
        desperdicio: "20 m"
      },
      v2: {
        telaUtilizada: "110 m",
        tiempoEstimado: "4h 00min",
        aprovechamiento: "86%",
        desperdicio: "18 m"
      }
    },
    "OP-2025-003": {
      producto: "Bata de Bebé",
      v1: {
        telaUtilizada: "45 m",
        tiempoEstimado: "1h 30min",
        aprovechamiento: "88%",
        desperdicio: "8 m"
      },
      v2: {
        telaUtilizada: "40 m",
        tiempoEstimado: "1h 15min",
        aprovechamiento: "91%",
        desperdicio: "6 m"
      }
    },
    "OP-2025-004": {
      producto: "Camisa Formal",
      v1: {
        telaUtilizada: "95 m",
        tiempoEstimado: "2h 45min",
        aprovechamiento: "87%",
        desperdicio: "12 m"
      },
      v2: {
        telaUtilizada: "88 m",
        tiempoEstimado: "2h 30min",
        aprovechamiento: "90%",
        desperdicio: "10 m"
      }
    }
  };

  const datosOrden = datosMarcadores[codigo];
  const datos = datosOrden ? datosOrden[version] : null;
  const producto = datosOrden ? datosOrden.producto : "Producto no encontrado";

  const handleDescargarDXL = () => {
    alert(`Descargando marcador ${version?.toUpperCase()} de ${codigo} en formato DXL`);
  };

  const handleDescargarPDF = () => {
    alert(`Descargando marcador ${version?.toUpperCase()} de ${codigo} en formato PDF`);
  };

  const handleVolver = () => {
    navigate(-1);
  };

  if (!datos) {
    return (
      <div className="gestion-container">
        <div className="gestion-box">
          <div className="gestion-content" style={{ padding: 40, textAlign: 'center' }}>
            <h2 style={{ color: '#d33', marginBottom: 20 }}>Marcador no encontrado</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>
              No se encontraron datos para {codigo} - {version}
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
              Volver
            </button>
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
            <h1 style={{ margin: 0 }}>
              Marcador Digital {version?.toUpperCase()}
            </h1>
          </div>

          <p style={{ color: '#666', marginBottom: 24 }}>
            {codigo} - {producto}
          </p>

          <div style={{
            background: 'white',
            borderRadius: 10,
            padding: 40,
            maxWidth: 700,
            margin: '0 auto',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {/* Visualización del marcador */}
            <div style={{
              background: '#f5f5f5',
              border: '2px dashed #ccc',
              borderRadius: 8,
              padding: '80px 40px',
              marginBottom: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #d4d4d4 0%, #e0e0e0 100%)', 
                  height: 140, 
                  flex: 1, 
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#666'
                }}>
                  Pieza 1
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #d4d4d4 0%, #e0e0e0 100%)', 
                  height: 140, 
                  flex: 1, 
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#666'
                }}>
                  Pieza 2
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #e5e5e5 0%, #efefef 100%)', 
                  height: 100, 
                  flex: 1, 
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#666'
                }}>
                  Pieza 3
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #e5e5e5 0%, #efefef 100%)', 
                  height: 100, 
                  flex: 1, 
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#666'
                }}>
                  Pieza 4
                </div>
              </div>
            </div>

            {/* Métricas del marcador */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 20, 
              marginBottom: 32,
              padding: '20px 0',
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Tela utilizada
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos.telaUtilizada}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Tiempo estimado
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos.tiempoEstimado}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Aprovechamiento
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: parseFloat(datos.aprovechamiento) >= 85 ? '#155724' : '#856404' }}>
                  {datos.aprovechamiento}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Desperdicio
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos.desperdicio}
                </div>
              </div>
            </div>

            {/* Botones de descarga */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={handleDescargarDXL}
                style={{
                  background: '#2f6d6d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#265a5a'}
                onMouseOut={(e) => e.target.style.background = '#2f6d6d'}
              >
                Descargar DXL
              </button>
              <button 
                onClick={handleDescargarPDF}
                style={{
                  background: '#2f6d6d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#265a5a'}
                onMouseOut={(e) => e.target.style.background = '#2f6d6d'}
              >
                Descargar en PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarcadorDigital;