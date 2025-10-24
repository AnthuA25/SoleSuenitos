import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";

function Optimizacion() {
  const navigate = useNavigate();

  const [tela, setTela] = useState(0);
  const [tiempo, setTiempo] = useState("");
  const [aprovechamiento, setAprovechamiento] = useState(0);
  const [desperdicio, setDesperdicio] = useState(0);
  const [versionActual, setVersionActual] = useState("v1");

  const generarValores = () => {
    const telaUsada = (Math.random() * 60 + 60).toFixed(1);
    const tiempoHoras = (Math.random() * 2 + 1).toFixed(1);
    const aprovechamientoVal = (Math.random() * 25 + 70).toFixed(1);
    const desperdicioVal = (Math.random() * 20 + 5).toFixed(1);

    setTela(telaUsada);
    setTiempo(`${tiempoHoras} h`);
    setAprovechamiento(aprovechamientoVal);
    setDesperdicio(desperdicioVal);
  };

  useEffect(() => {
    generarValores();
  }, []);

  const guardarV1 = () => {
    const datos = {
      version: "V1",
      tela,
      tiempo,
      aprovechamiento,
      desperdicio,
      fecha: new Date().toLocaleString(),
    };
    localStorage.setItem("optimizacion_v1", JSON.stringify(datos));
    Swal.fire({
      icon: "success",
      title: "Versión 1 guardada",
      text: "Los valores de la versión 1 se guardaron correctamente.",
      confirmButtonColor: "#146C94",
    });
    setVersionActual("v1");
  };

  const generarV2 = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Generar marcador V2",
      html: `
        <label style="display:block; text-align:left; font-weight:600;">Giro permitido</label>
        <select id="swal-giro" class="swal2-input">
          <option value="">Seleccionar giro</option>
          <option value="Libre">Libre (cualquier orientación)</option>
          <option value="90°">90° restringido</option>
        </select>
        <label style="display:block; text-align:left; font-weight:600; margin-top:10px;">Orientación de piezas</label>
        <select id="swal-orientacion" class="swal2-input">
          <option value="">Seleccionar orientación</option>
          <option value="Horizontal">Horizontal</option>
          <option value="Vertical">Vertical</option>
          <option value="Mixta">Mixta</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generar V2",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#146C94",
      cancelButtonColor: "#999",
      preConfirm: () => {
        const giro = document.getElementById("swal-giro").value;
        const orientacion = document.getElementById("swal-orientacion").value;
        if (!giro || !orientacion) {
          Swal.showValidationMessage("Por favor completa ambos campos");
          return false;
        }
        return { giro, orientacion };
      },
    });

    if (formValues) {
      // Genera valores nuevos para la versión 2
      const telaV2 = (tela - Math.random() * 5).toFixed(1);
      const tiempoV2 = (parseFloat(tiempo) - Math.random() * 0.3).toFixed(1);
      const aprovechamientoV2 = (parseFloat(aprovechamiento) + Math.random() * 2).toFixed(1);
      const desperdicioV2 = (parseFloat(desperdicio) - Math.random() * 2).toFixed(1);

      setTela(telaV2);
      setTiempo(`${tiempoV2} h`);
      setAprovechamiento(aprovechamientoV2);
      setDesperdicio(desperdicioV2);
      setVersionActual("v2");

      // Guardar directamente como versión 2
      const datosV2 = {
        version: "V2",
        giro: formValues.giro,
        orientacion: formValues.orientacion,
        tela: telaV2,
        tiempo: `${tiempoV2} h`,
        aprovechamiento: aprovechamientoV2,
        desperdicio: desperdicioV2,
        fecha: new Date().toLocaleString(),
      };
      localStorage.setItem("optimizacion_v2", JSON.stringify(datosV2));

      Swal.fire({
        icon: "success",
        title: "Versión 2 generada y guardada",
        html: `
          <p><b>Giro:</b> ${formValues.giro}</p>
          <p><b>Orientación:</b> ${formValues.orientacion}</p>
          <p>Los nuevos valores se guardaron correctamente.</p>
        `,
        confirmButtonColor: "#146C94",
      });
    }
  };

  return (
    <div className="gestion-container">
      <div className="sidebar">
        <img src={logo_blanco} alt="Logo" className="logo" />
        <ul>
          <li onClick={() => navigate("/gestion-moldes")}>Gestión de Moldes</li>
          <li onClick={() => navigate("/historial-moldes")}>Historial de Moldes</li>
          <li onClick={() => navigate("/recuperar-rollos")}>Recuperar Rollos</li>
          <li onClick={() => navigate("/historial-rollos")}>Historial de Rollos</li>
          <li onClick={() => navigate("/orden-produccion")}>Orden de Producción</li>
          <li className="active">Historial de Optimización</li>
        </ul>
        <button className="logout-btn">Cerrar Sesión</button>
      </div>

      <div className="contents">
        <h2 className="titulo-seccion">
          Optimización <span style={{ color: "#146C94" }}>({versionActual.toUpperCase()})</span>
        </h2>

        <div className="optimizacion-card">
          <p className="valor-opt"><strong>Tela utilizada:</strong> {tela} m</p>
          <p className="valor-opt"><strong>Tiempo estimado:</strong> {tiempo}</p>
          <p className="valor-opt"><strong>Aprovechamiento:</strong> {aprovechamiento}%</p>
          <p className="valor-opt"><strong>Desperdicio:</strong> {desperdicio} m</p>

          <div className="botones-optimizacion">
            <button className="btn-guardar" onClick={guardarV1}>Guardar V1</button>
            <button className="btn-generar" onClick={generarV2}>Generar y Guardar V2</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Optimizacion;
