import { useNavigate } from "react-router-dom";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

export default function OrdenesDisponibles() {
  const navigate = useNavigate();

  const ordenes = [
    {
      codigo: "OP-2025-001",
      producto: "Polo",
      estado: "Pendiente",
      fecha: "7/09/2025",
      cantidad: 10,
    },
    {
      codigo: "OP-2025-002",
      producto: "Pantalón",
      estado: "En proceso",
      fecha: "7/09/2025",
      cantidad: 20,
    },
    {
      codigo: "OP-2025-003",
      producto: "Bata",
      estado: "Listo",
      fecha: "7/09/2025",
      cantidad: 40,
    },
  ];

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
                <th>Fecha de entrega</th>
                <th>Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden, index) => (
                <tr key={index}>
                  <td>{orden.codigo}</td>
                  <td>{orden.producto}</td>
                  <td>{orden.estado}</td>
                  <td>{orden.fecha}</td>
                  <td>{orden.cantidad}</td>
                  <td>
                    <button
                      className="btn-registrar"
                      onClick={() => navigate("/registrarinspeccion")}
                    >
                      Registrar inspección
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
