using Microsoft.AspNetCore.Mvc;
using back_net.Models;
using Microsoft.EntityFrameworkCore;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RollosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RollosController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpPost]
        public async Task<IActionResult> RegistrarRollo([FromBody] RollosTela nuevoRollo)
        {
            // Validar
            if (string.IsNullOrEmpty(nuevoRollo.CodigoRollo) || string.IsNullOrEmpty(nuevoRollo.TipoTela))
                return BadRequest(new { message = "Código de rollo y tipo de tela son obligatorios." });

            // Verificar si el código ya existe
            bool existe = await _context.RollosTelas.AnyAsync(r => r.CodigoRollo == nuevoRollo.CodigoRollo);
            if (existe)
                return Conflict(new { message = "Ya existe un rollo con ese código." });

            nuevoRollo.FechaRecepcion = DateTime.UtcNow;
            nuevoRollo.Estado = "disponible";

            _context.RollosTelas.Add(nuevoRollo);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rollo registrado correctamente.",
                rollo = nuevoRollo
            });
        }

        // listar
        [HttpGet]
        public async Task<IActionResult> ListarRollos()
        {
            var rollos = await _context.RollosTelas
                .Include(r => r.IdUsuarioRegistroNavigation)
                .ToListAsync();

            return Ok(rollos);
        }

        // get rollo x id
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var rollo = await _context.RollosTelas.FindAsync(id);
            if (rollo == null)
                return NotFound(new { message = "Rollo no encontrado." });

            return Ok(rollo);
        }

        // buscar por codigo
        [HttpGet("buscar")]
        public async Task<IActionResult> BuscarPorCodigo([FromQuery] string codigo)
        {
            if (string.IsNullOrEmpty(codigo))
                return BadRequest(new { message = "Debe proporcionar un código de rollo." });

            var rollo = await _context.RollosTelas
                .FirstOrDefaultAsync(r => r.CodigoRollo == codigo);

            if (rollo == null)
                return NotFound(new { message = "No se encontró un rollo con ese código." });

            return Ok(rollo);
        }
    }
}
