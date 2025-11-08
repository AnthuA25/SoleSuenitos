namespace back_net.Models
{
    public class RegisterInspeccionDto
    {
        public string? CodigoInspeccion { get; set; }
        public int IdOp { get; set; }
        public int? IdUsuarioInspector { get; set; }
        public bool? PiezasUnidas { get; set; }
        public bool? TelaSinDefectos { get; set; }
        public bool? CosturasOk { get; set; }
        public bool? ListaParaEntrega { get; set; }
        public string? Observaciones { get; set; }
        public string? FotoEvidenciaBase64 { get; set; }
        public string? ResultadoFinal { get; set; }
    }
}
