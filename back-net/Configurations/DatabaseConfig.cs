using back_net.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

namespace back_net.Configurations
{
    public static class DatabaseConfig
    {
        public static void AddDatabase(this IServiceCollection services)
        {
            Env.Load();
            var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (string.IsNullOrEmpty(connectionString))
                throw new Exception("No se encontró la variable DATABASE_URL.");

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));
        }
    }
}
