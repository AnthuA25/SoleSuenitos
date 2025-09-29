import { useState } from "react";
import "./Login.css"; 

function Login() {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, rol, password });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        <div className="login-header">
          <img src="/vite.svg" alt="logo" className="logo" />
          <h1>
            SOLE <br /> <span>Sueñitos</span>
          </h1>
        </div>

     
        <form onSubmit={handleSubmit}>
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
            <option value="admin">Administrador</option>
            <option value="ventas">Encargado de Ventas</option>
          </select>

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

          <a href="#" className="forgot">
            ¿Olvidaste tu contraseña?
          </a>

          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
