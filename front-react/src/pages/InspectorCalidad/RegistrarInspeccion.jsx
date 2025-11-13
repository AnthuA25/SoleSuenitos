import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import { Upload } from "lucide-react";
import "../../css/GestionMoldes.css";
// import { Upload } from "lucide-react";
import {
  obtenerOrden,
  registrarInspeccion,
  subirEvidencia,
} from "../../api/inspeccionesService";

export default function RegistrarInspeccion() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idOp = params.get("idOp");

  const [ordenInfo, setOrdenInfo] = useState(null);

  useEffect(() => {
    const loadOrden = async () => {
      const data = await obtenerOrden(idOp);
      setOrdenInfo(data);
    };
    loadOrden();
  }, [idOp]);
  const [inspeccion, setInspeccion] = useState([
    {
      criterio: "PiezasUnidas",
      pregunta:
        "¿Las piezas están correctamente unidas (ejemplo: mangas, cuello, bolsillos)?",
      respuesta: null,
      observacion: "",
      evidencia: null,
    },
    {
      criterio: "TelaSinDefectos",
      pregunta: "¿La tela no presenta defectos (manchas, agujeros, desgaste)?",
      respuesta: null,
      observacion: "",
      evidencia: null,
    },
    {
      criterio: "CosturasOk",
      pregunta: "¿Las costuras están rectas y firmes?",
      respuesta: null,
      observacion: "",
      evidencia: null,
    },
    {
      criterio: "ListaParaEntrega",
      pregunta: "¿Está lista para ser empacada o entregada?",
      respuesta: null,
      observacion: "",
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

  // CONFIRMACIÓN DE GUARDADO
  const handleGuardar = async () => {
    const faltanRespuestas = inspeccion.some((x) => x.respuesta === null);
    if (faltanRespuestas) {
      Swal.fire(
        "Respuestas incompletas",
        "Completa todos los criterios",
        "warning"
      );
      return;
    }

    try {
      const data = {
        idOp: parseInt(idOp),
        piezasUnidas: inspeccion.find((x) => x.criterio === "PiezasUnidas")
          .respuesta,
        telaSinDefectos: inspeccion.find(
          (x) => x.criterio === "TelaSinDefectos"
        ).respuesta,
        costurasOk: inspeccion.find((x) => x.criterio === "CosturasOk")
          .respuesta,
        listaParaEntrega: inspeccion.find(
          (x) => x.criterio === "ListaParaEntrega"
        ).respuesta,
        observaciones: inspeccion.map((x) => x.observacion),
        resultadoFinal: "Pendiente de aprobación",
        notaAdicional: notas,
      };

      const res = await registrarInspeccion(data);
      const idInspeccion = res.inspeccion.idInspeccion;

      for (const item of inspeccion) {
        if (item.evidencia) {
          await subirEvidencia(idInspeccion, item.criterio, item.evidencia);
        }
      }

      Swal.fire("Éxito", "Inspección guardada", "success").then(() =>
        navigate("/ordenesdisponibles")
      );
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo registrar", "error");
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
            Completa el checklist de control de calidad para esta orden de
            producción. Registra observaciones si es necesario.
          </p>
          {ordenInfo && (
            <div className="info-op-box">
              <p style={{ color: "#000" }}>
                <strong>Código OP:</strong> {ordenInfo.CodigoOp}
              </p>
              <p style={{ color: "#000" }}>
                <strong>Producto:</strong> {ordenInfo.Modelo}
              </p>
              <p style={{ color: "#000" }}>
                <strong>Cantidad:</strong> {ordenInfo.Cantidad} prendas
              </p>
            </div>
          )}

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
                  <td>{item.pregunta}</td>

                  <td className="respuesta-buttons">
                    <button
                      className={`btn-respuesta ${
                        item.respuesta === true ? "si" : ""
                      }`}
                      onClick={() => handleRespuesta(index, true)}
                    >
                      ✓
                    </button>
                    <button
                      className={`btn-respuesta ${
                        item.respuesta === false ? "no" : ""
                      }`}
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
            <button
              className="btn-cancelar"
              onClick={() => navigate("/ordenesdisponibles")}
            >
              Cancelar
            </button>
            <button className="btn-guardar" onClick={handleGuardar}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
