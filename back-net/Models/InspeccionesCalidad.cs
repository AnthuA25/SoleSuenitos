using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class InspeccionesCalidad
{
    public int IdInspeccion { get; set; }

    public string? CodigoInspeccion { get; set; }

    public int IdOp { get; set; }

    public int? IdUsuarioInspector { get; set; }

    public DateTime? FechaInspeccion { get; set; }

    public bool? PiezasUnidas { get; set; }

    public bool? TelaSinDefectos { get; set; }

    public bool? CosturasOk { get; set; }

    public bool? ListaParaEntrega { get; set; }

    public string? Observaciones { get; set; }

    public byte[]? FotoEvidencia { get; set; }

    public string? ResultadoFinal { get; set; }

    public string? NotaAdicional { get; set; }

    public virtual ICollection<EvidenciaInspeccion> EvidenciaInspeccions { get; set; } = new List<EvidenciaInspeccion>();

    public virtual OrdenProduccion IdOpNavigation { get; set; } = null!;

    public virtual Usuario? IdUsuarioInspectorNavigation { get; set; }
}
