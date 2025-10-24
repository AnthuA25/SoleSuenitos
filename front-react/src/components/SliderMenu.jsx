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
          <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
          <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
          <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
          <li onClick={() => navigate("/ordenproduccion")}>Orden de Producción</li>
          <li onClick={() => navigate("/historialopti")}>Historial de Optimización</li>
        </>
      )}

      {/* {rol === "Operario de Corte" && (
        <>
          <li onClick={() => navigate("/ordenproduccion")}>Ver Ordenes Asignadas</li>
          <li onClick={() => navigate("/reportaravance")}>Reportar Avance</li>
          <li onClick={() => navigate("/historialcorte")}>Historial de Corte</li>
        </>
      )}

      {rol === "Inspector de Calidad" && (
        <>
          <li onClick={() => navigate("/verlotes")}>Lotes Pendientes</li>
          <li onClick={() => navigate("/registrarinspeccion")}>Registrar Inspección</li>
          <li onClick={() => navigate("/historialinspeccion")}>Historial de Inspecciones</li>
        </>
      )} */}
    </ul>
  );
}

export default SidebarMenu;
