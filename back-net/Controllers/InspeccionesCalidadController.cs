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

            int totalCriterios = 4;
            int cumplidos = 0;

            if (dto.PiezasUnidas) cumplidos++;
            if (dto.TelaSinDefectos) cumplidos++;
            if (dto.CosturasOk) cumplidos++;
            if (dto.ListaParaEntrega) cumplidos++;

            string resultadoTexto = $"Cumple {cumplidos} de {totalCriterios} criterios";

            string estado = cumplidos == totalCriterios ? "APROBADO" : "RECHAZADO";

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
                ResultadoFinal = estado,
                NotaAdicional = dto.NotaAdicional,
            };

            _context.InspeccionesCalidads.Add(inspeccion);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Inspección registrada correctamente",
                inspeccion = new
                {
                    inspeccion.IdInspeccion,
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
                    Estado = i.ResultadoFinal,
                    Inspector = i.IdUsuarioInspectorNavigation.NombreCompleto
                })
                .ToListAsync();

            return Ok(inspecciones);
        }

        // Ver detalle de una inspección
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

        // Eliminar inspección
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

        // Listar órdenes disponibles para inspeccionar
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
                    o.FechaCreacion,
                    o.Cantidad,
                })
                .OrderBy(o => o.CodigoOp)
                .ToListAsync();

            return Ok(ordenes);
        }

        [HttpGet("reporte/{id}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> GenerarReportePdf(int id)
        {
            var inspeccion = await _context.InspeccionesCalidads
                .Include(i => i.IdOpNavigation)
                .Include(i => i.IdUsuarioInspectorNavigation)
                .FirstOrDefaultAsync(i => i.IdInspeccion == id);

            if (inspeccion == null)
                return NotFound();

            // Construir contenido PDF
            var texto = $@"
                REPORTE DE INSPECCIÓN DE CALIDAD
                Fecha: {inspeccion.FechaInspeccion}

                INSPECTOR: {inspeccion.IdUsuarioInspectorNavigation.NombreCompleto}

                ORDEN DE PRODUCCIÓN
                Código OP: {inspeccion.IdOpNavigation.CodigoOp}
                Modelo: {inspeccion.IdOpNavigation.Modelo}
                Cantidad: {inspeccion.IdOpNavigation.Cantidad}

                CRITERIOS
                - Piezas unidas: {(inspeccion.PiezasUnidas.GetValueOrDefault() ? "✔" : "✘")}
                - Tela sin defectos: {(inspeccion.TelaSinDefectos.GetValueOrDefault() ? "✔" : "✘")}
                - Costuras correctas: {(inspeccion.CosturasOk.GetValueOrDefault() ? "✔" : "✘")}
                - Lista para entrega: {(inspeccion.ListaParaEntrega.GetValueOrDefault() ? "✔" : "✘")}

                OBSERVACIONES
                {inspeccion.Observaciones}

                RESULTADO FINAL: {inspeccion.ResultadoFinal}
                NOTA ADICIONAL: {inspeccion.NotaAdicional}
";

            var pdfBytes = System.Text.Encoding.UTF8.GetBytes(texto);

            return File(pdfBytes, "application/pdf", $"Reporte_{inspeccion.CodigoInspeccion}.pdf");
        }

        [HttpGet("orden/{idOp}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> ObtenerOrden(int idOp)
        {
            var orden = await _context.OrdenProduccions
                .Where(o => o.IdOp == idOp)
                .Select(o => new
                {
                    o.IdOp,
                    o.CodigoOp,
                    o.Modelo,
                    o.Cantidad
                })
                .FirstOrDefaultAsync();

            if (orden == null)
                return NotFound(new { message = "Orden no encontrada" });

            return Ok(orden);
        }

        [HttpPost("{idInspeccion}/subir-evidencia/{criterio}")]
        [Authorize(Policy = "SoloInspectorCalidad")]
        public async Task<IActionResult> SubirEvidenciaPorCriterio(int idInspeccion, string criterio, IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest(new { message = "Archivo no válido" });

            var inspeccion = await _context.InspeccionesCalidads.FindAsync(idInspeccion);
            if (inspeccion == null)
                return NotFound(new { message = "Inspección no encontrada" });

            // Validar que el criterio sea uno de los permitidos
            var criteriosValidos = new[] { "PiezasUnidas", "TelaSinDefectos", "CosturasOk", "ListaParaEntrega" };
            if (!criteriosValidos.Contains(criterio))
                return BadRequest(new { message = "Criterio no válido" });

            // Convertir archivo a bytes
            using var ms = new MemoryStream();
            await archivo.CopyToAsync(ms);

            // Si ya existía una evidencia para ese criterio, reemplázala
            var evidenciaExistente = await _context.EvidenciaInspeccions
                .FirstOrDefaultAsync(e => e.IdInspeccion == idInspeccion && e.TipoCriterio == criterio);

            if (evidenciaExistente != null)
            {
                evidenciaExistente.NombreArchivo = archivo.FileName;
                evidenciaExistente.TipoArchivo = archivo.ContentType;
                evidenciaExistente.Archivo = ms.ToArray();
                evidenciaExistente.FechaSubida = DateTime.UtcNow;
            }
            else
            {
                var evidencia = new EvidenciaInspeccion
                {
                    IdInspeccion = idInspeccion,
                    TipoCriterio = criterio,
                    NombreArchivo = archivo.FileName,
                    TipoArchivo = archivo.ContentType,
                    Archivo = ms.ToArray(),
                    FechaSubida = DateTime.UtcNow
                };
                _context.EvidenciaInspeccions.Add(evidencia);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Evidencia del criterio '{criterio}' subida correctamente",
                criterio,
                archivo = archivo.FileName
            });
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
