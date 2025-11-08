using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_net.Models;
using System.Text;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InspeccionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InspeccionesController> _logger;

        public InspeccionesController(AppDbContext context, ILogger<InspeccionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: Registrar inspección
        [HttpPost]
        public async Task<IActionResult> RegistrarInspeccion([FromBody] RegisterInspeccionDto dto)
        {
            if (dto.IdOp <= 0)
                return BadRequest(new { message = "IdOp inválido." });

            var orden = await _context.OrdenProduccions.FindAsync(dto.IdOp);
            if (orden == null)
                return NotFound(new { message = "Orden de producción no encontrada." });

            if (dto.IdUsuarioInspector.HasValue)
            {
                var inspector = await _context.Usuarios.FindAsync(dto.IdUsuarioInspector.Value);
                if (inspector == null)
                    return NotFound(new { message = "Inspector no encontrado." });
            }

            string codigo = string.IsNullOrWhiteSpace(dto.CodigoInspeccion)
                ? $"IS-{DateTime.UtcNow.Year}-{await _context.InspeccionesCalidads.CountAsync() + 1:0000}"
                : dto.CodigoInspeccion;

            var inspeccion = new InspeccionesCalidad
            {
                CodigoInspeccion = codigo,
                IdOp = dto.IdOp,
                IdUsuarioInspector = dto.IdUsuarioInspector,
                FechaInspeccion = DateTime.UtcNow,
                PiezasUnidas = dto.PiezasUnidas,
                TelaSinDefectos = dto.TelaSinDefectos,
                CosturasOk = dto.CosturasOk,
                ListaParaEntrega = dto.ListaParaEntrega,
                Observaciones = dto.Observaciones,
                ResultadoFinal = dto.ResultadoFinal ?? "pendiente"
            };

            if (!string.IsNullOrEmpty(dto.FotoEvidenciaBase64))
            {
                try
                {
                    inspeccion.FotoEvidencia = Convert.FromBase64String(dto.FotoEvidenciaBase64);
                }
                catch
                {
                    return BadRequest(new { message = "FotoEvidenciaBase64 no es válida." });
                }
            }

            _context.InspeccionesCalidads.Add(inspeccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerInspeccionPorId), new { id = inspeccion.IdInspeccion }, new InspeccionDto(inspeccion));
        }

        // GET: Listar todas las inspecciones
        [HttpGet]
        public async Task<IActionResult> ListarInspecciones()
        {
            var inspecciones = await _context.InspeccionesCalidads
                .Include(i => i.IdOpNavigation)
                .Include(i => i.IdUsuarioInspectorNavigation)
                .OrderByDescending(i => i.FechaInspeccion)
                .ToListAsync();

            return Ok(inspecciones.Select(i => new InspeccionDto(i)));
        }

        // GET: Obtener inspección por ID
        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerInspeccionPorId(int id)
        {
            var insp = await _context.InspeccionesCalidads
                .Include(i => i.IdOpNavigation)
                .Include(i => i.IdUsuarioInspectorNavigation)
                .FirstOrDefaultAsync(i => i.IdInspeccion == id);

            if (insp == null)
                return NotFound(new { message = "Inspección no encontrada." });

            return Ok(new InspeccionDto(insp));
        }

        // GET: Historial por Orden de Producción
        [HttpGet("/api/ordenes/{id}/inspecciones")]
        public async Task<IActionResult> HistorialInspeccionesPorOrden(int id)
        {
            bool existe = await _context.OrdenProduccions.AnyAsync(o => o.IdOp == id);
            if (!existe)
                return NotFound(new { message = "Orden no encontrada." });

            var historial = await _context.InspeccionesCalidads
                .Where(i => i.IdOp == id)
                .OrderByDescending(i => i.FechaInspeccion)
                .ToListAsync();

            return Ok(historial.Select(i => new InspeccionDto(i)));
        }

        // GET: Listar órdenes activas
        [HttpGet("/api/ordenes")]
        public async Task<IActionResult> ListarOrdenes()
        {
            var ordenes = await _context.OrdenProduccions
                .Include(o => o.Optimizaciones)
                .OrderByDescending(o => o.FechaCreacion)
                .Select(o => new
                {
                    o.IdOp,
                    o.CodigoOp,
                    o.Modelo,
                    o.Talla,
                    o.Cantidad,
                    o.Estado,
                    o.FechaEntrega,
                    o.Comentarios
                })
                .ToListAsync();

            return Ok(ordenes);
        }

        // DELETE: Eliminar inspección
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarInspeccion(int id)
        {
            var insp = await _context.InspeccionesCalidads.FindAsync(id);
            if (insp == null)
                return NotFound(new { message = "Inspección no encontrada." });

            _context.InspeccionesCalidads.Remove(insp);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inspección eliminada correctamente." });
        }

        // GET: Exportar reporte PDF
        [HttpGet("{id:int}/reporte")]
        public async Task<IActionResult> ExportarReportePDF(int id)
        {
            var insp = await _context.InspeccionesCalidads
                .Include(i => i.IdOpNavigation)
                .Include(i => i.IdUsuarioInspectorNavigation)
                .FirstOrDefaultAsync(i => i.IdInspeccion == id);

            if (insp == null)
                return NotFound(new { message = "Inspección no encontrada." });

            var contenido = new StringBuilder();
            contenido.AppendLine($"Reporte de Inspección - {insp.CodigoInspeccion}");
            contenido.AppendLine($"Orden Producción: {insp.IdOpNavigation?.CodigoOp}");
            contenido.AppendLine($"Producto: {insp.IdOpNavigation?.Modelo}");
            contenido.AppendLine($"Inspector: {insp.IdUsuarioInspectorNavigation?.NombreCompleto}");
            contenido.AppendLine($"Fecha: {insp.FechaInspeccion}");
            contenido.AppendLine($"Resultado Final: {insp.ResultadoFinal}");
            contenido.AppendLine($"Observaciones: {insp.Observaciones}");

            var bytes = Encoding.UTF8.GetBytes(contenido.ToString());
            return File(bytes, "application/pdf", $"{insp.CodigoInspeccion}_reporte.pdf");
        }
    }
}
