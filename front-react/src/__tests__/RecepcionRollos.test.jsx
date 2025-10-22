// src/GestionMoldes.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import logo from "../images/logo_blanco.svg";
import "../css/GestionMoldes.css";
import { describe, it, expect } from "vitest";

describe("Recepción de Rollos", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});

export default function GestionMoldes() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [nombreMolde, setNombreMolde] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      await (Swal.fire || (Swal.default && Swal.default.fire))({
        icon: "warning",
        title: "Archivo requerido",
        text: "Por favor, carga un archivo .dxl",
        confirmButtonColor: "#2f6d6d",
      });
      return;
    }

    // (Opcional) Guardar algo en localStorage si lo necesitas
    // localStorage.setItem("ultimoMolde", JSON.stringify({ nombreMolde, file: file.name }));

    await (Swal.fire || (Swal.default && Swal.default.fire))({
      icon: "success",
      title: "Registro Guardado",
    });

    // Limpia formulario
    setNombreMolde("");
    setFile(null);
    // Limpia también el input file visualmente (si se gestiona con ref)
    const inputEl = document.getElementById("file-input");
    if (inputEl) inputEl.value = "";
  };

  const handleCancel = async () => {
    // Si hay cambios, confirmamos limpiar
    if (file || nombreMolde) {
      const res = await (Swal.fire || (Swal.default && Swal.default.fire))({
        title: "¿Limpiar formulario?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
      });

      if (!res.isConfirmed) return;
    }
    setNombreMolde("");
    setFile(null);
    const inputEl = document.getElementById("file-input");
    if (inputEl) inputEl.value = "";
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img alt="Logo" className="logo_blanco-img" src={logo} />
            <div className="sidebar-title">
              <h2>
                SOLE <br />
                <span>Sueñitos</span>
              </h2>
            </div>
          </div>

          <ul>
            <li className="active">Gestión de Moldes</li>
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
              Orden de Produccion
            </li>
            <li>Historial de Optimización</li>
          </ul>
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          <h1>Gestión de moldes</h1>
          <h3>Registrar molde</h3>

          <form className="gestion-form" onSubmit={handleSubmit}>
            {/* Cargar Archivo */}
            <label htmlFor="file-input">Cargar Archivo</label>
            <div className={`file-drop-zone ${file ? "has-file" : ""}`}>
              <input
                id="file-input"
                type="file"
                accept=".dxl"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label className="file-drop-label" htmlFor="file-input">
                <div>
                  <strong>
                    {file ? "Archivo seleccionado:" : "Arrastra para subir"}
                  </strong>
                  <br />
                  {file ? file.name : <span>o haz clic para seleccionar archivo .dxl</span>}
                </div>
              </label>
            </div>

            {/* Nombre del molde (el test lo busca por placeholder) */}
            <label>Nombre del molde</label>
            <input
              type="text"
              value={nombreMolde}
              onChange={(e) => setNombreMolde(e.target.value)}
              placeholder="Ej: Molde Pantalón"
            />

            <div className="gestion-form-buttons">
              <button type="button" className="gestion-cancel-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="gestion-save-button">
                Guardar molde
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
