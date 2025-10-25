// [ApiController]
// [Route("api/[controller]")]
// public class OptimizacionController : ControllerBase
// {
//     private readonly HttpClient _httpClient;
//     private readonly string _motorUrl = "http://localhost:8000/optimize"; // Python FastAPI

//     public OptimizacionController(IHttpClientFactory httpClientFactory)
//     {
//         _httpClient = httpClientFactory.CreateClient();
//     }

//     [HttpPost("generar-marcador")]
//     public async Task<IActionResult> GenerarMarcador([FromForm] IFormFile archivo, 
//                                                     [FromForm] string producto, 
//                                                     [FromForm] string talla,
//                                                     [FromForm] int cantidad,
//                                                     [FromForm] double anchoRolloMm,
//                                                     [FromForm] double largoRolloMm)
//     {
//         using var formData = new MultipartFormDataContent();
//         using var fileStream = archivo.OpenReadStream();
//         formData.Add(new StreamContent(fileStream), "archivo", archivo.FileName);
//         formData.Add(new StringContent(producto), "producto");
//         formData.Add(new StringContent(talla), "talla");
//         formData.Add(new StringContent(cantidad.ToString()), "cantidad");
//         formData.Add(new StringContent(anchoRolloMm.ToString()), "ancho_rollo_mm");
//         formData.Add(new StringContent(largoRolloMm.ToString()), "largo_rollo_mm");

//         var response = await _httpClient.PostAsync(_motorUrl, formData);
//         var content = await response.Content.ReadAsStringAsync();

//         return Content(content, "application/json");
//     }
// }
