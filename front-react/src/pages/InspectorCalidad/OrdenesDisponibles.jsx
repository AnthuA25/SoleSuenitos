import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import Swal from "sweetalert2";
import { listarOrdenesDisponibles } from "../../api/inspeccionesService";

export default function OrdenesDisponibles() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);

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

  return (
    <div className="gestion-container">
      <div className="gestion-boxx">
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

        {/* CONTENIDO PRINCIPAL */}
        <div className="gestion-contentt">
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <h1 className="titulo">Órdenes de Producción disponibles</h1>
          <p className="subtexto">
            Seleccione una orden para ver o registrar inspección.
          </p>

          <table className="tabla-inspeccion">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Fecha de Creacion</th>
                <th>Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length > 0 ? (
                ordenes.map((orden, index) => (
                  <tr key={index}>
                    <td>{orden.codigo}</td>
                    <td>{orden.producto}</td>
                    <td>{orden.estado}</td>
                    <td>
                      {orden.fechaCreacion
                        ? new Date(orden.fechaCreacion).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{orden.cantidad}</td>
                    <td>
                      <button
                        className="btn-registrar"
                        onClick={() =>
                          navigate(`/registrarinspeccion?idOp=${orden.idOp}`)
                        }
                      >
                        Registrar inspección
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                    No hay órdenes disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
