using Microsoft.AspNetCore.Mvc;
using back_net.Models;
using Microsoft.EntityFrameworkCore;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoldesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MoldesController(AppDbContext context)
        {
            _context = context;
        }

        // Registrar molde -> POST: api/moldes/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarMolde([FromForm] IFormFile archivo, [FromForm] string nombreMolde)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest(new { message = "Debe subir un archivo válido (.dxf)." });

            if (string.IsNullOrEmpty(nombreMolde))
                return BadRequest(new { message = "Debe ingresar el nombre del molde." });

            // Leer archivo como bytes
            using var ms = new MemoryStream();
            await archivo.CopyToAsync(ms);
            var bytes = ms.ToArray();

            // Buscar último código
            var ultimoMolde = await _context.Moldes
                .OrderByDescending(m => m.IdMolde)
                .FirstOrDefaultAsync();

            string nuevoCodigo = "M-001";
            if (ultimoMolde != null)
            {
                // Tomar el número del código anterior y sumarle 1
                var numero = int.Parse(ultimoMolde.CodigoMolde.Replace("M-", ""));
                nuevoCodigo = $"M-{(numero + 1).ToString("000")}";
            }

            var molde = new Molde
            {
                CodigoMolde = nuevoCodigo,               // autogenerado
                NombreMolde = nombreMolde,               // viene del usuario
                ArchivoBlob = bytes,                     // archivo convertido a bytes
                NombreArchivoOriginal = archivo.FileName,
                ExtensionArchivo = Path.GetExtension(archivo.FileName),
                PesoBytes = archivo.Length,
                VersionMolde = "v1",
                FechaSubida = DateTime.UtcNow,
                Activo = true
            };

            _context.Moldes.Add(molde);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Molde registrado correctamente.",
                molde.CodigoMolde,
                molde.NombreMolde,
                molde.NombreArchivoOriginal,
                molde.ExtensionArchivo,
                molde.PesoBytes,
                molde.VersionMolde,
                molde.FechaSubida
            });
        }

        // Listar moldes -> GET: api/moldes/listar
        [HttpGet("listar")]
        public async Task<IActionResult> ListarMoldes()
        {
            var moldes = await _context.Moldes
                .Where(m => m.Activo == true)
                .OrderByDescending(m => m.FechaSubida)
                .Select(m => new
                {
                    m.IdMolde,
                    m.CodigoMolde,
                    m.NombreMolde,
                    m.VersionMolde,
                    m.FechaSubida,
                    m.NombreArchivoOriginal
                })
                .ToListAsync();

            return Ok(moldes);
        }

        // Obtener detalle de un molde -> GET: api/moldes/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerMolde(int id)
        {
            var molde = await _context.Moldes.FindAsync(id);
            if (molde == null)
                return NotFound(new { message = "Molde no encontrado." });

            return Ok(new
            {
                molde.IdMolde,
                molde.CodigoMolde,
                molde.NombreMolde,
                molde.Descripcion,
                molde.VersionMolde,
                molde.NombreArchivoOriginal,
                molde.ExtensionArchivo,
                molde.PesoBytes,
                molde.FechaSubida
            });
        }
        // Eliminar molde (lógico) -> DELETE: api/moldes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarMolde(int id)
        {
            var molde = await _context.Moldes.FindAsync(id);
            if (molde == null)
                return NotFound(new { message = "Molde no encontrado." });

            molde.Activo = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Molde eliminado correctamente." });
        }

        // Buscar moldes -> GET: api/moldes/buscar?criterio=xxx
        [HttpGet("buscar")]
        public async Task<IActionResult> BuscarMoldes([FromQuery] string criterio)
        {
            // Validación básica
            if (string.IsNullOrWhiteSpace(criterio))
                return BadRequest(new { message = "Debe ingresar un criterio de búsqueda (código o nombre)." });

            // Normalizar el criterio (eliminar espacios y pasar a minúsculas)
            criterio = criterio.Trim().ToLower();

            var resultados = await _context.Moldes
                .Where(m => m.Activo == true &&
                    (
                        EF.Functions.ILike(m.CodigoMolde, $"%{criterio}%") ||  
                        EF.Functions.ILike(m.NombreMolde, $"%{criterio}%")
                    ))
                .OrderByDescending(m => m.FechaSubida)
                .Select(m => new
                {
                    m.IdMolde,
                    m.CodigoMolde,
                    m.NombreMolde,
                    m.VersionMolde,
                    m.FechaSubida,
                    m.NombreArchivoOriginal
                })
                .ToListAsync();

            if (resultados == null || resultados.Count == 0)
                return NotFound(new { message = "No se encontraron moldes con ese código o nombre." });

            return Ok(resultados);
        }

    }
}
