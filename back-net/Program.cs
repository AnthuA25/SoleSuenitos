using back_net.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv; 

var builder = WebApplication.CreateBuilder(args);

//Cargar variables desde .env
Env.Load();

// Obtener cadena de conexión
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("No se encontró la variable de entorno DATABASE_URL. Verifica tu archivo .env");
}

// Registrar DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// controladores
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configurar middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.UseCors(builder =>
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader());


app.Run();
