import { useState } from "react";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import SidebarMenu from "../../components/SliderMenu";
import { registrarMolde } from "../../api/moldeService";
import UserHeader from "../../components/UserHeader";

function GestionMoldes() {
  const [file, setFile] = useState(null);
  const [nombreMolde, setNombreMolde] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      showFileConfirmModal(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".dxf")) {
      setFile(droppedFile);
      showFileConfirmModal(droppedFile);
    } else {
      Swal.fire({
        title: "Formato incorrecto",
        text: "Por favor, sube un archivo .dxf",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  const showFileConfirmModal = (selectedFile) => {
    Swal.fire({
      title: "Subir archivo",
      html: `
        <div style="text-align: center;">
          <p><strong>${selectedFile.name}</strong></p>
          <p>¿Quieres subir este archivo?</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      showDenyButton: true,
      denyButtonText: "Eliminar molde",
      denyButtonColor: "#ff6b6b",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Archivo cargado!",
          text: "El archivo se ha cargado correctamente",
          icon: "success",
          confirmButtonColor: "#2f6d6d",
          timer: 2000,
        });
      } else if (result.isDenied) {
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        Swal.fire({
          title: "Archivo eliminado",
          text: "El archivo ha sido removido",
          icon: "info",
          confirmButtonColor: "#2f6d6d",
          timer: 1500,
        });
      } else {
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        title: "Archivo requerido",
        text: "Por favor, carga un archivo .dxf",
        icon: "warning",
        confirmButtonColor: "#2f6d6d",
      });
      return;
    }

    if (!nombreMolde.trim()) {
      Swal.fire({
        title: "Nombre requerido",
        text: "Por favor, ingresa un nombre para el molde",
        icon: "warning",
        confirmButtonColor: "#2f6d6d",
      });
      return;
    }

    // Confirmar antes de enviar
    const confirm = await Swal.fire({
      title: "Confirmar registro",
      html: `
      <div style="text-align: left;">
        <p><strong>Nombre del molde:</strong> ${nombreMolde}</p>
        <p><strong>Archivo:</strong> ${file.name}</p>
        <p>¿Estás seguro de que quieres registrar este molde?</p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2f6d6d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await registrarMolde(file, nombreMolde);

      Swal.fire({
        title: "¡Registro exitoso!",
        text: response.message || "El molde se ha registrado correctamente.",
        icon: "success",
        confirmButtonColor: "#2f6d6d",
      }).then(() => {
        setFile(null);
        setNombreMolde("");
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      });
    } catch (error) {
      console.error("Error al registrar molde:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo registrar el molde.",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
    }
  };

  const handleCancel = () => {
    if (file || nombreMolde) {
      Swal.fire({
        title: "Cancelar registro",
        text: "¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2f6d6d",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      }).then((result) => {
        if (result.isConfirmed) {
          setFile(null);
          setNombreMolde("");
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = "";
        }
      });
    } else {
      setFile(null);
      setNombreMolde("");
    }
  };


  return (
    <div className="gestion-container">
      <div className="gestion-box">
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
        <div className="gestion-content">
          {/* HEADER superior */}
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <h1>Gestión de moldes</h1>
          <h3>Registrar molde</h3>

          <form onSubmit={handleSubmit} className="gestion-form">
            <label>Cargar Archivo</label>
            <div
              className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".dxf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input" className="file-drop-label">
                {file ? (
                  <div>
                    <strong>Archivo seleccionado:</strong>
                    <br />
                    {file.name}
                  </div>
                ) : (
                  <div>
                    <strong>Arrastra para subir</strong>
                    <br />
                    <span>o haz clic para seleccionar archivo .dxf</span>
                  </div>
                )}
              </label>
            </div>

            <label>Nombre del molde</label>
            <input
              type="text"
              value={nombreMolde}
              onChange={(e) => setNombreMolde(e.target.value)}
              placeholder="Ej: Molde Pantalón"
              style={{ backgroundColor: "#e0f7fa", color: "black" }}
            />

            <div className="gestion-form-buttons">
              <button
                type="button"
                className="gestion-cancel-button"
                onClick={handleCancel}
              >
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

export default GestionMoldes;
