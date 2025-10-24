import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../css/UserHeader.css";

function UserHeader() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");

  useEffect(() => {

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (usuario && usuario.nombreCompleto) {
        setNombreUsuario(usuario.nombreCompleto);
      } else if (usuario && usuario.nombre) {

        setNombreUsuario(usuario.nombre);
      }
    } catch (error) {
      console.warn("⚠️ No se pudo leer usuario desde localStorage", error);
    }
  }, []);

  const userInicial = nombreUsuario ? nombreUsuario.charAt(0).toUpperCase() : "U";

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
      if (result.isConfirmed) {
        // Limpiar localStorage
        localStorage.removeItem("usuario");
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente",
          icon: "success",
          confirmButtonColor: "#2f6d6d",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/"); 
        });
      }
    });
  };

  return (
    <div className="user-menu-container">
      <div
        className="user-button"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <div className="user-circle">{userInicial}</div>
        <span className="user-name">{nombreUsuario}</span>
      </div>

      {showUserMenu && (
        <div className="user-dropdown_sesion">
          <button className="botoncerrarsesion" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default UserHeader;
