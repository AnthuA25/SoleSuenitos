using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using back_net.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace back_net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenProduccionController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;

        public OrdenProduccionController(HttpClient httpClient, AppDbContext context)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("http://localhost:8000");
            _context = context;
        }

        // =====================
        // 🔹 1. Leer piezas del DXF
        // =====================
        [HttpPost("leer-piezas")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> LeerPiezas([FromForm] IFormFile archivo)
        {
            try
            {
                using var form = new MultipartFormDataContent();
                var fileContent = new StreamContent(archivo.OpenReadStream());
                fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
                form.Add(fileContent, "archivo", archivo.FileName);

                var response = await _httpClient.PostAsync("/leer-piezas", form);
                var json = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, json);

                return Ok(JsonSerializer.Deserialize<object>(json));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al leer piezas: {ex.Message}" });
            }
        }

        // =====================
        // 🔹 2. Crear o recuperar orden existente
        // =====================
        private async Task<OrdenProduccion> ObtenerOCrearOrdenAsync(string modelo, string talla, int cantidad, List<int> rollos)
        {
            var existente = await _context.OrdenProduccions
                .Include(o => o.OrdenRollos)
                .FirstOrDefaultAsync(o => o.Modelo == modelo && o.Talla == talla && o.Cantidad == cantidad && o.Estado == "Pendiente");

            if (existente != null)
                return existente;

            var codigo = GenerarCodigoOrden();
            var orden = new OrdenProduccion
            {
                CodigoOp = codigo,
                Modelo = modelo,
                Talla = talla,
                Cantidad = cantidad,
                FechaCreacion = DateTime.UtcNow,
                Estado = "Pendiente"
            };

            _context.OrdenProduccions.Add(orden);
            await _context.SaveChangesAsync();

            foreach (var idRollo in rollos)
            {
                _context.OrdenRollos.Add(new OrdenRollo
                {
                    IdOp = orden.IdOp,
                    IdRollo = idRollo,
                    FechaAsignacion = DateTime.UtcNow,
                    MetrajeAsignadoM = 0
                });
            }
            await _context.SaveChangesAsync();

            return orden;
        }

        // =====================
        // 🔹 3. Generar marcador (V1 / V2 / Comparada)
        // =====================
        [HttpPost("generar-v1")]
        [Authorize(Policy = "SoloLogistica")]

        public async Task<IActionResult> GenerarV1(
            [FromForm] string modelo, [FromForm] string talla, [FromForm] int cantidad,
            [FromForm] List<int> rollosSeleccionados, [FromForm] IFormFile? archivoMolde,
            [FromForm] bool permitirGiro90 = true)
        {
            return await GenerarOptimizacion("V1", "/optimize", modelo, talla, cantidad, rollosSeleccionados, archivoMolde, permitirGiro90);
        }

        [HttpPost("generar-v2")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> GenerarV2(
            [FromForm] string modelo, [FromForm] string talla, [FromForm] int cantidad,
            [FromForm] List<int> rollosSeleccionados, [FromForm] IFormFile archivoMolde,
            [FromForm] bool permitirGiro90 = true)
        {
            return await GenerarOptimizacion("V2", "/optimize-v2", modelo, talla, cantidad, rollosSeleccionados, archivoMolde, permitirGiro90);
        }

        [HttpPost("comparar")]
        [Authorize(Policy = "SoloLogistica")]
        public async Task<IActionResult> Comparar(
    [FromForm] string modelo, [FromForm] string talla, [FromForm] int cantidad,
    [FromForm] List<int> rollosSeleccionados, [FromForm] IFormFile archivoMolde,
    [FromForm] bool permitirGiro90 = true)
        {
            var orden = await ObtenerOCrearOrdenAsync(modelo, talla, cantidad, rollosSeleccionados);

            var result = await LlamarMicroservicioAsync("/optimize-comparar", archivoMolde, modelo, talla, cantidad, 1500, 3000, permitirGiro90);
            var v1 = result.GetProperty("v1_metricas");
            var v2 = result.GetProperty("v2_metricas");

            double apV1 = v1.GetProperty("aprovechamiento_porcentaje").GetDouble();
            double apV2 = v2.GetProperty("aprovechamiento_porcentaje").GetDouble();

            string mejor = apV2 > apV1 ? "V2" : "V1";

            // 🔹 Marcar la mejor como óptima
            var optimas = _context.Optimizaciones.Where(o => o.IdOp == orden.IdOp);
            foreach (var opt in optimas)
                opt.EsOptimaFinal = opt.NombreVersion == mejor;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Comparación completada",
                mejor_version = mejor,
                v1 = v1.ToString(),
                v2 = v2.ToString()
            });
        }

        // =====================
        // 🔹 Helper general para V1/V2/Comparada
        // =====================
        private async Task<IActionResult> GenerarOptimizacion(
            string version, string endpoint, string modelo, string talla, int cantidad,
            List<int> rollosSeleccionados, IFormFile archivoMolde, bool permitirGiro90)
        {
            try
            {
                if (rollosSeleccionados == null || !rollosSeleccionados.Any())
                    throw new Exception("No se seleccionaron rollos para la orden.");

                var orden = await ObtenerOCrearOrdenAsync(modelo, talla, cantidad, rollosSeleccionados);
                var rollo = await _context.RollosTelas.FindAsync(rollosSeleccionados.First());

                if (rollo == null)
                    throw new Exception("No se encontró el rollo seleccionado.");

                double ancho = (double)rollo.AnchoCm * 10;   // cm → mm
                double largo = (double)rollo.MetrajeM * 1000; // m → mm

                var result = await LlamarMicroservicioAsync(endpoint, archivoMolde, modelo, talla, cantidad, ancho, largo, permitirGiro90);
                await GuardarOptimizacionAsync(orden, archivoMolde, result, version);
                ActualizarRolloYOrden(rollo, orden, result);

                return Ok(new { message = $"Versión {version} generada correctamente", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al generar {version}: {ex.Message}" });
            }
        }

        // =====================
        // 🔹 4. Llamar microservicio Python
        // =====================
        private async Task<JsonElement> LlamarMicroservicioAsync(
            string endpoint, IFormFile archivo, string modelo, string talla, int cantidad,
            double ancho, double largo, bool giro)
        {
            using var content = new MultipartFormDataContent();
            var fileContent = new StreamContent(archivo.OpenReadStream());
            fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
            content.Add(fileContent, "archivo", archivo.FileName);
            content.Add(new StringContent(modelo), "producto");
            content.Add(new StringContent(talla), "talla");
            content.Add(new StringContent(cantidad.ToString()), "cantidad");
            content.Add(new StringContent(ancho.ToString()), "ancho_rollo_mm");
            content.Add(new StringContent(largo.ToString()), "largo_rollo_mm");
            content.Add(new StringContent(giro.ToString().ToLower()), "permitir_giro_90");

            var response = await _httpClient.PostAsync(endpoint, content);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error del microservicio: {json}");

            return JsonSerializer.Deserialize<JsonElement>(json);
        }

        // =====================
        // 🔹 5. Guardar optimización en BD
        // =====================
        private async Task GuardarOptimizacionAsync(OrdenProduccion orden, IFormFile archivo, JsonElement result, string version)
        {
            try
            {
                // Buscar si ya existe una optimización previa del mismo tipo
                var existente = await _context.Optimizaciones
                    .FirstOrDefaultAsync(o => o.IdOp == orden.IdOp && o.NombreVersion == version);

                // Extraer métricas
                double largoUsado = result.GetProperty("metricas").GetProperty("largo_usado_mm").GetDouble() / 1000.0;
                double aprovechamiento = result.GetProperty("metricas").GetProperty("aprovechamiento_porcentaje").GetDouble();
                double desperdicio = result.GetProperty("metricas").GetProperty("desperdicio_porcentaje").GetDouble();

                // Convertir archivo a bytes
                using var ms = new MemoryStream();
                await archivo.CopyToAsync(ms);
                var archivoBytes = ms.ToArray();

                string? rutaPng = result.TryGetProperty("png", out var pngProp) ? pngProp.GetString() : null;
                string? metricas = result.TryGetProperty("metricas", out var metricasProp) ? metricasProp.ToString() : null;

                if (existente != null)
                {
                    // 🔁 Si ya existe, actualizamos
                    existente.ArchivoDxf = archivoBytes;
                    existente.NombreArchivoDxf = archivo.FileName;
                    existente.RutaPngGenerado = rutaPng;
                    existente.MetricasJson = metricas;
                    existente.TelaUtilizadaM = (decimal)largoUsado;
                    existente.AprovechamientoPorcent = (decimal)aprovechamiento;
                    existente.DesperdicioM = (decimal)desperdicio;
                    existente.FechaGeneracion = DateTime.UtcNow;
                    existente.Estado = "Actualizado";
                }
                else
                {
                    // 🆕 Si no existe, creamos una nueva
                    var opt = new Optimizacione
                    {
                        IdOp = orden.IdOp,
                        ArchivoDxf = archivoBytes,
                        NombreArchivoDxf = archivo.FileName,
                        RutaPngGenerado = rutaPng,
                        MetricasJson = metricas,
                        NombreVersion = version,
                        FechaGeneracion = DateTime.UtcNow,
                        Estado = "Generado",
                        TelaUtilizadaM = (decimal)largoUsado,
                        AprovechamientoPorcent = (decimal)aprovechamiento,
                        DesperdicioM = (decimal)desperdicio,
                        EsOptimaFinal = false
                    };
                    _context.Optimizaciones.Add(opt);
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al guardar optimización: {ex.InnerException?.Message ?? ex.Message}");
            }
        }


        // =====================
        // 🔹 6. Actualizar metraje de rollo y orden
        // =====================
        private void ActualizarRolloYOrden(RollosTela rollo, OrdenProduccion orden, JsonElement result)
        {
            if (result.TryGetProperty("metricas", out var metricas))
            {
                double largoUsado = metricas.GetProperty("largo_usado_mm").GetDouble() / 1000.0;
                rollo.MetrajeM -= (decimal)largoUsado;

                var asignacion = _context.OrdenRollos.FirstOrDefault(or => or.IdOp == orden.IdOp && or.IdRollo == rollo.IdRollo);
                if (asignacion != null)
                    asignacion.MetrajeAsignadoM = (decimal)largoUsado;

                if (rollo.MetrajeM <= 0)
                    rollo.Estado = "Agotado";

                _context.SaveChanges();
            }
        }


        // =====================
        // 🔹 7. Generar código único (OP-01, OP-02...)
        // =====================
        private string GenerarCodigoOrden()
        {
            var ultimo = _context.OrdenProduccions
                .OrderByDescending(o => o.IdOp)
                .Select(o => o.CodigoOp)
                .FirstOrDefault();

            if (string.IsNullOrEmpty(ultimo)) return "OP-01";
            var num = int.Parse(ultimo.Replace("OP-", ""));
            return $"OP-{(num + 1):D2}";
        }
    }
}
