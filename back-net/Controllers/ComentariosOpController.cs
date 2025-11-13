using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_net.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComentariosOpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComentariosOpController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Listar comentarios de una orden
        [HttpGet("listar/{idOp}")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> ListarComentarios(int idOp)
        {
            var comentarios = await _context.ComentariosOps
                .Include(c => c.IdUsuarioNavigation)
                .Where(c => c.IdOp == idOp)
                .OrderByDescending(c => c.Fecha)
                .Select(c => new
                {
                    c.IdCom,
                    c.Mensaje,
                    c.Fecha,
                    c.Leido,
                    c.IdUsuario,
                    Usuario = c.IdUsuarioNavigation.NombreCompleto
                })
                .ToListAsync();

            return Ok(comentarios);
        }


        // POST: Agregar nuevo comentario
        [HttpPost("agregar")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> AgregarComentario([FromBody] ComentarioCrearDto dto)
        {
            if (!await _context.OrdenProduccions.AnyAsync(o => o.IdOp == dto.IdOp))
                return NotFound(new { message = "Orden no encontrada" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "No se pudo obtener el usuario autenticado" });

            int idUsuario = int.Parse(userIdClaim.Value);


            var comentario = new ComentariosOp
            {
                IdOp = dto.IdOp,
                IdUsuario = idUsuario,
                Mensaje = dto.Mensaje,
                Fecha = DateTime.UtcNow,
                Leido = true
            };

            _context.ComentariosOps.Add(comentario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comentario agregado correctamente" });
        }

        // PUT: Marcar comentario como leído
        [HttpPut("marcar-leido/{id}")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public async Task<IActionResult> MarcarLeido(int id)
        {
            var comentario = await _context.ComentariosOps.FindAsync(id);
            if (comentario == null) return NotFound();

            comentario.Leido = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comentario marcado como leído" });
        }
    }

    public class ComentarioCrearDto
    {
        public int IdOp { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
