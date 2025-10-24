using System.ComponentModel.DataAnnotations;

namespace back_net.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "El correo es obligatorio.")]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pe|net)$",
            ErrorMessage = "El correo debe tener un formato válido (ejemplo: usuario@dominio.com).")]
        public string Correo { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$",
            ErrorMessage = "La contraseña debe tener al menos 6 caracteres, incluir letras y números.")]
        public string Contrasena { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre completo es obligatorio.")]
        public string NombreCompleto { get; set; } = string.Empty;

        public short IdRole { get; set; }
    }
}
