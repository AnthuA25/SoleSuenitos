using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OptimizacionesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public OptimizacionesController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // Descargar archivo de optimización (PNG o DXF)
        [HttpGet("descargar")]
        [Authorize(Policy = "SoloOperarioCorte")]
        public IActionResult DescargarArchivo([FromQuery] string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest(new { message = "Nombre de archivo inválido" });

            // Ruta hacia el motor de optimización
            var relativePath = Path.Combine(_env.ContentRootPath, "..", "motor-optimizacion", "output", fileName);
            var filePath = Path.GetFullPath(relativePath);

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "Archivo no encontrado" });

            var contentType = fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
                ? "image/png"
                : fileName.EndsWith(".dxf", StringComparison.OrdinalIgnoreCase)
                    ? "application/dxf"
                    : "application/octet-stream";

            return PhysicalFile(filePath, contentType, fileName);
        }
    }
}
