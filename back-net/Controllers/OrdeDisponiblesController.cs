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
    }
}
