import { useState } from "react";
import "../../css/Login.css";
import PasswordInput from "../../components/PasswordInput";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 
import { login } from "../../api/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRecovering) {
      if (newPassword !== confirmPassword) {
        Swal.fire("Error", "Las contraseñas no coinciden", "error");
        return;
      }
      Swal.fire("Listo", "Tu contraseña se actualizó correctamente.", "success");
      setIsRecovering(false);
      return;
    }

    if (!email || !password) {
      Swal.fire("Error", "Debes ingresar tus credenciales", "error");
      return;
    }

    try {
      const data = await login(email, password);

      Swal.fire("Éxito", data.message, "success").then(() => {
        const usuario = data.usuario;
        localStorage.setItem("usuario", JSON.stringify(usuario));

        // Redirección según el rol
        const rol = usuario.rol?.toLowerCase();
        if (rol.includes("logística")) navigate("/recepcionrollos");
        else if (rol.includes("operario")) navigate("/moldes");
        else if (rol.includes("calidad")) navigate("/historialmoldes");
        else navigate("/moldes");
      });
    } catch (error) {
      Swal.fire("Error", error.message || "Ocurrió un error inesperado.", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="src/images/logo.svg" alt="logo" className="logo" />
          <h1>
            SOLE <br /> <span>Sueñitos</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {!isRecovering ? (
            <>
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sole.suenitos.com"
              />

              <label>Contraseña</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />

              <a href="#" className="forgot" onClick={() => setIsRecovering(true)}>
                ¿Olvidaste tu contraseña?
              </a>

              <button type="submit">Iniciar Sesión</button>
            </>
          ) : (
            <>
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sole.suenitos.com"
              />

              <label>Nueva Contraseña</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva Contraseña"
              />

              <label>Confirmar Contraseña</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Contraseña"
              />

              <button type="submit">Recuperar Contraseña</button>

              <a href="#" className="forgot" onClick={() => setIsRecovering(false)}>
                Volver al inicio de sesión
              </a>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
