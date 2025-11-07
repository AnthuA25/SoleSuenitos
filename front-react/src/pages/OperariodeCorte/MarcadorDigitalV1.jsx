import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function MarcadorDigital() {
  const navigate = useNavigate();
  const { version } = useParams(); // v1 o v2
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del marcador según versión
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/marcador/${version}`);
        if (!res.ok) throw new Error("Error al cargar marcador");
        const data = await res.json();
        setDatos(data);
      } catch (error) {
        console.error("⚠️ Error cargando marcador:", error);
        
        // Datos de ejemplo según versión
        const datosMock = {
          v1: {
            telaUtilizada: '87 m',
            tiempoEstimado: '2h 00min',
            aprovechamiento: '85%',
            desperdicio: '13 m',
            codigoOrden: 'OP-2025-001'
          },
          v2: {
            telaUtilizada: '69 m',
            tiempoEstimado: '3h 20min',
            aprovechamiento: '85%',
            desperdicio: '15 m',
            codigoOrden: 'OP-2025-001'
          }
        };
        
        setDatos(datosMock[version] || datosMock.v1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [version]);

  const handleDescargarDXL = () => {
    // Lógica para descargar archivo DXL
    console.log(`Descargando marcador ${version} en formato DXL`);
    alert(`Descargando marcador ${version?.toUpperCase()} en formato DXL`);
  };

  const handleDescargarPDF = () => {
    // Lógica para descargar archivo PDF
    console.log(`Descargando marcador ${version} en formato PDF`);
    alert(`Descargando marcador ${version?.toUpperCase()} en formato PDF`);
  };

  const handleVolver = () => {
    navigate(-1); // Vuelve a la página anterior
  };

  if (loading) {
    return (
      <div className="gestion-container">
        <div className="gestion-box">
          <div className="gestion-content">
            <p>Cargando marcador...</p>
          </div>
        </div>
      </div>
    );
  }

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
            Marcador: {datos?.codigoOrden || 'OP-2025-001'} - Versión Óptima
          </p>

          {/* Contenedor del marcador */}
          <div style={{
            background: 'white',
            borderRadius: 10,
            padding: 40,
            maxWidth: 700,
            margin: '0 auto',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {/* Placeholder visualización del marcador */}
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
                  {datos?.telaUtilizada || '-'}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Tiempo estimado
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos?.tiempoEstimado || '-'}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Aprovechamiento
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos?.aprovechamiento || '-'}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 6 }}>
                  Desperdicio
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
                  {datos?.desperdicio || '-'}
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