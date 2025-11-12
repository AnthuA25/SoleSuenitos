using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class EvidenciaInspeccion
{
    public int IdEvidencia { get; set; }

    public int IdInspeccion { get; set; }

    public string TipoCriterio { get; set; } = null!;

    public string? NombreArchivo { get; set; }

    public string? TipoArchivo { get; set; }

    public byte[] Archivo { get; set; } = null!;

    public DateTime? FechaSubida { get; set; }

    public virtual InspeccionesCalidad IdInspeccionNavigation { get; set; } = null!;
}
