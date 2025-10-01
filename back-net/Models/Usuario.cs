using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Correo { get; set; } = null!;

    public string ContrasenaHash { get; set; } = null!;

    public string? NombreCompleto { get; set; }

    public short IdRole { get; set; }

    public DateTime? CreadoEn { get; set; }

    public DateTime? UltimoAcceso { get; set; }

    public bool? Activo { get; set; }

    public virtual ICollection<AnotacionesOpt> AnotacionesOpts { get; set; } = new List<AnotacionesOpt>();

    public virtual ICollection<ComentariosOp> ComentariosOps { get; set; } = new List<ComentariosOp>();

    public virtual Role IdRoleNavigation { get; set; } = null!;

    public virtual ICollection<InspeccionesCalidad> InspeccionesCalidads { get; set; } = new List<InspeccionesCalidad>();

    public virtual ICollection<Molde> Moldes { get; set; } = new List<Molde>();

    public virtual ICollection<Optimizacione> Optimizaciones { get; set; } = new List<Optimizacione>();

    public virtual ICollection<OrdenProduccion> OrdenProduccions { get; set; } = new List<OrdenProduccion>();

    public virtual ICollection<RollosTela> RollosTelas { get; set; } = new List<RollosTela>();
}
