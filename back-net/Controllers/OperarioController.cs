// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using back_net.Models;
// using System.Net.Http.Headers;

// namespace back_net.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class OperarioController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         private readonly HttpClient _httpClient;

//         public OperarioController(AppDbContext context, HttpClient httpClient)
//         {
//             _context = context;
//             _httpClient = httpClient;
//             _httpClient.BaseAddress = new Uri("http://localhost:8000"); // Python service
//         }

//         // 🔹 1. Listar órdenes disponibles
//         [HttpGet("ordenes-disponibles")]
//         public async Task<IActionResult> GetOrdenesDisponibles()
//         {
//             var ordenes = await _context.OrdenProduccions
//                 .Where(o => o.Estado == "Pendiente" || o.Estado == "En Proceso")
//                 .Select(o => new
//                 {
//                     o.IdOp,
//                     o.CodigoOp,
//                     o.Modelo,
//                     o.Talla,
//                     o.Cantidad,
//                     o.FechaCreacion,
//                     o.Estado
//                 })
//                 .ToListAsync();

//             return Ok(ordenes);
//         }

//         // 🔹 2. Historial de optimizaciones por orden
//         [HttpGet("historial/{idOp}")]
//         public async Task<IActionResult> GetHistorialOptimizaciones(int idOp)
//         {
//             var historial = await _context.Optimizaciones
//                 .Where(h => h.IdOp == idOp)
//                 .OrderByDescending(h => h.FechaGeneracion)
//                 .Select(h => new
//                 {
//                     h.IdOptimizacion,
//                     h.Version,
//                     h.TipoMarcador,
//                     h.PorcentajeAprovechamiento,
//                     h.FechaGeneracion
//                 })
//                 .ToListAsync();

//             if (!historial.Any())
//                 return NotFound(new { message = "No se encontraron optimizaciones para esta orden." });

//             return Ok(historial);
//         }

//         // 🔹 3. Generar marcador digital V1
//         [HttpPost("generar-v1")]
//         public async Task<IActionResult> GenerarMarcadorV1([FromForm] IFormFile archivo, [FromForm] int idOp)
//         {
//             using var form = new MultipartFormDataContent();
//             var fileContent = new StreamContent(archivo.OpenReadStream());
//             fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
//             form.Add(fileContent, "archivo", archivo.FileName);
//             form.Add(new StringContent(idOp.ToString()), "idOp");

//             // Llamar al microservicio Python
//             var response = await _httpClient.PostAsync("/generar-v1", form);
//             if (!response.IsSuccessStatusCode)
//                 return BadRequest(new { message = "Error al generar marcador V1" });

//             var result = await response.Content.ReadAsStringAsync();
//             return Ok(result);
//         }

//         // 🔹 4. Generar marcador digital V2
//         [HttpPost("generar-v2")]
//         public async Task<IActionResult> GenerarMarcadorV2([FromForm] IFormFile archivo, [FromForm] int idOp)
//         {
//             using var form = new MultipartFormDataContent();
//             var fileContent = new StreamContent(archivo.OpenReadStream());
//             fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
//             form.Add(fileContent, "archivo", archivo.FileName);
//             form.Add(new StringContent(idOp.ToString()), "idOp");

//             var response = await _httpClient.PostAsync("/generar-v2", form);
//             if (!response.IsSuccessStatusCode)
//                 return BadRequest(new { message = "Error al generar marcador V2" });

//             var result = await response.Content.ReadAsStringAsync();
//             return Ok(result);
//         }

//         // 🔹 5. Descargar resultados
//         [HttpGet("descargar/{idOpt}")]
//         public async Task<IActionResult> DescargarArchivos(int idOpt)
//         {
//             var optimizacion = await _context.Optimizaciones.FirstOrDefaultAsync(o => o.IdOptimizacion == idOpt);
//             if (optimizacion == null)
//                 return NotFound(new { message = "Optimización no encontrada" });

//             var filePath = optimizacion.RutaMarcador;
//             if (!System.IO.File.Exists(filePath))
//                 return NotFound(new { message = "Archivo no disponible" });

//             var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
//             return File(bytes, "application/octet-stream", Path.GetFileName(filePath));
//         }
//     }
// }
