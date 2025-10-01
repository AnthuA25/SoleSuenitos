import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../css/PasswordInput.css";


function PasswordInput({ value, onChange, placeholder = "Contraseña" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="password-input"
      />
      <span
        className="toggle-icon"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
  );
}

export default PasswordInput;
