using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class RollosTela
{
    public int IdRollo { get; set; }

    public string CodigoRollo { get; set; } = null!;

    public string TipoTela { get; set; } = null!;

    public decimal AnchoCm { get; set; }

    public string? Color { get; set; }

    public decimal MetrajeM { get; set; }

    public string? Proveedor { get; set; }

    public DateTime? FechaRecepcion { get; set; }

    public int? IdUsuarioRegistro { get; set; }

    public string? Estado { get; set; }

    public virtual Usuario? IdUsuarioRegistroNavigation { get; set; }

    public virtual ICollection<OrdenRollo> OrdenRollos { get; set; } = new List<OrdenRollo>();
}
