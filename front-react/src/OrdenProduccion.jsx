// src/OrdenProduccion.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg";
import "./css/GestionMoldes.css";

function OrdenProduccion() {
  const navigate = useNavigate();

  const [modelo, setModelo] = useState("");
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [rollosDisponibles, setRollosDisponibles] = useState([]);
  const [rollosSeleccionados, setRollosSeleccionados] = useState([]);
  const [moldes, setMoldes] = useState([]);
  const [showOptimizacion, setShowOptimizacion] = useState(false);
  const [optValues, setOptValues] = useState({});

  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = { nombre: "Sole Sueñitos" };
  const userInicial = user.nombre.charAt(0).toUpperCase();

  // NUEVO: estado para V2 y comparación
  const [showMarcadorV2, setShowMarcadorV2] = useState(false);
  const [optValuesV2, setOptValuesV2] = useState(null);
  const [showCompararMarcadores, setShowCompararMarcadores] = useState(false);

  // Cargar rollos desde localStorage (guardados por RecepcionRollos)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("rollos") || "[]");
    setRollosDisponibles(data.filter((r) => r.estado === "Disponible" || !r.estado));
  }, []);

  const toggleRollo = (codigo) => {
    if (rollosSeleccionados.includes(codigo)) {
      setRollosSeleccionados(rollosSeleccionados.filter((c) => c !== codigo));
    } else {
      setRollosSeleccionados([...rollosSeleccionados, codigo]);
    }
  };

  // --- MODAL SUBIR MOLDE (.DXL)
  const handleSubirMolde = async () => {
    const { value: file } = await Swal.fire({
      title: "Cargar Archivo",
      text: "Subir archivo .dxl",
      input: "file",
      inputAttributes: {
        accept: ".dxl",
        "aria-label": "Subir archivo .dxl",
      },
      showCancelButton: true,
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2f6d6d",
    });

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        Swal.fire("Subido", "El archivo fue cargado correctamente", "success");
        const nuevo = {
          pieza: "Molde subido",
          dimensiones: "600x800",
          area: 4800,
          repeticiones: 1,
          orientacion: "Recto hilo",
        };
        setMoldes((prev) => [...prev, nuevo]);
      };
      reader.readAsText(file);
    }
  };

  // --- MODAL ELEGIR MOLDE
  const handleElegirMolde = async () => {
    const { value: seleccion } = await Swal.fire({
      title: "Seleccionar Molde",
      html: `
        <div style="text-align:left;">
          <label><input type="checkbox" id="molde1" checked /> Molde Delantero</label><br/>
          <label><input type="checkbox" id="molde2" /> Molde Espalda</label><br/>
          <label><input type="checkbox" id="molde3" /> Molde Manga</label><br/>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2f6d6d",
      preConfirm: () => {
        const seleccionados = [];
        if (document.getElementById("molde1").checked) seleccionados.push("Delantero");
        if (document.getElementById("molde2").checked) seleccionados.push("Espalda");
        if (document.getElementById("molde3").checked) seleccionados.push("Manga");
        return seleccionados;
      },
    });

    if (seleccion && seleccion.length > 0) {
      const nuevos = seleccion.map((nombre) => {
        if (nombre === "Delantero") {
          return { pieza: "Delantero", dimensiones: "600 × 800", area: 4800, repeticiones: 1, orientacion: "Recto hilo" };
        }
        if (nombre === "Espalda") {
          return { pieza: "Espalda", dimensiones: "600 × 800", area: 4800, repeticiones: 1, orientacion: "Recto hilo" };
        }
        if (nombre === "Manga") {
          return { pieza: "Manga", dimensiones: "400 × 600", area: 2400, repeticiones: 2, orientacion: "Libre" };
        }
        return null;
      }).filter(Boolean);
      setMoldes((prev) => [...prev, ...nuevos]);
      Swal.fire("Seleccionado", "Molde(s) agregado(s) a la tabla", "success");
    }
  };

  // --- VER ROLLOS (modal con selección) ---
  const handleVerRollos = async () => {
    const data = JSON.parse(localStorage.getItem("rollos") || "[]");
    if (!data || data.length === 0) {
      Swal.fire("Sin datos", "No hay rollos registrados aún.", "info");
      return;
    }

    // Construir filas con checkboxes (marcadas si ya están seleccionadas)
    const rows = data
      .map((r, idx) => {
        const checked = rollosSeleccionados.includes(r.codigo) ? "checked" : "";
        return `
          <tr>
            <td style="padding:6px;"><input type="checkbox" id="chk_${idx}" ${checked} /></td>
            <td style="padding:6px;">${r.codigo || ("R" + (idx + 1))}</td>
            <td style="padding:6px;">${r.tipoTela || "-"}</td>
            <td style="padding:6px;">${r.color || "-"}</td>
            <td style="padding:6px;">${r.metraje || "-"}</td>
            <td style="padding:6px;">${r.proveedor || "-"}</td>
            <td style="padding:6px;">${r.estado || "-"}</td>
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
              <th style="padding:6px;">Metraje</th>
              <th style="padding:6px;">Proveedor</th>
              <th style="padding:6px;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    const { isConfirmed } = await Swal.fire({
      title: "Rollos Registrados",
      html,
      width: "800px",
      showCancelButton: true,
      confirmButtonText: "Aplicar selección",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#2f6d6d",
      preConfirm: () => {
        // Recoger checks desde el DOM
        const seleccionados = [];
        for (let i = 0; i < data.length; i++) {
          const el = document.getElementById(`chk_${i}`);
          if (el && el.checked) seleccionados.push(data[i].codigo || ("R" + (i + 1)));
        }
        return seleccionados;
      },
    });

    if (isConfirmed) {
      // Recoger selección final (por seguridad replicamos)
      const finalSeleccion = [];
      for (let i = 0; i < data.length; i++) {
        const el = document.getElementById(`chk_${i}`);
        if (el && el.checked) finalSeleccion.push(data[i].codigo || ("R" + (i + 1)));
      }
      setRollosSeleccionados(finalSeleccion);
      Swal.fire("Hecho", `${finalSeleccion.length} rollo(s) seleccionados`, "success");
    }
  };

  // --- OPTIMIZAR CORTE ---
  const handleOptimizarCorte = async () => {
    if (!modelo || !talla || !cantidad) {
      Swal.fire("Completar", "Completa modelo, talla y cantidad", "warning");
      return;
    }
    if (rollosSeleccionados.length === 0) {
      Swal.fire("Seleccionar rollos", "Selecciona al menos 1 rollo para la orden", "warning");
      return;
    }

    // --- Mostrar modal con progreso ---
    let progress = 0;
    Swal.fire({
      title: "Optimizando corte...",
      html: `
        <div style="width:100%; background:#eee; border-radius:10px; margin-top:10px;">
          <div id="progress-bar" style="width:0%; height:20px; background:#2f6d6d; border-radius:10px;"></div>
        </div>
        <p id="progress-text" style="margin-top:10px;">0%</p>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 20);
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            Swal.close();

            // Cuando termina, genera los valores
            const telaUtilizada = `${(80 + Math.random() * 30).toFixed(1)} m`;
            const tiempoEstimado = `${(1 + Math.random() * 2).toFixed(1)} h`;
            const aprovechamiento = `${(70 + Math.random() * 25).toFixed(1)}%`;
            const desperdicio = `${(5 + Math.random() * 20).toFixed(1)} m`;

            setOptValues({
              telaUtilizada,
              tiempoEstimado,
              aprovechamiento,
              desperdicio,
            });
            setShowOptimizacion(true);

            Swal.fire("Optimización completada", "Se generaron valores estimados", "success");
          }
          const bar = Swal.getPopup().querySelector("#progress-bar");
          const text = Swal.getPopup().querySelector("#progress-text");
          if (bar && text) {
            bar.style.width = `${progress}%`;
            text.textContent = `${progress}%`;
          }
        }, 500);
      },
    });
  };

  // --- GUARDAR V1 (guarda en localStorage como historial simple) ---
  const handleGuardarV1 = () => {
    const historial = JSON.parse(localStorage.getItem("optimizaciones") || "[]");
    const nuevo = {
      id: `V1-${Date.now()}`,
      fecha: new Date().toLocaleString(),
      valores: optValues,
      modelo,
      talla,
      cantidad,
      rollos: rollosSeleccionados,
    };
    historial.push(nuevo);
    localStorage.setItem("optimizaciones", JSON.stringify(historial));
    Swal.fire("Guardado", "Optimización v1 guardada (local)", "success");
  };

  // --- GENERAR V2 (modal) ---
  const handleGenerarV2 = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Generar marcador v2",
      html: `
        <div style="text-align:left;">
          <label style="font-weight:600">Giro permitido</label>
          <select id="giro" class="swal2-input">
            <option value="" disabled selected>Seleccionar</option>
            <option value="90°">90°</option>
            <option value="Libre">Libre</option>
          </select>
          <label style="font-weight:600; margin-top:8px;">Orientación de piezas</label>
          <select id="orientacion" class="swal2-input">
            <option value="" disabled selected>Seleccionar</option>
            <option value="Recto hilo">Recto hilo</option>
            <option value="Libre">Libre</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generar V2",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2f6d6d",
      preConfirm: () => {
        const giro = document.getElementById("giro").value;
        const orientacion = document.getElementById("orientacion").value;
        if (!giro || !orientacion) {
          Swal.showValidationMessage("Selecciona ambas opciones");
          return false;
        }
        return { giro, orientacion };
      },
    });

    if (formValues) {
      // Generar ligeras mejoras simuladas sobre optValues
      // Si optValues no existe (por si el usuario no pasó por v1), usamos valores por defecto simulados
      const baseTela = optValues.telaUtilizada ? parseFloat(optValues.telaUtilizada) : 85;
      const baseTiempo = optValues.tiempoEstimado ? parseFloat(optValues.tiempoEstimado) : 1.8;
      const baseAprovech = optValues.aprovechamiento ? parseFloat(optValues.aprovechamiento) : 75;
      const baseDesp = optValues.desperdicio ? parseFloat(optValues.desperdicio) : 8;

      const telaV2 = `${(baseTela - Math.random() * 3).toFixed(1)} m`;
      const tiempoV2 = `${(baseTiempo - Math.random() * 0.3).toFixed(1)} h`;
      const aprovechV2 = `${(baseAprovech + Math.random() * 2).toFixed(1)}%`;
      const desperdV2 = `${(baseDesp - Math.random() * 1).toFixed(1)} m`;

      // Guardamos valores V2 en su propio estado
      setOptValuesV2({
        giro: formValues.giro,
        orientacion: formValues.orientacion,
        telaUtilizada: telaV2,
        tiempoEstimado: tiempoV2,
        aprovechamiento: aprovechV2,
        desperdicio: desperdV2,
      });

      Swal.fire("Marcador V2 generado", `Giro: ${formValues.giro} · Orientación: ${formValues.orientacion}`, "success");

      // Mostrar la vista V2
      setShowOptimizacion(false);
      setShowMarcadorV2(true);
      setShowCompararMarcadores(false);
    }
  };

  // --- GUARDAR V2 (guarda en localStorage como historial con etiqueta V2) ---
  const handleGuardarV2 = () => {
    const historial = JSON.parse(localStorage.getItem("optimizaciones") || "[]");
    const nuevo = {
      id: `V2-${Date.now()}`,
      fecha: new Date().toLocaleString(),
      valores: optValuesV2,
      modelo,
      talla,
      cantidad,
      rollos: rollosSeleccionados,
    };
    historial.push(nuevo);
    localStorage.setItem("optimizaciones", JSON.stringify(historial));
    Swal.fire("Guardado", "Optimización v2 guardada (local)", "success");
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) navigate("/");
    });
  };

  // --- Volver a la vista principal desde optimización ---
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

          <ul>
            <li onClick={() => navigate("/moldes")}>Gestión de Moldes</li>
            <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
            <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
            <li onClick={() => navigate("/historialrollos")}>Historial de Rollos</li>
            <li className="active" onClick={() => navigate("/ordenproduccion")}>
              Orden de Producción
            </li>
            <li onClick={() => navigate("/historialopti")}>Historial de Optimización</li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          {/* HEADER superior */}
          <div className="gestion-header">
            <div className="user-menu-container">
              <div className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-circle">{userInicial}</div>
                <div className="user-name">{user.nombre}</div>
              </div>

              {showUserMenu && (
                <div className="user-dropdown_sesion">
                  <button className="botoncerrarsesion" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---- RENDERIZADO PRINCIPAL: Orden / Optimización V1 / Marcador V2 / Comparar ---- */}
          {!showOptimizacion && !showMarcadorV2 && !showCompararMarcadores ? (
            <>
              <h1>Orden de Producción</h1>
              <p style={{ color: "#666", marginBottom: 12 }}>
                Crea una orden seleccionando rollos y moldes
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={{ color: "black" }}>Modelo</label>
                  <input
                    className="orden-input"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. Pijama de invierno"
                  />
                </div>
                <div>
                  <label style={{ color: "black" }}>Talla</label>
                  <input
                    className="orden-input"
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    placeholder="Ej. S"
                  />
                </div>
                <div>
                  <label style={{ color: "black" }}>Cantidad</label>
                  <input
                    className="orden-input"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej. 10"
                  />
                </div>

                {/* Botón verde para ver rollos */}
                <div>
                  <label style={{ color: "black" }}>Rollos disponibles</label>
                  <button
                    className="elegir-btn"
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={handleVerRollos}
                  >
                    Ver Rollos Disponibles
                  </button>

                  {/* Mostrar rollos seleccionados como tags */}
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {rollosSeleccionados.length === 0 ? (
                      <span style={{ color: "#888", fontStyle: "italic" }}>No hay rollos seleccionados</span>
                    ) : (
                      rollosSeleccionados.map((r) => (
                        <div key={r} className="rollo-tag">{r}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button className="subir-btn" onClick={handleSubirMolde}>
                  Subir molde
                </button>
                <button className="elegir-btn" onClick={handleElegirMolde}>
                  Elegir molde
                </button>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="tabla-scroll">
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
                        <>
                          <tr>
                            <td>Delantero</td>
                            <td>600 × 800</td>
                            <td>4800</td>
                            <td>1</td>
                            <td>Recto hilo</td>
                          </tr>
                          <tr>
                            <td>Espalda</td>
                            <td>600 × 800</td>
                            <td>4800</td>
                            <td>1</td>
                            <td>Recto hilo</td>
                          </tr>
                          <tr>
                            <td>Manga</td>
                            <td>400 × 600</td>
                            <td>2400</td>
                            <td>2</td>
                            <td>Libre</td>
                          </tr>
                        </>
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
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button className="cancelar-btn">Cancelar</button>
                  <button className="optimizar-btn" onClick={handleOptimizarCorte}>
                    Optimizar Corte
                  </button>
                </div>
              </div>
            </>
          ) : showOptimizacion && !showMarcadorV2 && !showCompararMarcadores ? (
            <>
              <h1>Optimización</h1>
              <div
                style={{
                  background: "#204e4eff",
                  padding: 50,
                  borderRadius: 10,
                  width: "80%",
                  maxWidth: 600,
                  borderBlockColor: "grey"
                }}
              >
                <table style={{ width: "100%", marginBottom: 20 }}>
                  <tbody>
                    <tr>
                      <td><strong>Tela utilizada:</strong></td>
                      <td>{optValues.telaUtilizada}</td>
                    </tr>
                    <tr>
                      <td><strong>Tiempo estimado:</strong></td>
                      <td>{optValues.tiempoEstimado}</td>
                    </tr>
                    <tr>
                      <td><strong>Aprovechamiento:</strong></td>
                      <td>{optValues.aprovechamiento}</td>
                    </tr>
                    <tr>
                      <td><strong>Desperdicio:</strong></td>
                      <td>{optValues.desperdicio}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12, paddingTop: 40}}>
                  <button className="guardar-btn" onClick={handleGuardarV1}>
                    Guardar v1
                  </button>
                  <button className="optimizar-btn" onClick={handleGenerarV2}>
                    Generar v2
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  <button className="cancelar-btn" onClick={handleVolverOrden}>Volver a Orden</button>
                </div>
              </div>
            </>
          ) : showMarcadorV2 && !showCompararMarcadores ? (
            // Vista Marcador V2
            <>
              <h1>Marcador Versión Óptima (v2)</h1>
              <div
                style={{
                  background: "#204e4eff",
                  padding: 50,
                  borderRadius: 10,
                  width: "80%",
                  maxWidth: 600,
                }}
              >
                {optValuesV2 ? (
                  <table style={{ width: "100%", marginBottom: 20 }}>
                    <tbody>
                      <tr>
                        <td><strong>Giro permitido:</strong></td>
                        <td>{optValuesV2.giro}</td>
                      </tr>
                      <tr>
                        <td><strong>Orientación:</strong></td>
                        <td>{optValuesV2.orientacion}</td>
                      </tr>
                      <tr>
                        <td><strong>Tela utilizada:</strong></td>
                        <td>{optValuesV2.telaUtilizada}</td>
                      </tr>
                      <tr>
                        <td><strong>Tiempo estimado:</strong></td>
                        <td>{optValuesV2.tiempoEstimado}</td>
                      </tr>
                      <tr>
                        <td><strong>Aprovechamiento:</strong></td>
                        <td>{optValuesV2.aprovechamiento}</td>
                      </tr>
                      <tr>
                        <td><strong>Desperdicio:</strong></td>
                        <td>{optValuesV2.desperdicio}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No hay valores V2 generados.</p>
                )}

                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 30 }}>
                  <button className="guardar-btn" onClick={handleGuardarV2}>Guardar v2</button>
                  {/* BOTON NUEVO: comparar marcadores */}
                  <button
                    className="optimizar-btn"
                    onClick={() => {
                      // al comparar queremos mostrar la vista comparativa
                      // Si no hay optValues (v1) o optValuesV2, se intentará mostrar igualmente con valores por defecto
                      setShowCompararMarcadores(true);
                      setShowMarcadorV2(false);
                    }}
                  >
                    Comparar marcadores
                  </button>
                  <button className="cancelar-btn" onClick={handleVolverOrden}>Volver a Orden</button>
                </div>
              </div>
            </>
          ) : showCompararMarcadores ? (
            // Vista comparación: Marcador versión óptima
            <>
              <h1>Marcador versión óptima</h1>
              <div
                style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 8,
                  width: "90%",
                  maxWidth: 900,
                  margin: "0 auto",
                }}
              >
                <p style={{ color: "#666" }}>Comparativa entre V1 (actual) y V2 (optimizada)</p>

                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, backgroundColor: "#666"}}>
                  <thead>
                    <tr style={{ background: "#2f6d6d" }}>
                      <th style={{ padding: 8, textAlign: "left" }}>Parámetro</th>
                      <th style={{ padding: 8, textAlign: "left" }}>Versión 1</th>
                      <th style={{ padding: 8, textAlign: "left" }}>Versión 2</th>
                      <th style={{ padding: 8, textAlign: "left" }}>Óptimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: 8 }}>Giro permitido</td>
                      <td style={{ padding: 8 }}>{optValues.giro || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.giro || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.giro || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 8 }}>Orientación</td>
                      <td style={{ padding: 8 }}>{optValues.orientacion || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.orientacion || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.orientacion || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 8 }}>Tela utilizada</td>
                      <td style={{ padding: 8 }}>{optValues.telaUtilizada || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.telaUtilizada || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.telaUtilizada || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 8 }}>Tiempo estimado</td>
                      <td style={{ padding: 8 }}>{optValues.tiempoEstimado || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.tiempoEstimado || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.tiempoEstimado || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 8 }}>Aprovechamiento</td>
                      <td style={{ padding: 8 }}>{optValues.aprovechamiento || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.aprovechamiento || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.aprovechamiento || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 8 }}>Desperdicio</td>
                      <td style={{ padding: 8 }}>{optValues.desperdicio || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.desperdicio || "-"}</td>
                      <td style={{ padding: 8 }}>{optValuesV2?.desperdicio || "-"}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
                  <button className="guardar-btn"  onClick={() => {
                    // Si el usuario aprueba el marcador óptimo, podemos guardar V2 y volver a la orden
                    if (optValuesV2) {
                      handleGuardarV2();
                    }
                    setShowCompararMarcadores(false);
                    setShowMarcadorV2(false);
                    setShowOptimizacion(false);
                  }}>
                    Aprobar marcador optimizado (Guardar V2)
                  </button>
                  <button className="cancelar-btn" onClick={() => {
                    // volver a vista V2 para seguir acciones
                    setShowCompararMarcadores(false);
                    setShowMarcadorV2(true);
                  }}>
                    Volver a Marcador V2
                  </button>
                  <button className="cancelar-btn" onClick={handleVolverOrden}>Volver a Orden</button>
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
