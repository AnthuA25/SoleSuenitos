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


            string estado = nuevoRollo.MetrajeM == 0 ? "agotado" : "disponible";
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
                Estado = estado,
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
                .Where(r => r.Estado == "disponible" || r.Estado == "agotado")
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
        [HttpGet("filtrar")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> FiltrarRollos([FromQuery] string? campo, [FromQuery] string? criterio, [FromQuery] string? estado)
        {
            // Base query
            var query = _context.RollosTelas.AsQueryable();

            // Si hay criterio, aplica según el campo
            if (!string.IsNullOrWhiteSpace(criterio))
            {
                string crit = criterio.Trim().ToLower();

                switch (campo?.ToLower())
                {
                    case "codigo":
                        query = query.Where(r => EF.Functions.ILike(r.CodigoRollo, $"%{crit}%"));
                        break;
                    case "metraje":
                        if (decimal.TryParse(crit, out decimal m))
                            query = query.Where(r => r.MetrajeM == m);
                        break;
                    case "color":
                        query = query.Where(r => EF.Functions.ILike(r.Color ?? "", $"%{crit}%"));
                        break;
                    case "tipotela":
                        query = query.Where(r => EF.Functions.ILike(r.TipoTela, $"%{crit}%"));
                        break;
                    case "ancho":
                        if (decimal.TryParse(crit, out decimal a))
                            query = query.Where(r => r.AnchoCm == a);
                        break;
                    case "proveedor":
                        query = query.Where(r => EF.Functions.ILike(r.Proveedor ?? "", $"%{crit}%"));
                        break;
                    default:
                        // Si no se especifica campo, busca en todos
                        query = query.Where(r =>
                            EF.Functions.ILike(r.CodigoRollo, $"%{crit}%") ||
                            EF.Functions.ILike(r.TipoTela, $"%{crit}%") ||
                            EF.Functions.ILike(r.Color ?? "", $"%{crit}%") ||
                            EF.Functions.ILike(r.Proveedor ?? "", $"%{crit}%"));
                        break;
                }
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                string est = estado.Trim().ToLower();
                query = query.Where(r => r.Estado.ToLower() == est);
            }

            var resultados = await query
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
                    r.Estado
                })
                .ToListAsync();

            if (resultados.Count == 0)
                return NotFound(new { message = "No se encontraron rollos con los filtros aplicados." });

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


            if (!string.IsNullOrWhiteSpace(req.TipoTela)) rollo.TipoTela = req.TipoTela.Trim();
            if (req.AnchoCm.HasValue) rollo.AnchoCm = req.AnchoCm.Value;
            if (req.Color != null) rollo.Color = string.IsNullOrWhiteSpace(req.Color) ? null : req.Color.Trim();
            if (req.MetrajeM.HasValue)
            {
                rollo.MetrajeM = req.MetrajeM.Value;
                rollo.Estado = req.MetrajeM.Value == 0 ? "agotado" : "disponible";
            }
            if (req.Proveedor != null) rollo.Proveedor = string.IsNullOrWhiteSpace(req.Proveedor) ? null : req.Proveedor.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rollo actualizado correctamente.",
                rollo.IdRollo,
                rollo.CodigoRollo,
                rollo.TipoTela,
                rollo.AnchoCm,
                rollo.Color,
                rollo.MetrajeM,
                rollo.Proveedor,
                rollo.Estado,
                rollo.FechaRecepcion
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> EliminarRollo(int id)
        {
            var rollo = await _context.RollosTelas.FindAsync(id);
            if (rollo == null)
                return NotFound(new { message = "Rollo no encontrado." });

            // Eliminar físico:
            _context.RollosTelas.Remove(rollo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rollo eliminado correctamente." });
        }
    }
}
