using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_net.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InspeccionesCalidadController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InspeccionesCalidadController(AppDbContext context)
        {
            _context = context;
        }

        // Registrar una nueva inspección
        [HttpPost("registrar")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> RegistrarInspeccion([FromBody] InspeccionCreateDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Datos inválidos" });

            var orden = await _context.OrdenProduccions.FindAsync(dto.IdOp);
            if (orden == null)
                return NotFound(new { message = "Orden de producción no encontrada" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "Usuario no autenticado" });
            int idUsuarioInspector = int.Parse(userIdClaim.Value);

            // Generar código único sin duplicar
            var ultimoCodigo = await _context.InspeccionesCalidads
                .OrderByDescending(i => i.IdInspeccion)
                .Select(i => i.CodigoInspeccion)
                .FirstOrDefaultAsync();

            int siguienteNumero = 1;
            if (!string.IsNullOrEmpty(ultimoCodigo))
            {
                var partes = ultimoCodigo.Split('-');
                if (partes.Length == 3 && int.TryParse(partes[2], out int numero))
                    siguienteNumero = numero + 1;
            }

            var año = DateTime.UtcNow.Year;
            var codigo = $"IS-{año}-{siguienteNumero:D3}";

            string observacionesTexto = dto.Observaciones != null
                ? string.Join(" | ", dto.Observaciones)
                : "";

            var inspeccion = new InspeccionesCalidad
            {
                IdOp = dto.IdOp,
                IdUsuarioInspector = idUsuarioInspector,
                CodigoInspeccion = codigo,
                FechaInspeccion = DateTime.UtcNow,
                PiezasUnidas = dto.PiezasUnidas,
                TelaSinDefectos = dto.TelaSinDefectos,
                CosturasOk = dto.CosturasOk,
                ListaParaEntrega = dto.ListaParaEntrega,
                Observaciones = observacionesTexto,
                ResultadoFinal = dto.ResultadoFinal,
                NotaAdicional = dto.NotaAdicional
            };

            _context.InspeccionesCalidads.Add(inspeccion);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Inspección registrada correctamente",
                inspeccion = new
                {
                    inspeccion.CodigoInspeccion,
                    inspeccion.IdOp,
                    inspeccion.ResultadoFinal,
                    inspeccion.FechaInspeccion
                }
            });
        }



        // Listar historial de inspecciones
        [HttpGet("listar")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ListarInspecciones()
        {
            var inspecciones = await _context.InspeccionesCalidads
                .Include(i => i.IdOpNavigation)
                .Include(i => i.IdUsuarioInspectorNavigation)
                .OrderByDescending(i => i.FechaInspeccion)
                .Select(i => new
                {
                    i.IdInspeccion,
                    i.CodigoInspeccion,
                    Fecha = i.FechaInspeccion,
                    Producto = i.IdOpNavigation.Modelo,
                    OrdenProduccion = i.IdOpNavigation.CodigoOp,
                    Resultado = i.ResultadoFinal,
                    Estado = "Finalizado",
                    Inspector = i.IdUsuarioInspectorNavigation.NombreCompleto
                })
                .ToListAsync();

            return Ok(inspecciones);
        }

        // 🔍 Ver detalle de una inspección
        [HttpGet("{id}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ObtenerInspeccion(int id)
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
                inspeccion.FechaInspeccion,
                inspeccion.ResultadoFinal,
                inspeccion.NotaAdicional,
                inspeccion.Observaciones,
                inspeccion.PiezasUnidas,
                inspeccion.TelaSinDefectos,
                inspeccion.CosturasOk,
                inspeccion.ListaParaEntrega,
                Producto = inspeccion.IdOpNavigation.Modelo,
                CodigoOp = inspeccion.IdOpNavigation.CodigoOp,
                Cantidad = inspeccion.IdOpNavigation.Cantidad,
                Inspector = inspeccion.IdUsuarioInspectorNavigation.NombreCompleto
            });
        }

        // 🗑️ Eliminar inspección
        [HttpDelete("{id}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> EliminarInspeccion(int id)
        {
            var inspeccion = await _context.InspeccionesCalidads.FindAsync(id);
            if (inspeccion == null)
                return NotFound(new { message = "Inspección no encontrada" });

            _context.InspeccionesCalidads.Remove(inspeccion);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inspección eliminada correctamente" });
        }

        // 📦 Listar órdenes disponibles para inspeccionar
        [HttpGet("ordenes-disponibles")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ListarOrdenesDisponibles()
        {
            var ordenes = await _context.OrdenProduccions
                .Where(o => !_context.InspeccionesCalidads.Any(i => i.IdOp == o.IdOp))
                .Select(o => new
                {
                    o.IdOp,
                    o.CodigoOp,
                    o.Modelo,
                    o.Estado,
                    o.FechaEntrega,
                    o.Cantidad
                })
                .OrderBy(o => o.CodigoOp)
                .ToListAsync();

            return Ok(ordenes);
        }
        [HttpPost("subir-evidencia")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> SubirEvidencia(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest(new { message = "Archivo inválido" });

            using var ms = new MemoryStream();
            await archivo.CopyToAsync(ms);
            var bytes = ms.ToArray();

            return Ok(new { fotoEvidencia = bytes });
        }

        public class InspeccionCreateDto
        {
            public int IdOp { get; set; }

            // Criterios (checkboxes)
            public bool PiezasUnidas { get; set; }
            public bool TelaSinDefectos { get; set; }
            public bool CosturasOk { get; set; }
            public bool ListaParaEntrega { get; set; }

            // Observaciones de cada criterio
            public List<string>? Observaciones { get; set; }

            // Resultado general y notas extra
            public string? ResultadoFinal { get; set; }
            public string? NotaAdicional { get; set; }
        }


    }
}
