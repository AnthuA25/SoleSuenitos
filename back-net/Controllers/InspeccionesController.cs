using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using back_net.Models;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InspeccionesCalidadController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InspeccionesCalidadController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
        }

        // Registrar nueva inspección
        [HttpPost("registrar")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> RegistrarInspeccion([FromForm] InspeccionCalidadRequest request)
        {
            try
            {
                // Validar existencia de la OP
                var orden = await _context.OrdenProduccions.FindAsync(request.IdOp);
                if (orden == null)
                    return BadRequest(new { message = "La orden de producción no existe." });

                // Generar código incremental IS-2025-001
                var codigo = GenerarCodigoInspeccion();

                byte[]? fotoBytes = null;
                if (request.FotoEvidencia != null)
                {
                    using (var ms = new MemoryStream())
                    {
                        await request.FotoEvidencia.CopyToAsync(ms);
                        fotoBytes = ms.ToArray();
                    }
                }

                var inspeccion = new InspeccionesCalidad
                {
                    CodigoInspeccion = codigo,
                    IdOp = request.IdOp,
                    IdUsuarioInspector = request.IdUsuarioInspector,
                    FechaInspeccion = DateTime.UtcNow,
                    PiezasUnidas = request.PiezasUnidas,
                    TelaSinDefectos = request.TelaSinDefectos,
                    CosturasOk = request.CosturasOk,
                    ListaParaEntrega = request.ListaParaEntrega,
                    Observaciones = request.Observaciones,
                    FotoEvidencia = fotoBytes,
                    ResultadoFinal = request.ResultadoFinal,
                    NotaAdicional = request.NotaAdicional
                };

                _context.InspeccionesCalidads.Add(inspeccion);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Inspección registrada correctamente.",
                    codigo = inspeccion.CodigoInspeccion
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al registrar inspección: {ex.Message}" });
            }
        }

        // ============================================
        // 2️⃣ Listar historial de inspecciones
        // ============================================
        [HttpGet("listar")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ListarInspecciones()
        {
            try
            {
                var inspecciones = await _context.InspeccionesCalidads
                    .Include(i => i.IdOpNavigation)
                    .OrderByDescending(i => i.FechaInspeccion)
                    .Select(i => new
                    {
                        i.IdInspeccion,
                        i.CodigoInspeccion,
                        Producto = i.IdOpNavigation.Modelo,
                        Fecha = i.FechaInspeccion,
                        OrdenProduccion = i.IdOpNavigation.CodigoOp,
                        Resultado = i.ResultadoFinal,
                        Estado = "Finalizado"
                    })
                    .ToListAsync();

                return Ok(inspecciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al listar inspecciones: {ex.Message}" });
            }
        }

        // ============================================
        // 3️⃣ Obtener detalles de una inspección
        // ============================================
        [HttpGet("detalle/{id}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ObtenerDetalle(int id)
        {
            try
            {
                var inspeccion = await _context.InspeccionesCalidads
                    .Include(i => i.IdOpNavigation)
                    .Include(i => i.IdUsuarioInspectorNavigation)
                    .FirstOrDefaultAsync(i => i.IdInspeccion == id);

                if (inspeccion == null)
                    return NotFound(new { message = "Inspección no encontrada" });

                return Ok(new
                {
                    inspeccion.IdInspeccion,
                    inspeccion.CodigoInspeccion,
                    inspeccion.IdOpNavigation.CodigoOp,
                    Producto = inspeccion.IdOpNavigation.Modelo,
                    inspeccion.FechaInspeccion,
                    Inspector = inspeccion.IdUsuarioInspectorNavigation?.NombreCompleto ?? "Sin asignar",
                    inspeccion.PiezasUnidas,
                    inspeccion.TelaSinDefectos,
                    inspeccion.CosturasOk,
                    inspeccion.ListaParaEntrega,
                    inspeccion.Observaciones,
                    FotoEvidencia = inspeccion.FotoEvidencia != null ? 
                        Convert.ToBase64String(inspeccion.FotoEvidencia) : null,
                    inspeccion.ResultadoFinal,
                    inspeccion.NotaAdicional
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener detalles: {ex.Message}" });
            }
        }

        // ============================================
        // 4️⃣ Eliminar una inspección
        // ============================================
        [HttpDelete("eliminar/{id}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                var inspeccion = await _context.InspeccionesCalidads.FindAsync(id);
                if (inspeccion == null)
                    return NotFound(new { message = "Inspección no encontrada." });

                _context.InspeccionesCalidads.Remove(inspeccion);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Inspección eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar inspección: {ex.Message}" });
            }
        }

        // ============================================
        // 5️⃣ Generar código incremental (IS-2025-001)
        // ============================================
        private string GenerarCodigoInspeccion()
        {
            var ultimo = _context.InspeccionesCalidads
                .OrderByDescending(i => i.IdInspeccion)
                .Select(i => i.CodigoInspeccion)
                .FirstOrDefault();

            if (string.IsNullOrEmpty(ultimo)) return "IS-2025-001";
            var num = int.Parse(ultimo.Replace("IS-2025-", ""));
            return $"IS-2025-{(num + 1):D3}";
        }
    }

    // ============================================
    // DTO (Request Model)
    // ============================================
    public class InspeccionCalidadRequest
    {
        public int IdOp { get; set; }
        public int? IdUsuarioInspector { get; set; }

        // Checklist
        public bool? PiezasUnidas { get; set; }
        public bool? TelaSinDefectos { get; set; }
        public bool? CosturasOk { get; set; }
        public bool? ListaParaEntrega { get; set; }

        // Información adicional
        public string? Observaciones { get; set; }
        public IFormFile? FotoEvidencia { get; set; }
        public string? ResultadoFinal { get; set; }
        public string? NotaAdicional { get; set; }
    }
}
