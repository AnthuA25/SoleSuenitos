import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/GestionMoldes.css";

function SidebarMenu() {
  const navigate = useNavigate();
  const [rol, setRol] = useState("");

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.rol) {
      setRol(usuario.rol);
    }
  }, []);

  return (
    <ul>
      {rol === "Encargado de Logistica" && (
        <>
          <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
          <li onClick={() => navigate("/historialmoldes")}>
            Historial de Moldes
          </li>
          <li onClick={() => navigate("/recepcionrollos")}>
            Recepción de Rollos
          </li>
          <li onClick={() => navigate("/historialrollos")}>
            Historial de Rollos
          </li>
          <li onClick={() => navigate("/ordenproduccion")}>
            Orden de Producción
          </li>
          <li onClick={() => navigate("/historialopti")}>
            Historial de Optimización
          </li>
        </>
      )}

      {rol === "Operario de Corte" && (
        <>
          <li onClick={() => navigate("/aprobacionmarcadores")}>
            Aprobación de Marcadores
          </li>
          <li onClick={() => navigate("/marcadordigitalv1")}>
            Marcador Digital V1
          </li>
          <li onClick={() => navigate("/marcadordigitalv2")}>
            Marcador Digital V2
          </li>
          <li onClick={() => navigate("/historialoptiope")}>
            Historial de Optimizaciones
          </li>
        </>
      )}

      {rol === "Inspector de Calidad" && (
        <>
          <li onClick={() => navigate("/registrarinspeccion")}>
            Registrar Inspección
          </li>
          <li onClick={() => navigate("/historialinspeccion")}>
            Historial de Inspección
          </li>
        </>
      )}
    </ul>
  );
}

export default SidebarMenu;
