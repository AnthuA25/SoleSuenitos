using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class AnotacionesOpt
{
    public int Id { get; set; }

    public int IdOpt { get; set; }

    public int IdUsuario { get; set; }

    public string Texto { get; set; } = null!;

    public DateTime? Fecha { get; set; }

    public virtual Optimizacione IdOptNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
