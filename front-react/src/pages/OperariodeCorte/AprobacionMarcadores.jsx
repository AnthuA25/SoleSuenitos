import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function AprobacionMarcadores() {
  const navigate = useNavigate();
  const [marcadores, setMarcadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarcadores();
  }, []);

  const fetchMarcadores = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/marcadores/pendientes");
      if (!res.ok) throw new Error("Error al cargar marcadores");
      const data = await res.json();
      setMarcadores(data);
    } catch (error) {
      console.error("⚠️ Error cargando marcadores:", error);
      
      // Datos de ejemplo
      setMarcadores([
        { id: 1, descripcion: "Marcador V1", estado: "Pendiente" },
        { id: 2, descripcion: "Marcador V2", estado: "Pendiente" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id) => {
    if (!window.confirm(`¿Aprobar el marcador ${id}?`)) return;

    try {
      const res = await fetch(`http://localhost:8080/api/marcadores/${id}/aprobar`, {
        method: 'PATCH',
      });
      
      if (!res.ok) throw new Error("Error al aprobar");
      
      // Actualizar estado local
      setMarcadores(prev => prev.filter(m => m.id !== id));
      alert(`Marcador ${id} aprobado ✅`);
    } catch (error) {
      console.error("⚠️ Error aprobando marcador:", error);
      alert("Error al aprobar el marcador");
    }
  };

  if (loading) {
    return (
      <div className="gestion-container">
        <div className="gestion-box">
          <div className="gestion-content">
            <p>Cargando marcadores...</p>
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
            <li onClick={() => navigate("/historialopti")}>Historial de Optimización</li>
            <li className="active">Aprobación de Marcadores</li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          {/* Header con usuario */}
          <div className="gestion-header">
            <UserHeader />
          </div>

          <h1 style={{ marginBottom: 12 }}>Aprobación de Marcadores</h1>
          
          {marcadores.length === 0 ? (
            <p style={{ color: '#666', fontSize: 16 }}>
              No hay marcadores pendientes de aprobación
            </p>
          ) : (
            <div style={{ 
              background: 'white', 
              borderRadius: 10, 
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <table className="gestion-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {marcadores.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>{m.descripcion}</td>
                      <td>
                        <span style={{
                          background: '#fff3cd',
                          color: '#856404',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {m.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleAprobar(m.id)}
                          style={{
                            background: '#2f6d6d',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#265a5a'}
                          onMouseOut={(e) => e.target.style.background = '#2f6d6d'}
                        >
                          Aprobar
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

export default AprobacionMarcadores;