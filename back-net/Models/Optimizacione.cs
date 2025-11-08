using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class Optimizacione
{
    public int IdOpt { get; set; }

    public int IdOp { get; set; }

    public int? IdMolde { get; set; }

    public short VersionNum { get; set; }

    public string? NombreVersion { get; set; }

    public DateTime? FechaGeneracion { get; set; }

    public decimal? AprovechamientoPorcent { get; set; }

    public decimal? DesperdicioM { get; set; }

    public decimal? TelaUtilizadaM { get; set; }

    public int? TiempoEstimadoMin { get; set; }

    public string? Estado { get; set; }

    public byte[]? ArchivoDxf { get; set; }

    public byte[]? ImagenPrevisualizacion { get; set; }

    public string? Notas { get; set; }

    public int? GeneradoPor { get; set; }

    public string? GiroPermitido { get; set; }

    public string? OrientacionPiezas { get; set; }

    public string? NombreArchivoDxf { get; set; }

    public string? RutaPngGenerado { get; set; }

    public string? MetricasJson { get; set; }

    public bool? EsOptimaFinal { get; set; }

    public virtual ICollection<AnotacionesOpt> AnotacionesOpts { get; set; } = new List<AnotacionesOpt>();

    public virtual Usuario? GeneradoPorNavigation { get; set; }

    public virtual Molde? IdMoldeNavigation { get; set; }

    public virtual OrdenProduccion IdOpNavigation { get; set; } = null!;
}
