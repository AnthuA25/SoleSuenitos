import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import UserHeader from "../../components/UserHeader";
import SidebarMenu from "../../components/SliderMenu";
import {
  leerPiezas,
  generarV1,
  generarV2,
  compararOptimizaciones,
} from "../../api/ordenProducciónService";
import { listarRollos } from "../../api/rolloService";

function OrdenProduccion() {
  const [modelo, setModelo] = useState("");
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [rollosDisponibles, setRollosDisponibles] = useState([]);
  const [rollosSeleccionados, setRollosSeleccionados] = useState([]);
  const [moldes, setMoldes] = useState([]);
  const [showOptimizacion, setShowOptimizacion] = useState(false);
  const [optValues, setOptValues] = useState({});
  const [showMarcadorV2, setShowMarcadorV2] = useState(false);
  const [optValuesV2, setOptValuesV2] = useState(null);
  const [showCompararMarcadores, setShowCompararMarcadores] = useState(false);

  // Cargar rollos desde el backend
  useEffect(() => {
    const cargarRollos = async () => {
      try {
        const data = await listarRollos();
        setRollosDisponibles(data);
      } catch {
        Swal.fire(
          "Error",
          "No se pudieron obtener los rollos desde el servidor.",
          "error"
        );
      }
    };
    cargarRollos();
  }, []);

  // Subir molde DXF y leer piezas
  const handleSubirMolde = async () => {
    const { value: file } = await Swal.fire({
      title: "Subir archivo DXF",
      input: "file",
      inputAttributes: { accept: ".dxf" },
      showCancelButton: true,
      confirmButtonText: "Subir",
      confirmButtonColor: "#2f6d6d",
    });
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    Swal.fire({
      title: "Analizando molde...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const result = await leerPiezas(formData);
      Swal.close();

      if (result?.piezas?.length) {
        const nuevasPiezas = result.piezas.map((p) => ({
          pieza: p.nombre,
          dimensiones: `${p.ancho_mm} × ${p.alto_mm}`,
          area: p.area_mm2.toFixed(2),
          repeticiones: p.repeticiones ?? 1,
          orientacion: p.permite_giro_90 ? "Giro 90°" : "Recto hilo",
        }));
        setMoldes(nuevasPiezas);
        Swal.fire("Éxito", "Molde leído correctamente.", "success");
      } else {
        Swal.fire(
          "Sin piezas",
          "El archivo no contiene moldes válidos.",
          "info"
        );
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "No se pudo leer el archivo DXF.", "error");
    }
  };

  // Mostrar rollos y seleccionar

  const handleVerRollos = async () => {
    if (rollosDisponibles.length === 0) {
      Swal.fire("Sin datos", "No hay rollos registrados aún.", "info");
      return;
    }

    const rows = rollosDisponibles
      .map((r, idx) => {
        const checked = rollosSeleccionados.includes(r.idRollo)
          ? "checked"
          : "";
        return `
          <tr>
            <td style="padding:6px;"><input type="checkbox" id="chk_${idx}" ${checked} /></td>
            <td style="padding:6px;">${r.codigoRollo}</td>
            <td style="padding:6px;">${r.tipoTela}</td>
            <td style="padding:6px;">${r.color}</td>
            <td style="padding:6px;">${r.metrajeM}</td>
            <td style="padding:6px;">${r.estado}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="max-height:360px; overflow:auto;">
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#2f6d6d; color:white;">
              <th style="padding:6px;">Sel</th>
              <th style="padding:6px;">Código</th>
              <th style="padding:6px;">Tipo</th>
              <th style="padding:6px;">Color</th>
              <th style="padding:6px;">Metraje (m)</th>
              <th style="padding:6px;">Estado</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    const { isConfirmed } = await Swal.fire({
      title: "Rollos Disponibles",
      html,
      width: "800px",
      showCancelButton: true,
      confirmButtonText: "Aplicar selección",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#2f6d6d",
      preConfirm: () => {
        const seleccionados = [];
        for (let i = 0; i < rollosDisponibles.length; i++) {
          const el = document.getElementById(`chk_${i}`);
          if (el && el.checked) seleccionados.push(rollosDisponibles[i]);
        }
        return seleccionados;
      },
    });

    if (isConfirmed) {
      const seleccion = [];
      for (let i = 0; i < rollosDisponibles.length; i++) {
        const el = document.getElementById(`chk_${i}`);
        if (el && el.checked) seleccion.push(rollosDisponibles[i]);
      }
      setRollosSeleccionados(seleccion);
      Swal.fire(
        "Hecho",
        `${seleccion.length} rollo(s) seleccionados`,
        "success"
      );
    }
  };

  // Generar optimización V1

  const handleOptimizarCorte = async () => {
    if (!modelo || !talla || !cantidad) {
      Swal.fire("Completar", "Completa modelo, talla y cantidad", "warning");
      return;
    }
    if (rollosSeleccionados.length === 0) {
      Swal.fire("Seleccionar", "Selecciona al menos un rollo", "warning");
      return;
    }

    const { value: archivoMolde } = await Swal.fire({
      title: "Selecciona el archivo DXF",
      input: "file",
      inputAttributes: { accept: ".dxf" },
      showCancelButton: true,
      confirmButtonText: "Optimizar Corte (V1)",
      confirmButtonColor: "#2f6d6d",
    });
    if (!archivoMolde) return;

    Swal.fire({
      title: "Generando V1...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      formData.append("modelo", modelo);
      formData.append("talla", talla);
      formData.append("cantidad", cantidad);
      rollosSeleccionados.forEach((r) =>
        formData.append("rollosSeleccionados", r.idRollo)
      );
      formData.append("archivoMolde", archivoMolde);
      formData.append("permitirGiro90", true);

      const result = await generarV1(formData);
      Swal.close();

      const data = result.data ? result.data : result;
      console.log("Datos de optimización V1:", data);
      const metricas = data.metricas;
      console.log("m", metricas);

      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5247";
      const imageUrl = `${baseUrl}/${encodeURI(data.png.replace(/\\/g, "/"))}`;
      console.log("Marcador generado:", imageUrl);
      setOptValues({
        telaUtilizada: `${(metricas.largo_usado_mm / 1000).toFixed(2)} m`,
        aprovechamiento: `${metricas.aprovechamiento_porcentaje.toFixed(2)}%`,
        desperdicio: `${metricas.desperdicio_porcentaje.toFixed(2)}%`,
        imagen: imageUrl,
      });
      setShowOptimizacion(true);
      Swal.fire("Éxito", "Optimización V1 generada correctamente.", "success");
    } catch {
      Swal.close();
      Swal.fire("Error", "No se pudo generar la optimización.", "error");
    }
  };

  // Generar optimización V2

  const handleGenerarV2 = async () => {
    const { value: archivoMolde } = await Swal.fire({
      title: "Selecciona el archivo DXF para V2",
      input: "file",
      inputAttributes: { accept: ".dxf" },
      showCancelButton: true,
      confirmButtonText: "Generar V2",
      confirmButtonColor: "#2f6d6d",
    });
    if (!archivoMolde) return;

    Swal.fire({
      title: "Generando V2...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      formData.append("modelo", modelo);
      formData.append("talla", talla);
      formData.append("cantidad", cantidad);
      rollosSeleccionados.forEach((r) =>
        formData.append("rollosSeleccionados", r.idRollo)
      );
      formData.append("archivoMolde", archivoMolde);
      formData.append("permitirGiro90", true);

      const result = await generarV2(formData);
      Swal.close();

      const data = result?.data ?? result;
      const pngPath = data?.png || data?.data?.png; // toma el valor del PNG correctamente
      const m = data?.metricas || data?.data?.metricas;

      if (!pngPath) {
        Swal.fire(
          "Error",
          "El microservicio no devolvió una imagen (png).",
          "error"
        );
        return;
      }

      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5247";

      // 🔹 Usa pngPath en lugar de data.png
      const imageUrl = `${baseUrl}/${encodeURI(pngPath.replace(/\\/g, "/"))}`;
      console.log("Marcador generado:", imageUrl);

      setOptValuesV2({
        telaUtilizada: `${(m.largo_usado_mm / 1000).toFixed(2)} m`,
        aprovechamiento: `${m.aprovechamiento_porcentaje.toFixed(2)}%`,
        desperdicio: `${m.desperdicio_porcentaje.toFixed(2)}%`,
        imagen: imageUrl,
      });

      setShowOptimizacion(false);
      setShowMarcadorV2(true);
      Swal.fire("Éxito", "Optimización V2 generada correctamente.", "success");
    } catch {
      Swal.close();
      Swal.fire("Error", "No se pudo generar V2.", "error");
    }
  };

  // Comparar marcadores

  const handleComparar = async () => {
    Swal.fire({
      title: "Comparando V1 y V2...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const formData = new FormData();
      formData.append("modelo", modelo);
      formData.append("talla", talla);
      formData.append("cantidad", cantidad);
      rollosSeleccionados.forEach((r) =>
        formData.append("rollosSeleccionados", r.idRollo)
      );
      formData.append("archivoMolde", new Blob([])); // dummy
      formData.append("permitirGiro90", true);

      const result = await compararOptimizaciones(formData);
      Swal.close();
      const { mejor_version, optima } = result;
      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5247";
      const imageUrl = `${baseUrl}/${encodeURI(
        optima.png.replace(/\\/g, "/")
      )}`;

      setOptValuesV2({
        titulo: `Marcador versión óptima: ${mejor_version}`,
        telaUtilizada: `${(optima.metricas.largo_usado_mm / 1000).toFixed(
          2
        )} m`,
        aprovechamiento: `${optima.metricas.aprovechamiento_porcentaje.toFixed(
          2
        )}%`,
        desperdicio: `${optima.metricas.desperdicio_porcentaje.toFixed(2)}%`,
        imagen: imageUrl,
      });

      setShowMarcadorV2(false);
      setShowCompararMarcadores(true);
      Swal.fire("Éxito", `La versión óptima es ${mejor_version}`, "success");
    } catch {
      Swal.close();
      Swal.fire("Error", "No se pudo realizar la comparación.", "error");
    }
  };

  const handleVolverOrden = () => {
    setShowOptimizacion(false);
    setShowMarcadorV2(false);
    setShowCompararMarcadores(false);
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
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

        {/* Contenido */}
        <div className="gestion-content">
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          {!showOptimizacion && !showMarcadorV2 && !showCompararMarcadores ? (
            <>
              <h1>Orden de Producción</h1>
              <p style={{ color: "#666", marginBottom: 12 }}>
                Crea una orden seleccionando rollos y moldes
              </p>

              {/* Formulario */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label>Modelo</label>
                  <input
                    className="orden-input"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. Pijama de invierno"
                  />
                </div>
                <div>
                  <label>Talla</label>
                  <input
                    className="orden-input"
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    placeholder="Ej. S"
                  />
                </div>
                <div>
                  <label>Cantidad</label>
                  <input
                    className="orden-input"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej. 10"
                  />
                </div>
                <div>
                  <label>Rollos disponibles</label>
                  <button
                    className="elegir-btn"
                    onClick={handleVerRollos}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    Ver Rollos
                  </button>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {rollosSeleccionados.length === 0 ? (
                      <span style={{ color: "#888", fontStyle: "italic" }}>
                        No hay rollos seleccionados
                      </span>
                    ) : (
                      rollosSeleccionados.map((r) => (
                        <div key={r.idRollo} className="rollo-tag">
                          {r.codigoRollo}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button className="subir-btn" onClick={handleSubirMolde}>
                  Subir molde
                </button>
              </div>

              {/* Tabla de moldes */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <table className="orden-table">
                  <thead>
                    <tr>
                      <th>Pieza</th>
                      <th>Dimensiones</th>
                      <th>Área (cm²)</th>
                      <th>Repeticiones</th>
                      <th>Orientación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moldes.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", color: "#888" }}
                        >
                          Sin piezas cargadas
                        </td>
                      </tr>
                    ) : (
                      moldes.map((m, i) => (
                        <tr key={i}>
                          <td>{m.pieza}</td>
                          <td>{m.dimensiones}</td>
                          <td>{m.area}</td>
                          <td>{m.repeticiones}</td>
                          <td>{m.orientacion}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button className="cancelar-btn" onClick={handleVolverOrden}>
                    Cancelar
                  </button>
                  <button
                    className="optimizar-btn"
                    onClick={handleOptimizarCorte}
                  >
                    Optimizar Corte
                  </button>
                </div>
              </div>
            </>
          ) : showOptimizacion ? (
            <>
              <h1>Optimización V1</h1>
              <div
                style={{
                  background: "#204e4eff",
                  padding: 50,
                  borderRadius: 10,
                  width: "80%",
                  maxWidth: 600,
                  borderBlockColor: "grey",
                }}
              >
                {console.log("Renderizando métricas:", optValues)}
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <b>Tela utilizada:</b>
                      </td>
                      <td>{optValues.telaUtilizada}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Aprovechamiento:</b>
                      </td>
                      <td>{optValues.aprovechamiento}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Desperdicio:</b>
                      </td>
                      <td>{optValues.desperdicio}</td>
                    </tr>
                  </tbody>
                </table>
                {optValues.imagen && (
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <img
                      src={optValues.imagen}
                      alt="Marcador V1"
                      style={{
                        width: "80%",
                        maxWidth: "800px",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button className="optimizar-btn" onClick={handleGenerarV2}>
                    Generar V2
                  </button>
                  <button className="cancelar-btn" onClick={handleVolverOrden}>
                    Volver
                  </button>
                </div>
              </div>
            </>
          ) : showMarcadorV2 ? (
            <>
              <h1>Optimización V2</h1>
              <div
                style={{
                  background: "#204e4eff",
                  padding: 50,
                  borderRadius: 10,
                  width: "80%",
                  maxWidth: 600,
                  borderBlockColor: "grey",
                }}
              >
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <b>Tela utilizada:</b>
                      </td>
                      <td>{optValuesV2?.telaUtilizada}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Aprovechamiento:</b>
                      </td>
                      <td>{optValuesV2?.aprovechamiento}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Desperdicio:</b>
                      </td>
                      <td>{optValuesV2?.desperdicio}</td>
                    </tr>
                  </tbody>
                </table>
                {optValuesV2?.imagen && (
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <img
                      src={optValuesV2.imagen}
                      alt="Marcador V2"
                      style={{
                        width: "80%",
                        maxWidth: "800px",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button className="optimizar-btn" onClick={handleComparar}>
                    Comparar Marcadores
                  </button>
                  <button className="cancelar-btn" onClick={handleVolverOrden}>
                    Volver
                  </button>
                </div>
              </div>
            </>
          ) : showCompararMarcadores ? (
            <>
              <h1>{optValuesV2?.titulo || "Marcador versión óptima"}</h1>
              <div
                style={{
                  background: "#204e4eff",
                  padding: 50,
                  borderRadius: 10,
                  width: "80%",
                  maxWidth: 600,
                }}
              >
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <b>Tela utilizada:</b>
                      </td>
                      <td>{optValuesV2?.telaUtilizada}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Aprovechamiento:</b>
                      </td>
                      <td>{optValuesV2?.aprovechamiento}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Desperdicio:</b>
                      </td>
                      <td>{optValuesV2?.desperdicio}</td>
                    </tr>
                  </tbody>
                </table>

                {optValuesV2?.imagen && (
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <img
                      src={optValuesV2.imagen}
                      alt="Marcador óptimo"
                      style={{
                        width: "80%",
                        maxWidth: "800px",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button className="cancelar-btn" onClick={handleVolverOrden}>
                    Volver
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default OrdenProduccion;
