using back_net.Configurations;
using System.Text.Json.Serialization; // 👈 necesario para ReferenceHandler

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

app.MapControllers();

app.Run();
