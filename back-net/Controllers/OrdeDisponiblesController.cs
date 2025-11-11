using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_net.Models;
using Microsoft.AspNetCore.Authorization;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenDisponiblesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdenDisponiblesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Listar órdenes de producción con optimizaciones y comentarios
        [HttpGet("listar")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> ListarOrdenes()
        {
            var ordenes = await _context.OrdenProduccions
                .Include(o => o.Optimizaciones)
                .Include(o => o.ComentariosOps)
                .OrderByDescending(o => o.FechaCreacion)
                .Select(o => new
                {
                    o.IdOp,
                    o.CodigoOp,
                    o.Modelo,
                    o.Talla,
                    o.Cantidad,
                    o.Estado,
                    o.FechaCreacion,
                    o.FechaEntrega,
                    optimizaciones = o.Optimizaciones.Select(opt => new
                    {
                        opt.IdOpt,
                        opt.VersionNum,
                        opt.NombreVersion,
                        opt.AprovechamientoPorcent,
                        opt.DesperdicioM,
                        opt.TelaUtilizadaM,
                        opt.RutaPngGenerado,
                        opt.NombreArchivoDxf,
                        opt.EsOptimaFinal
                    }).ToList(),
                    comentarios = o.ComentariosOps
                        .OrderByDescending(c => c.Fecha)
                        .Select(c => new
                        {
                            c.IdCom,
                            c.Mensaje,
                            c.Fecha,
                            c.Leido,
                            Usuario = c.IdUsuarioNavigation.NombreCompleto
                        }).ToList()
                })
                .ToListAsync();

            return Ok(ordenes);
        }


        [HttpGet("listar/{idOp}")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> ListarOptimizacionesPorOrden(int idOp)
        {
            var optimizaciones = await _context.Optimizaciones
                .Where(o => o.IdOp == idOp)
                .OrderBy(o => o.VersionNum)
                .Select(o => new
                {
                    o.IdOpt,
                    o.VersionNum,
                    o.NombreVersion,
                    o.FechaGeneracion,
                    o.AprovechamientoPorcent,
                    o.DesperdicioM,
                    o.TelaUtilizadaM,
                    o.Estado,
                    o.RutaPngGenerado,
                    o.NombreArchivoDxf
                })
                .ToListAsync();

            if (optimizaciones.Count == 0)
                return NotFound(new { message = "No hay optimizaciones registradas para esta orden." });

            return Ok(optimizaciones);
        }

        [HttpGet("detalle/{idOpt}")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> ObtenerDetalleOptimizacion(int idOpt)
        {
            var opt = await _context.Optimizaciones
                .Where(o => o.IdOpt == idOpt)
                .Select(o => new
                {
                    o.IdOpt,
                    o.IdOp,
                    o.NombreVersion,
                    o.VersionNum,
                    o.AprovechamientoPorcent,
                    o.DesperdicioM,
                    o.TelaUtilizadaM,
                    o.TiempoEstimadoMin,
                    o.RutaPngGenerado,
                    o.NombreArchivoDxf,
                    o.MetricasJson,
                    o.Estado
                })
                .FirstOrDefaultAsync();

            if (opt == null)
                return NotFound(new { message = "Optimización no encontrada" });

            return Ok(opt);
        }
    }
}
