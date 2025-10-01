import { useState } from "react";
import "./css/Login.css";
import PasswordInput from "./components/PasswordInput";

function Login() {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRecovering) {
      console.log("Recuperar contraseña:", { email, newPassword, confirmPassword });
    } else {
      console.log("Login:", { email, rol, password });
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
          {!isRecovering && (
            <>
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sole.suenitos.com"
              />

              <label>Rol</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="">Selecciona un rol</option>
                <option value="logistica">Encargado de Logística</option>
                <option value="admin">Operario de Corte</option>
                <option value="ventas">Inspector de Calidad</option>
              </select>

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
          )}

          {isRecovering && (
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
