import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "./images/logo_blanco.svg"; 
import "./css/GestionMoldes.css";

function GestionMoldes() {
  const [file, setFile] = useState(null);
  const [nombreMolde, setNombreMolde] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Mostrar modal de confirmación de archivo
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
    if (droppedFile && droppedFile.name.endsWith('.dxl')) {
      setFile(droppedFile);
      showFileConfirmModal(droppedFile);
    } else {
      Swal.fire({
        title: "Formato incorrecto",
        text: "Por favor, sube un archivo .dxl",
        icon: "error",
        confirmButtonColor: '#2f6d6d'
      });
    }
  };

  // Modal para confirmar subida de archivo
  const showFileConfirmModal = (selectedFile) => {
    Swal.fire({
      title: 'Subir archivo',
      html: `
        <div style="text-align: center;">
          <p><strong>${selectedFile.name}</strong></p>
          <p>¿Quieres subir este archivo?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2f6d6d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar',
      showDenyButton: true,
      denyButtonText: 'Eliminar molde',
      denyButtonColor: '#ff6b6b'
    }).then((result) => {
      if (result.isConfirmed) {
        // Archivo confirmado, se mantiene
        Swal.fire({
          title: '¡Archivo cargado!',
          text: 'El archivo se ha cargado correctamente',
          icon: 'success',
          confirmButtonColor: '#2f6d6d',
          timer: 2000
        });
      } else if (result.isDenied) {
        // Eliminar archivo
        setFile(null);
        // Limpiar input file
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        Swal.fire({
          title: 'Archivo eliminado',
          text: 'El archivo ha sido removido',
          icon: 'info',
          confirmButtonColor: '#2f6d6d',
          timer: 1500
        });
      } else {
        // Cancelar - eliminar archivo
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!file) {
      Swal.fire({
        title: "Archivo requerido",
        text: "Por favor, carga un archivo .dxl",
        icon: "warning",
        confirmButtonColor: '#2f6d6d'
      });
      return;
    }

    if (!nombreMolde.trim()) {
      Swal.fire({
        title: "Nombre requerido",
        text: "Por favor, ingresa un nombre para el molde",
        icon: "warning",
        confirmButtonColor: '#2f6d6d'
      });
      return;
    }

    // Mostrar modal de confirmación final
    Swal.fire({
      title: 'Confirmar registro',
      html: `
        <div style="text-align: left;">
          <p><strong>Nombre del molde:</strong> ${nombreMolde}</p>
          <p><strong>Archivo:</strong> ${file.name}</p>
          <p>¿Estás seguro de que quieres registrar este molde?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2f6d6d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Registrar molde
        console.log("Molde guardado:", { file, nombreMolde });
        
        // Mostrar modal de éxito
        Swal.fire({
          title: "¡Registro exitoso!",
          text: "El molde se ha registrado correctamente",
          icon: "success",
          confirmButtonColor: '#2f6d6d',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Resetear formulario después del éxito
          setFile(null);
          setNombreMolde("");
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = '';
        });
      }
    });
  };

  const handleCancel = () => {
    if (file || nombreMolde) {
      Swal.fire({
        title: 'Cancelar registro',
        text: "¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f6d6d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          setFile(null);
          setNombreMolde("");
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = '';
        }
      });
    } else {
      setFile(null);
      setNombreMolde("");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "¿Estás seguro de que quieres salir del sistema?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2f6d6d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          icon: 'success',
          confirmButtonColor: '#2f6d6d',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar verde */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE <br /> <span>Sueñitos</span></h2>
            </div>
          </div>  
            <ul>
              <li className="active">Gestión de Moldes</li>
              <li onClick={() => navigate("/historialmoldes")}>Historial de Moldes</li>
              <li onClick={() => navigate("/recepcionrollos")}>Recepción de Rollos</li>
              <li>Historial de Rollos</li>
              <li>Orden de Producción</li>
              <li>Historial de Optimización</li>
            </ul>
          
          <button className="gestion-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido blanco */}
        <div className="gestion-content">
          <h1>Gestión de moldes</h1>
          <h3>Registrar molde</h3>

          <form onSubmit={handleSubmit} className="gestion-form">
            <label>Cargar Archivo</label>
            <div 
              className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept=".dxl"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="file-drop-label">
                {file ? (
                  <div>
                    <strong>Archivo seleccionado:</strong><br />
                    {file.name}
                  </div>
                ) : (
                  <div>
                    <strong>Arrastra para subir</strong><br />
                    <span>o haz clic para seleccionar archivo .dxl</span>
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
            />

            <div className="gestion-form-buttons">
              <button 
                type="button" 
                className="gestion-cancel-button"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="gestion-save-button"
              >
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
/*aca me quede jeje*/