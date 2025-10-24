using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using back_net.Models;


namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Correo) || string.IsNullOrEmpty(request.Contrasena))
                return BadRequest(new { message = "Correo y contraseña son obligatorios." });

            // Buscar usuario por correo
            var usuario = await _context.Usuarios
                .Include(u => u.IdRoleNavigation)
                .FirstOrDefaultAsync(u => u.Correo == request.Correo && u.Activo == true);

            if (usuario == null)
                return Unauthorized(new { message = "Usuario no encontrado o inactivo." });

            // Validar contraseña HASH
            if (!VerificarContrasena(request.Contrasena, usuario.ContrasenaHash))
                return Unauthorized(new { message = "Contraseña incorrecta." });

            // Generar token JWT con rol incluido
            var token = GenerarJwtToken(usuario);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,        
                Secure = true,          
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(8)
            });

            // Actualizar último acceso
            usuario.UltimoAcceso = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Inicio de sesión exitoso",
                usuario = new
                {
                    usuario.IdUsuario,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    Rol = usuario.IdRoleNavigation.NombreRole,
                    usuario.UltimoAcceso
                }
            });
        }



        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest nuevo)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Correo == nuevo.Correo))
                return Conflict(new { message = "Correo ya registrado." });

            // Validar datos básicos

            if (!EsCorreoValido(nuevo.Correo))
                return BadRequest(new { message = "El correo debe tener un formato válido (@ y .com)." });

            if (string.IsNullOrEmpty(nuevo.Contrasena) || nuevo.Contrasena.Length < 6)
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres." });

            if (string.IsNullOrEmpty(nuevo.Correo) || string.IsNullOrEmpty(nuevo.Contrasena))
                return BadRequest(new { message = "Correo y contraseña son obligatorios." });

            // Crear hash de contraseña
            string hash = CrearHash(nuevo.Contrasena);

            // Crear entidad Usuario
            var usuario = new Usuario
            {
                NombreCompleto = nuevo.NombreCompleto,
                Correo = nuevo.Correo,
                ContrasenaHash = hash,
                IdRole = (short)nuevo.IdRole,
                Activo = true,
                CreadoEn = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Usuario creado exitosamente.",
                usuario = new
                {
                    usuario.IdUsuario,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    usuario.IdRole
                }
            });
        }

        private string CrearHash(string contrasena)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(contrasena));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }

        // verificar hash
        private bool VerificarContrasena(string contrasena, string hashAlmacenado)
        {
            var hashIngresado = CrearHash(contrasena);
            return hashIngresado == hashAlmacenado;
        }

        private bool EsCorreoValido(string correo)
        {
            return correo.Contains("@") && correo.EndsWith(".com", StringComparison.OrdinalIgnoreCase);
        }

        private string GenerarJwtToken(Usuario usuario)
        {
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
            if (string.IsNullOrEmpty(jwtSecret))
                throw new Exception("JWT_SECRET no está definido en .env");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreCompleto),
                new Claim(ClaimTypes.Email, usuario.Correo),
                new Claim(ClaimTypes.Role, usuario.IdRoleNavigation.NombreRole)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTO para recibir datos de login
    public class LoginRequest
    {
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public int IdRole { get; set; }
    }
}
