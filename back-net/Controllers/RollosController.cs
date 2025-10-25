using Microsoft.AspNetCore.Mvc;
using back_net.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        public class RolloCreateDto
        {
            public string TipoTela { get; set; } = default!;
            public decimal AnchoCm { get; set; }
            public string? Color { get; set; }
            public decimal MetrajeM { get; set; }
            public string? Proveedor { get; set; }
        }
        [HttpPost("registrar")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> RegistrarRollo([FromBody] RolloCreateDto nuevoRollo)
        {
            // Validar
            if (string.IsNullOrEmpty(nuevoRollo.TipoTela))
                return BadRequest(new { message = "Debe ingresar el tipo de tela." });

            if (nuevoRollo.MetrajeM <= 0)
                return BadRequest(new { message = "El metraje debe ser mayor a 0." });

            // Obtener usuario autenticado
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            int? idUsuario = userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;

            // Generar código automáticamente
            var ultimoRollo = await _context.RollosTelas
                .OrderByDescending(r => r.IdRollo)
                .FirstOrDefaultAsync();

            string nuevoCodigo = "R-001";
            if (ultimoRollo != null)
            {
                var numero = int.Parse(ultimoRollo.CodigoRollo.Replace("R-", ""));
                nuevoCodigo = $"R-{(numero + 1).ToString("000")}";
            }


            var rollo = new RollosTela
            {
                CodigoRollo = nuevoCodigo,
                TipoTela = nuevoRollo.TipoTela,
                AnchoCm = nuevoRollo.AnchoCm,
                Color = nuevoRollo.Color,
                MetrajeM = nuevoRollo.MetrajeM,
                Proveedor = nuevoRollo.Proveedor,
                FechaRecepcion = DateTime.UtcNow,
                Estado = "disponible",
                IdUsuarioRegistro = idUsuario
            };

            _context.RollosTelas.Add(rollo);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rollo registrado correctamente.",
                rollo.CodigoRollo,
                rollo.TipoTela,
                rollo.AnchoCm,
                rollo.Color,
                rollo.MetrajeM,
                rollo.Proveedor,
                rollo.FechaRecepcion,
                rollo.Estado,
                rollo.IdUsuarioRegistro
            });
        }

        // listar
        [HttpGet("listar")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> ListarRollos()
        {
            var rollos = await _context.RollosTelas
                .Include(r => r.IdUsuarioRegistroNavigation)
                .OrderByDescending(r => r.FechaRecepcion)
                .Select(r => new
                {
                    r.IdRollo,
                    r.CodigoRollo,
                    r.TipoTela,
                    r.Color,
                    r.AnchoCm,
                    r.MetrajeM,
                    r.Proveedor,
                    r.FechaRecepcion,
                    r.Estado,
                    UsuarioRegistro = r.IdUsuarioRegistroNavigation != null
                        ? r.IdUsuarioRegistroNavigation.NombreCompleto
                        : "Desconocido"
                })
                .ToListAsync();

            return Ok(rollos);
        }

        // get rollo x id
        [HttpGet("{id}")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var rollo = await _context.RollosTelas
                .Include(r => r.IdUsuarioRegistroNavigation)
                .FirstOrDefaultAsync(r => r.IdRollo == id);

            if (rollo == null)
                return NotFound(new { message = "Rollo no encontrado." });

            return Ok(new
            {
                rollo.IdRollo,
                rollo.CodigoRollo,
                rollo.TipoTela,
                rollo.Color,
                rollo.AnchoCm,
                rollo.MetrajeM,
                rollo.Proveedor,
                rollo.FechaRecepcion,
                rollo.Estado,
                UsuarioRegistro = rollo.IdUsuarioRegistroNavigation?.NombreCompleto ?? "Desconocido"
            });
        }

        // buscar por codigo
        [HttpGet("buscar")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> BuscarPorCodigo([FromQuery] string criterio)
        {
            if (string.IsNullOrWhiteSpace(criterio))
                return BadRequest(new { message = "Debe ingresar un criterio de búsqueda (código, tipo, color o proveedor)." });

            criterio = criterio.Trim().ToLower();

            var resultados = await _context.RollosTelas
                .Where(r =>
                    EF.Functions.ILike(r.CodigoRollo, $"%{criterio}%") ||
                    EF.Functions.ILike(r.TipoTela, $"%{criterio}%") ||
                    EF.Functions.ILike(r.Color ?? "", $"%{criterio}%") ||
                    EF.Functions.ILike(r.Proveedor ?? "", $"%{criterio}%"))
                .OrderByDescending(r => r.FechaRecepcion)
                .Select(r => new
                {
                    r.IdRollo,
                    r.CodigoRollo,
                    r.TipoTela,
                    r.Color,
                    r.AnchoCm,
                    r.MetrajeM,
                    r.Proveedor,
                    r.Estado,
                    r.FechaRecepcion
                })
                .ToListAsync();

            if (resultados == null || resultados.Count == 0)
                return NotFound(new { message = "No se encontraron rollos con ese criterio." });

            return Ok(resultados);
        }

        // DTO para edición
        public class UpdateRolloRequest
        {
            public string? CodigoRollo { get; set; }
            public string? TipoTela { get; set; }
            public decimal? AnchoCm { get; set; }
            public string? Color { get; set; }
            public decimal? MetrajeM { get; set; }
            public string? Proveedor { get; set; }
            public string? Estado { get; set; }             //"disponible", "agotado"
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> EditarRollo(int id, [FromBody] UpdateRolloRequest req)
        {
            var rollo = await _context.RollosTelas.FirstOrDefaultAsync(r => r.IdRollo == id);
            if (rollo == null)
                return NotFound(new { message = "Rollo no encontrado." });

            // Validar duplicado de código si se cambia
            if (!string.IsNullOrWhiteSpace(req.CodigoRollo) && req.CodigoRollo != rollo.CodigoRollo)
            {
                bool codigoExiste = await _context.RollosTelas
                    .AnyAsync(r => r.CodigoRollo == req.CodigoRollo && r.IdRollo != id);
                if (codigoExiste)
                    return Conflict(new { message = "Ya existe un rollo con ese código." });

                rollo.CodigoRollo = req.CodigoRollo.Trim();
            }

            // Actualizaciones parciales
            if (!string.IsNullOrWhiteSpace(req.TipoTela)) rollo.TipoTela = req.TipoTela.Trim();
            if (req.AnchoCm.HasValue) rollo.AnchoCm = req.AnchoCm.Value;
            if (req.Color != null) rollo.Color = string.IsNullOrWhiteSpace(req.Color) ? null : req.Color.Trim();
            if (req.MetrajeM.HasValue) rollo.MetrajeM = req.MetrajeM.Value;
            if (req.Proveedor != null) rollo.Proveedor = string.IsNullOrWhiteSpace(req.Proveedor) ? null : req.Proveedor.Trim();
            if (!string.IsNullOrWhiteSpace(req.Estado)) rollo.Estado = req.Estado.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rollo actualizado correctamente.",
                rollo = new
                {
                    rollo.IdRollo,
                    rollo.CodigoRollo,
                    rollo.TipoTela,
                    rollo.AnchoCm,
                    rollo.Color,
                    rollo.MetrajeM,
                    rollo.Proveedor,
                    rollo.Estado,
                    rollo.FechaRecepcion
                }
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> EliminarRollo(int id)
        {
            var rollo = await _context.RollosTelas.FindAsync(id);
            if (rollo == null)
                return NotFound(new { message = "Rollo no encontrado." });

            rollo.Estado = "eliminado";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rollo eliminado correctamente." });
        }
    }
}
