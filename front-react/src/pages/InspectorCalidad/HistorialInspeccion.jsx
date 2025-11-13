import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import { FaEye, FaRegEdit, FaSearch, FaTrashAlt } from "react-icons/fa";
import "../../css/GestionMoldes.css";

import {
  listarInspecciones,
  obtenerInspeccion,
  descargarReporte,
  eliminarInspeccion,
} from "../../api/inspeccionesService";

export default function HistorialInspeccion() {
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await listarInspecciones();
        setDatos(data);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar historial.", "error");
      }
    };
    cargar();
  }, []);

  const handleVer = async (row) => {
    try {
      const det = await obtenerInspeccion(row.id);

      const observaciones = (det.Observaciones || "").split(" | ");

      const criterios = [
        {
          pregunta: "¿Las piezas están correctamente unidas?",
          cumple: det.PiezasUnidas,
          observacion: observaciones[0] || "",
        },
        {
          pregunta: "¿La tela no presenta defectos?",
          cumple: det.TelaSinDefectos,
          observacion: observaciones[1] || "",
        },
        {
          pregunta: "¿Las costuras están rectas y firmes?",
          cumple: det.CosturasOk,
          observacion: observaciones[2] || "",
        },
        {
          pregunta: "¿Está lista para entrega?",
          cumple: det.ListaParaEntrega,
          observacion: observaciones[3] || "",
        },
      ];

      const criteriosHTML = criterios
        .map(
          (c, i) => `
          <tr>
            <td style="padding: 8px; text-align:left;">${c.pregunta}</td>
            <td style="text-align:center;">${c.cumple ? "✔" : "✘"}</td>
            <td>${c.observacion}</td>
            <td style="text-align:center;">
              <button class="btn-upload" data-index="${i}" 
                style="padding:4px 8px; border:none; background:#0f836f; color:white; border-radius:5px;">
                Subir foto
              </button>
            </td>
          </tr>
        `
        )
        .join("");

      Swal.fire({
        title: `<h3>Detalle de Inspección - ${det.CodigoOp}</h3>`,
        html: `
          <p style="font-size:14px; color:gray;">Resumen completo de la inspección realizada.</p>
          <div style="text-align:left; margin-top:10px;">
            <p><strong>Código OP:</strong> ${det.CodigoOp}</p>
            <p><strong>Resultado:</strong> ${det.ResultadoFinal}</p>
            <p><strong>Producto:</strong> ${det.Producto}</p>
            <p><strong>Inspector:</strong> ${det.Inspector}</p>
          </div>

          <table style="width:100%; margin-top:15px; border-collapse:collapse;">
            <thead>
              <tr style="background:#f2f2f2;">
                <th style="padding:8px; text-align:left;">Criterio</th>
                <th>Respuesta</th>
                <th>Observación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${criteriosHTML}
            </tbody>
          </table>

          <input type="file" id="fileInputHidden" style="display:none;" accept="image/*"/>
        `,
        width: 900,
        showCancelButton: true,
        cancelButtonText: "Exportar reporte",
        confirmButtonText: "Cerrar",
        cancelButtonColor: "#0f836f",
        confirmButtonColor: "#2f6d6d",
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          descargarReporte(row.id);
        }
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar detalles.", "error");
    }
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      icon: "warning",
      text: "¿Deseas eliminar este registro?",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d9534f",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await eliminarInspeccion(id);
      setDatos((prev) => prev.filter((i) => i.id !== id));

      Swal.fire("Eliminado", "Inspección eliminada.", "success");
    } catch {
      Swal.fire("Error", "No se pudo eliminar.", "error");
    }
  };

  return (
    <div className="gestion-container">
      <div className="gestion-boxx">
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
        <div className="gestion-contentt">
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <h1 className="titulo">Historial de Inspección</h1>
          <p className="subtexto">
            Consulte el registro de todas las inspecciones realizadas.
          </p>

          <div className="busqueda-box">
            <input
              type="text"
              placeholder="Buscar"
              className="input-buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn-buscar">
              <FaSearch size={14} /> Buscar
            </button>

            <button className="btn-resetear" onClick={() => setBusqueda("")}>
              Resetear <FaRegEdit size={14} />
            </button>
          </div>

          <table className="tabla-historial">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Orden Prod.</th>
                <th>Resultado</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {datos.filter((row) =>
                Object.values(row)
                  .join(" ")
                  .toLowerCase()
                  .includes(busqueda.toLowerCase())
              ).length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: 20, color: "#666" }}
                  >
                    No hay inspecciones registradas
                  </td>
                </tr>
              ) : (
                datos
                  .filter((row) =>
                    Object.values(row)
                      .join(" ")
                      .toLowerCase()
                      .includes(busqueda.toLowerCase())
                  )
                  .map((row, index) => (
                    <tr key={index}>
                      <td>{row.codigo}</td>
                      <td>{row.producto}</td>
                      <td>{row.fecha}</td>
                      <td>{row.orden}</td>
                      <td>{row.resultado}</td>
                      <td>{row.estado}</td>
                      <td className="acciones">
                        <FaEye
                          className="icon-ver"
                          size={18}
                          onClick={() => handleVer(row)}
                          style={{ cursor: "pointer" }}
                        />
                        <FaTrashAlt
                          className="icon-eliminar"
                          size={18}
                          onClick={() => handleEliminar(row.id)}
                          style={{ cursor: "pointer", marginLeft: "10px" }}
                        />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
