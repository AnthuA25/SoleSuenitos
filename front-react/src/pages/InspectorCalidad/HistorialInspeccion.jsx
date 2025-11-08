import { useState } from "react";
import Swal from "sweetalert2";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";
import logo_blanco from "../../images/logo_blanco.svg";
import { FaEye, FaRegEdit, FaSearch, FaTrashAlt } from "react-icons/fa";
import "../../css/GestionMoldes.css";
 
export default function HistorialInspeccion() {
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([
    {
      codigo: "IS-2025-001",
      producto: "Polo de Algodón",
      fecha: "15/09/2025",
      orden: "OP2025-001",
      resultado: "No cumple 2 de 4 criterios",
      estado: "Finalizado",
      criterios: [
        {
          pregunta:
            "¿Las piezas están correctamente unidas (ejemplo: mangas, cuello, bolsillos)?",
          cumple: false,
          observacion: "Hilo suelto en mangas",
        },
        {
          pregunta:
            "¿La tela no presenta defectos (manchas, agujeros, desgaste)?",
          cumple: false,
          observacion: "Mancha en 2 prendas",
        },
        {
          pregunta: "¿Las costuras están rectas y firmes?",
          cumple: true,
          observacion: "Todo conforme",
        },
        {
          pregunta: "¿Está lista para ser empacada o entregada?",
          cumple: true,
          observacion: "Lista para entrega",
        },
      ],
    },
    {
      codigo: "IS-2025-002",
      producto: "Pantalón",
      fecha: "10/09/2025",
      orden: "OP2025-002",
      resultado: "Cumple todos los criterios",
      estado: "Finalizado",
      criterios: [],
    },
  ]);
 
  // ✅ Mostrar detalles en SweetAlert2
  const handleVer = (row) => {
    const criteriosHTML = row.criterios
      .map(
        (c, i) => `
        <tr>
          <td style="padding: 8px; text-align:left;">${c.pregunta}</td>
          <td style="text-align:center;">${c.cumple ? "✅" : "❌"}</td>
          <td style="padding: 8px;">${c.observacion}</td>
          <td style="text-align:center;">
            <button class="btn-upload" data-index="${i}" style="
              padding:4px 8px;
              border-radius:5px;
              border:none;
              background:#0f836f;
              color:white;
              cursor:pointer;
            ">Subir foto</button>
          </td>
        </tr>
      `
      )
      .join("");
 
    Swal.fire({
      title: `<h3 style="margin-bottom:10px;">Detalle de Inspección - ${row.orden}</h3>`,
      html: `
        <p style="font-size:14px; color:gray;">Resumen completo de la inspección realizada para la orden de producción.</p>
        <div style="text-align:left; margin-top:10px; font-size:14px;">
          <p><strong>Código OP:</strong> ${row.orden}</p>
          <p><strong>Resultado:</strong> ${row.resultado}</p>
          <p><strong>Producto:</strong> ${row.producto}</p>
          <p><strong>Estado:</strong> ${row.estado}</p>
        </div>
        <table style="width:100%; margin-top:15px; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding:8px; text-align:left;">Criterio de inspección</th>
              <th>Respuesta</th>
              <th>Observaciones</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${
              criteriosHTML ||
              `<tr><td colspan="4" style="text-align:center; color:gray;">Sin detalles registrados</td></tr>`
            }
          </tbody>
        </table>
        <input type="file" id="fileInputHidden" style="display:none;" accept="image/*"/>
      `,
      width: 900,
      confirmButtonText: "Volver al historial",
      showCancelButton: true,
      cancelButtonText: "Exportar reporte",
      cancelButtonColor: "#0f836f",
      confirmButtonColor: "#2f6d6d",
      didOpen: () => {
        // 🔹 Agregar evento a cada botón "Subir foto"
        const botones = Swal.getPopup().querySelectorAll(".btn-upload");
        const inputFile = Swal.getPopup().querySelector("#fileInputHidden");
 
        botones.forEach((btn) => {
          btn.addEventListener("click", () => {
            inputFile.click();
 
            inputFile.onchange = (e) => {
              const archivo = e.target.files[0];
              if (archivo) {
                Swal.fire({
                  icon: "success",
                  title: "Archivo cargado",
                  text: `Se cargó: ${archivo.name}`,
                  confirmButtonColor: "#2f6d6d",
                });
              }
            };
          });
        });
      },
    });
  };
 
  // 🗑️ Confirmar y eliminar con SweetAlert2
  const handleEliminar = async (codigo) => {
    const confirmacion = await Swal.fire({
      icon: "question",
      title: "",
      text: "¿Estás seguro que desea eliminar?",
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "swal2-popup",
        confirmButton: "btn-aceptar",
        cancelButton: "btn-cancelar",
      },
    });
 
    if (confirmacion.isConfirmed) {
      // eliminar de la lista
      setDatos((prev) => prev.filter((item) => item.codigo !== codigo));
 
      await Swal.fire({
        icon: "success",
        title: "El registro fue eliminado",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: "swal2-popup",
        },
      });
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
            Consulte el registro de todas las inspecciones realizadas sobre
            órdenes de producción.
          </p>
 
          <div className="top-actions">
            <button className="btn-incidencia">
              <FaRegEdit size={16} /> Registrar Inspección
            </button>
          </div>
 
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
 
            <button className="btn-resetear">
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
              {datos.map((row, index) => (
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
                      onClick={() => handleEliminar(row.codigo)}
                      style={{ cursor: "pointer", marginLeft: "10px" }}
                    />
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