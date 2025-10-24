import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo_blanco from "../../images/logo_blanco.svg";
import "../../css/GestionMoldes.css";
import SidebarMenu from "../../components/SliderMenu";
import UserHeader from "../../components/UserHeader";

function RecepcionRollos() {
  const navigate = useNavigate();
  const [tipoTela, setTipoTela] = useState("");
  const [ancho, setAncho] = useState("");
  const [color, setColor] = useState("");
  const [metraje, setMetraje] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = { nombre: "Sole Suenito" };
  const userInicial = user.nombre.charAt(0).toUpperCase();

  // Guardar datos localmente
  const handleGuardar = (e) => {
    e.preventDefault();

    if (!tipoTela || !ancho || !color || !metraje || !proveedor) {
      Swal.fire({
        title: "¡Error!",
        text: "Por favor complete todos los campos",
        icon: "error",
        confirmButtonColor: "#2f6d6d",
      });
      return;
    }

    const nuevoRollo = {
      id: Date.now(),
      tipoTela,
      ancho,
      color,
      metraje,
      proveedor,
    };

    // Obtener los rollos existentes del localStorage
    const rollosGuardados = JSON.parse(localStorage.getItem("rollos")) || [];

    // Agregar el nuevo rollo
    rollosGuardados.push(nuevoRollo);

    // Guardar de nuevo
    localStorage.setItem("rollos", JSON.stringify(rollosGuardados));

    Swal.fire({
      title: "Registro Guardado",
      text: "La recepción del rollo se guardó correctamente.",
      icon: "success",
      confirmButtonColor: "#2f6d6d",
    });

    // Limpiar campos
    setTipoTela("");
    setAncho("");
    setColor("");
    setMetraje("");
    setProveedor("");
  };

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

  return (
    <div className="gestion-container">
      <div className="gestion-box">
        {/* Sidebar */}
        <div className="gestion-sidebar">
          <div className="sidebar-header">
            <img src={logo_blanco} alt="Logo" className="logo_blanco-img" />
            <div className="sidebar-title">
              <h2>SOLE</h2> <span>Sueñitos</span>
            </div>
          </div>

          <SidebarMenu />
        </div>

        {/* Contenido */}
        <div className="gestion-content">
          {/* Header usuario */}
          <div className="gestion-header">
            <UserHeader nombreUsuario="Sole Sueñitos" />
          </div>

          <h1>Recepción de Rollos</h1>
          <h3>Registro de rollo de tela</h3>

          <form className="gestion-form">
            <label>Tipo de tela</label>
            <input
              type="text"
              value={tipoTela}
              onChange={(e) => setTipoTela(e.target.value)}
              placeholder="Tipo de tela"
              style={{ backgroundColor: "transparent", color: "black" }}
            />

            <div className="gestion-ancho-color">
              <div>
                <label>Ancho (mm)</label>
                <input
                  type="text"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                  placeholder="Ancho"
                  style={{ backgroundColor: "transparent", color: "black" }}
                />
              </div>
              <div>
                <label>Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Color"
                  style={{ backgroundColor: "transparent", color: "black" }}
                />
              </div>
            </div>

            <label>Metraje (m)</label>
            <input
              type="text"
              value={metraje}
              onChange={(e) => setMetraje(e.target.value)}
              placeholder="Metraje"
              style={{ backgroundColor: "transparent", color: "black" }}
            />

            <label>Proveedor</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Proveedor"
              style={{ backgroundColor: "transparent", color: "black" }}
            />

            <div className="gestion-form-buttons">
              <button
                className="gestion-cancel-button"
                onClick={(e) => {
                  e.preventDefault();
                  setTipoTela("");
                  setAncho("");
                  setColor("");
                  setMetraje("");
                  setProveedor("");
                }}
              >
                Cancelar
              </button>
              <button className="gestion-save-button" onClick={handleGuardar}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecepcionRollos;
