using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class OrdenRollo
{
    public int Id { get; set; }

    public int IdOp { get; set; }

    public int IdRollo { get; set; }

    public decimal MetrajeAsignadoM { get; set; }

    public DateTime? FechaAsignacion { get; set; }

    public virtual OrdenProduccion IdOpNavigation { get; set; } = null!;

    public virtual RollosTela IdRolloNavigation { get; set; } = null!;
}
