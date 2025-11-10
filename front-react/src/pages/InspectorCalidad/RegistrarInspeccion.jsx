import { useState } from "react";
import Swal from "sweetalert2";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import { Upload } from "lucide-react";
import "../../css/GestionMoldes.css";

export default function RegistrarInspeccion() {
  const [inspeccion, setInspeccion] = useState([
    {
      criterio: "¿Las piezas están correctamente unidas (ejemplo: mangas, cuello, bolsillos)?",
      respuesta: null,
      observacion: "Hilo suelto en mangas",
      evidencia: null,
    },
    {
      criterio: "¿La tela no presenta defectos (manchas, agujeros, desgaste)?",
      respuesta: null,
      observacion: "Mancha en 2 prendas",
      evidencia: null,
    },
    {
      criterio: "¿Las costuras están rectas y firmes?",
      respuesta: null,
      observacion: "Todo conforme",
      evidencia: null,
    },
    {
      criterio: "¿Está lista para ser empacada o entregada?",
      respuesta: null,
      observacion: "Lista para entrega",
      evidencia: null,
    },
  ]);

  const [notas, setNotas] = useState("");

  const handleRespuesta = (index, valor) => {
    const copia = [...inspeccion];
    copia[index].respuesta = valor;
    setInspeccion(copia);
  };

  const handleObservacion = (index, valor) => {
    const copia = [...inspeccion];
    copia[index].observacion = valor;
    setInspeccion(copia);
  };

  const handleEvidencia = (index, archivo) => {
    const copia = [...inspeccion];
    copia[index].evidencia = archivo;
    setInspeccion(copia);
  };

  // ✅ CONFIRMACIÓN DE GUARDADO
  const handleGuardar = async () => {
    // Validación
    const faltanRespuestas = inspeccion.some((x) => x.respuesta === null);

    if (faltanRespuestas) {
      Swal.fire({
        title: "Respuestas incompletas",
        text: "Debe marcar ✓ o ✕ en todos los criterios.",
        icon: "warning",
        confirmButtonColor: "#2f6d6d",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Inspección guardada",
        text: "El registro fue guardado correctamente.",
        icon: "success",
        confirmButtonColor: "#2f6d6d",
      });

      // Reset
      setInspeccion((prev) =>
        prev.map((item) => ({
          ...item,
          respuesta: null,
          evidencia: null,
        }))
      );
      setNotas("");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la inspección.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

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

        {/* CONTENIDO */}
        <div className="gestion-contentt">
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <h1 className="titulo">Registrar Inspección</h1>
          <p className="subtexto">
            Completa el checklist de control de calidad para esta orden de producción. 
            Registra observaciones si es necesario.
          </p>

          <div className="info-op-box">
          <p style={{ color: '#000' }}><strong>Código OP:</strong> OP-2025-002</p>
  <p style={{ color: '#000' }}><strong>Producto:</strong> Polo de Algodón</p>
<p style={{ color: '#000' }}><strong>Cantidad:</strong> 150 prendas</p>
          </div>

          <table className="tabla-inspeccion">
            <thead>
              <tr>
                <th>Criterio de inspección</th>
                <th className="col-respuesta">Respuesta</th>
                <th className="col-observacion">Observaciones</th>
                <th className="col-evidencia">Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {inspeccion.map((item, index) => (
                <tr key={index}>
                  <td>{item.criterio}</td>

                  <td className="respuesta-buttons">
                    <button
                      className={`btn-respuesta ${item.respuesta === true ? "si" : ""}`}
                      onClick={() => handleRespuesta(index, true)}
                    >
                      ✓
                    </button>
                    <button
                      className={`btn-respuesta ${item.respuesta === false ? "no" : ""}`}
                      onClick={() => handleRespuesta(index, false)}
                    >
                      ✕
                    </button>
                  </td>

                  <td>
                    <input
                      type="text"
                      className="observacion-input"
                      value={item.observacion}
                      onChange={(e) => handleObservacion(index, e.target.value)}
                    />
                  </td>

                  <td className="evidencia-cell">
                    <label className="upload-btn">
                      <Upload size={18} /> Subir foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleEvidencia(index, e.target.files[0])
                        }
                        style={{ display: "none" }}
                      />
                    </label>
                    {item.evidencia && <span className="punto-verde">●</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="notas-section">
            <label>Notas:</label>
            <textarea
              placeholder="Agregar notas adicionales..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          <div className="botones-acciones">
            <button className="btn-cancelar">Cancelar</button>
            <button className="btn-guardar" onClick={handleGuardar}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
