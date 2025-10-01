using Microsoft.AspNetCore.Mvc;
using back_net.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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

        // verificar hash
        private bool VerificarContrasena(string contrasena, string hashAlmacenado)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(contrasena));
                var hashIngresado = BitConverter.ToString(bytes).Replace("-", "").ToLower();
                return hashIngresado == hashAlmacenado;
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Usuario nuevo)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Correo == nuevo.Correo))
                return Conflict(new { message = "Correo ya registrado." });

            // Validar datos básicos
            if (string.IsNullOrEmpty(nuevo.Correo) || string.IsNullOrEmpty(nuevo.ContrasenaHash))
                return BadRequest(new { message = "Correo y contraseña son obligatorios." });

            // Encriptar contraseña
            nuevo.ContrasenaHash = CrearHash(nuevo.ContrasenaHash);
            nuevo.CreadoEn =  DateTime.UtcNow;
            nuevo.Activo = true;

            _context.Usuarios.Add(nuevo);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Usuario creado exitosamente.",
                usuario = new
                {
                    nuevo.IdUsuario,
                    nuevo.NombreCompleto,
                    nuevo.Correo,
                    nuevo.IdRole
                }
            });
        }

        private string CrearHash(string contrasena)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(contrasena));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }


    }

    // DTO para recibir datos de login
    public class LoginRequest
    {
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}
