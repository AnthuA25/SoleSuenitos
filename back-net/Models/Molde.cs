using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class Molde
{
    public int IdMolde { get; set; }

    public string NombreMolde { get; set; } = null!;

    public string? Descripcion { get; set; }

    public byte[]? ArchivoBlob { get; set; }

    public string? NombreArchivoOriginal { get; set; }

    public string? ExtensionArchivo { get; set; }

    public long? PesoBytes { get; set; }

    public int? IdUsuarioSubida { get; set; }

    public DateTime? FechaSubida { get; set; }

    public bool? Activo { get; set; }

    public string VersionMolde { get; set; } = null!;

    public string CodigoMolde { get; set; } = null!;

    public virtual Usuario? IdUsuarioSubidaNavigation { get; set; }

    public virtual ICollection<Optimizacione> Optimizaciones { get; set; } = new List<Optimizacione>();
}
