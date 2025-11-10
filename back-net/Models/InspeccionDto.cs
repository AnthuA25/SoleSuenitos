namespace back_net.Models
{
    public class InspeccionDto
    {
        public int IdInspeccion { get; set; }
        public string CodigoInspeccion { get; set; } = null!;
        public int IdOp { get; set; }
        public string CodigoOp { get; set; } = null!;
        public string Producto { get; set; } = null!;
        public DateTime? FechaInspeccion { get; set; }
        public bool? PiezasUnidas { get; set; }
        public bool? TelaSinDefectos { get; set; }
        public bool? CosturasOk { get; set; }
        public bool? ListaParaEntrega { get; set; }
        public string? Observaciones { get; set; }
        public string? ResultadoFinal { get; set; }
        public string Inspector { get; set; } = null!;

        public InspeccionDto() { }

        // Constructor para mapear desde entidad
        public InspeccionDto(InspeccionesCalidad i)
        {
            IdInspeccion = i.IdInspeccion;
            CodigoInspeccion = i.CodigoInspeccion;
            IdOp = i.IdOp;
            CodigoOp = i.IdOpNavigation?.CodigoOp ?? "";
            Producto = i.IdOpNavigation?.Modelo ?? "";
            FechaInspeccion = i.FechaInspeccion;
            PiezasUnidas = i.PiezasUnidas;
            TelaSinDefectos = i.TelaSinDefectos;
            CosturasOk = i.CosturasOk;
            ListaParaEntrega = i.ListaParaEntrega;
            Observaciones = i.Observaciones;
            ResultadoFinal = i.ResultadoFinal ?? "pendiente";
            Inspector = i.IdUsuarioInspectorNavigation?.NombreCompleto ?? "Sin asignar";
        }
    }
}
