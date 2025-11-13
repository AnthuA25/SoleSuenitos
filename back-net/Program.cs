using back_net.Configurations;
using Microsoft.Extensions.FileProviders;
using System.IO;
using System.Text.Json.Serialization;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;
var builder = WebApplication.CreateBuilder(args);

// Configuración modular
builder.Services.AddDatabase();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRolePolicies();

// Registrar HttpClient (para comunicar con Python)
builder.Services.AddHttpClient();

// Controladores con JSON configurado para ignorar ciclos
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // opcional: mantiene nombres originales
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Configurar middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

var backendOutput = Path.Combine(Directory.GetCurrentDirectory(), "output");
if (Directory.Exists(backendOutput))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(backendOutput),
        RequestPath = "/output"
    });
    Console.WriteLine($"🟢 Sirviendo archivos desde: {backendOutput}");
}


var pythonOutput = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())!.FullName, "motor-optimization", "output");
if (Directory.Exists(pythonOutput))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(pythonOutput),
        RequestPath = "/output"
    });
    Console.WriteLine($"🟢 Sirviendo archivos de Python desde: {pythonOutput}");
}
else
{
    Console.WriteLine("⚠️ No se encontró la carpeta 'motor-optimization/output'.");
}

app.MapControllers();

app.Run();
