using System;
using System.Collections.Generic;

namespace back_net.Models;

public partial class Role
{
    public short IdRole { get; set; }

    public string NombreRole { get; set; } = null!;

    public string? Descripcion { get; set; }

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
