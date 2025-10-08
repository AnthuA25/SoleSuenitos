using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class ComentariosOp
{
    public int IdCom { get; set; }

    public int IdOp { get; set; }

    public int IdUsuario { get; set; }

    public string Mensaje { get; set; } = null!;

    public DateTime? Fecha { get; set; }

    public bool? Leido { get; set; }

    public virtual OrdenProduccion IdOpNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
