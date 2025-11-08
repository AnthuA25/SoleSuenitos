using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class OrdenProduccion
{
    public int IdOp { get; set; }

    public string? CodigoOp { get; set; }

    public string Modelo { get; set; } = null!;

    public string? Talla { get; set; }

    public int Cantidad { get; set; }

    public DateTime? FechaCreacion { get; set; }

    public DateOnly? FechaEntrega { get; set; }

    public string? Estado { get; set; }

    public int? IdUsuarioCreador { get; set; }

    public string? Comentarios { get; set; }

    public byte[]? ArchivoBlob { get; set; }

    public virtual ICollection<ComentariosOp> ComentariosOps { get; set; } = new List<ComentariosOp>();

    public virtual Usuario? IdUsuarioCreadorNavigation { get; set; }

    public virtual ICollection<InspeccionesCalidad> InspeccionesCalidads { get; set; } = new List<InspeccionesCalidad>();

    public virtual ICollection<Optimizacione> Optimizaciones { get; set; } = new List<Optimizacione>();

    public virtual ICollection<OrdenRollo> OrdenRollos { get; set; } = new List<OrdenRollo>();
}
