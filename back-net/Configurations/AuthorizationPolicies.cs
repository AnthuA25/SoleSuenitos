namespace back_net.Configurations
{
    public static class AuthorizationPolicies
    {
        public static void AddRolePolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("SoloLogistica", policy => policy.RequireRole("Encargado de Logistica"));
                options.AddPolicy("SoloOperarioCorte", policy => policy.RequireRole("Operario de Corte"));
                options.AddPolicy("SoloInspectorCalidad", policy => policy.RequireRole("Inspector de Calidad"));
            });
        }
    }
}
