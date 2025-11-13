using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace back_net.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AnotacionesOpt> AnotacionesOpts { get; set; }

    public virtual DbSet<ComentariosOp> ComentariosOps { get; set; }

    public virtual DbSet<EvidenciaInspeccion> EvidenciaInspeccions { get; set; }

    public virtual DbSet<InspeccionesCalidad> InspeccionesCalidads { get; set; }

    public virtual DbSet<Molde> Moldes { get; set; }

    public virtual DbSet<Optimizacione> Optimizaciones { get; set; }

    public virtual DbSet<OrdenProduccion> OrdenProduccions { get; set; }

    public virtual DbSet<OrdenRollo> OrdenRollos { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RollosTela> RollosTelas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=dpg-d4619dadbo4c7387emo0-a.oregon-postgres.render.com;Port=5432;Database=syscorte3;Username=admin;Password=6FUgw227bMqWlDALWgBcITVEyOIj1fR5;Ssl Mode=Require;Trust Server Certificate=true");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnotacionesOpt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("anotaciones_opt_pkey");

            entity.ToTable("anotaciones_opt");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Fecha)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha");
            entity.Property(e => e.IdOpt).HasColumnName("id_opt");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Texto).HasColumnName("texto");

            entity.HasOne(d => d.IdOptNavigation).WithMany(p => p.AnotacionesOpts)
                .HasForeignKey(d => d.IdOpt)
                .HasConstraintName("anotaciones_opt_id_opt_fkey");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.AnotacionesOpts)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("anotaciones_opt_id_usuario_fkey");
        });

        modelBuilder.Entity<ComentariosOp>(entity =>
        {
            entity.HasKey(e => e.IdCom).HasName("comentarios_op_pkey");

            entity.ToTable("comentarios_op");

            entity.Property(e => e.IdCom)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_com");
            entity.Property(e => e.Fecha)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha");
            entity.Property(e => e.IdOp).HasColumnName("id_op");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Leido)
                .HasDefaultValue(false)
                .HasColumnName("leido");
            entity.Property(e => e.Mensaje).HasColumnName("mensaje");

            entity.HasOne(d => d.IdOpNavigation).WithMany(p => p.ComentariosOps)
                .HasForeignKey(d => d.IdOp)
                .HasConstraintName("comentarios_op_id_op_fkey");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.ComentariosOps)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("comentarios_op_id_usuario_fkey");
        });

        modelBuilder.Entity<EvidenciaInspeccion>(entity =>
        {
            entity.HasKey(e => e.IdEvidencia).HasName("evidencia_inspeccion_pkey");

            entity.ToTable("evidencia_inspeccion");

            entity.Property(e => e.IdEvidencia).HasColumnName("id_evidencia");
            entity.Property(e => e.Archivo).HasColumnName("archivo");
            entity.Property(e => e.FechaSubida)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_subida");
            entity.Property(e => e.IdInspeccion).HasColumnName("id_inspeccion");
            entity.Property(e => e.NombreArchivo)
                .HasMaxLength(255)
                .HasColumnName("nombre_archivo");
            entity.Property(e => e.TipoArchivo)
                .HasMaxLength(100)
                .HasColumnName("tipo_archivo");
            entity.Property(e => e.TipoCriterio)
                .HasMaxLength(100)
                .HasColumnName("tipo_criterio");

            entity.HasOne(d => d.IdInspeccionNavigation).WithMany(p => p.EvidenciaInspeccions)
                .HasForeignKey(d => d.IdInspeccion)
                .HasConstraintName("fk_inspeccion");
        });

        modelBuilder.Entity<InspeccionesCalidad>(entity =>
        {
            entity.HasKey(e => e.IdInspeccion).HasName("inspecciones_calidad_pkey");

            entity.ToTable("inspecciones_calidad");

            entity.HasIndex(e => e.CodigoInspeccion, "inspecciones_calidad_codigo_inspeccion_key").IsUnique();

            entity.Property(e => e.IdInspeccion)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_inspeccion");
            entity.Property(e => e.CodigoInspeccion)
                .HasMaxLength(80)
                .HasColumnName("codigo_inspeccion");
            entity.Property(e => e.CosturasOk).HasColumnName("costuras_ok");
            entity.Property(e => e.FechaInspeccion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_inspeccion");
            entity.Property(e => e.FotoEvidencia).HasColumnName("foto_evidencia");
            entity.Property(e => e.IdOp).HasColumnName("id_op");
            entity.Property(e => e.IdUsuarioInspector).HasColumnName("id_usuario_inspector");
            entity.Property(e => e.ListaParaEntrega).HasColumnName("lista_para_entrega");
            entity.Property(e => e.NotaAdicional).HasColumnName("nota_adicional");
            entity.Property(e => e.Observaciones).HasColumnName("observaciones");
            entity.Property(e => e.PiezasUnidas).HasColumnName("piezas_unidas");
            entity.Property(e => e.ResultadoFinal)
                .HasMaxLength(40)
                .HasColumnName("resultado_final");
            entity.Property(e => e.TelaSinDefectos).HasColumnName("tela_sin_defectos");

            entity.HasOne(d => d.IdOpNavigation).WithMany(p => p.InspeccionesCalidads)
                .HasForeignKey(d => d.IdOp)
                .HasConstraintName("inspecciones_calidad_id_op_fkey");

            entity.HasOne(d => d.IdUsuarioInspectorNavigation).WithMany(p => p.InspeccionesCalidads)
                .HasForeignKey(d => d.IdUsuarioInspector)
                .HasConstraintName("inspecciones_calidad_id_usuario_inspector_fkey");
        });

        modelBuilder.Entity<Molde>(entity =>
        {
            entity.HasKey(e => e.IdMolde).HasName("moldes_pkey");

            entity.ToTable("moldes");

            entity.Property(e => e.IdMolde)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_molde");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.ArchivoBlob).HasColumnName("archivo_blob");
            entity.Property(e => e.CodigoMolde)
                .HasColumnType("character varying")
                .HasColumnName("codigo_molde");
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.ExtensionArchivo)
                .HasMaxLength(20)
                .HasColumnName("extension_archivo");
            entity.Property(e => e.FechaSubida)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_subida");
            entity.Property(e => e.IdUsuarioSubida).HasColumnName("id_usuario_subida");
            entity.Property(e => e.NombreArchivoOriginal)
                .HasMaxLength(255)
                .HasColumnName("nombre_archivo_original");
            entity.Property(e => e.NombreMolde)
                .HasMaxLength(200)
                .HasColumnName("nombre_molde");
            entity.Property(e => e.PesoBytes).HasColumnName("peso_bytes");
            entity.Property(e => e.VersionMolde)
                .HasColumnType("character varying")
                .HasColumnName("version_molde");

            entity.HasOne(d => d.IdUsuarioSubidaNavigation).WithMany(p => p.Moldes)
                .HasForeignKey(d => d.IdUsuarioSubida)
                .HasConstraintName("moldes_id_usuario_subida_fkey");
        });

        modelBuilder.Entity<Optimizacione>(entity =>
        {
            entity.HasKey(e => e.IdOpt).HasName("optimizaciones_pkey");

            entity.ToTable("optimizaciones");

            entity.HasIndex(e => e.IdOp, "idx_opt_op");

            entity.Property(e => e.IdOpt)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_opt");
            entity.Property(e => e.AprovechamientoPorcent)
                .HasPrecision(5, 2)
                .HasColumnName("aprovechamiento_porcent");
            entity.Property(e => e.ArchivoDxf).HasColumnName("archivo_dxf");
            entity.Property(e => e.DesperdicioM)
                .HasPrecision(9, 2)
                .HasColumnName("desperdicio_m");
            entity.Property(e => e.EsOptimaFinal)
                .HasDefaultValue(false)
                .HasColumnName("es_optima_final");
            entity.Property(e => e.Estado)
                .HasMaxLength(40)
                .HasDefaultValueSql("'generado'::character varying")
                .HasColumnName("estado");
            entity.Property(e => e.FechaGeneracion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_generacion");
            entity.Property(e => e.GeneradoPor).HasColumnName("generado_por");
            entity.Property(e => e.GiroPermitido)
                .HasMaxLength(20)
                .HasDefaultValueSql("'0'::character varying")
                .HasColumnName("giro_permitido");
            entity.Property(e => e.IdMolde).HasColumnName("id_molde");
            entity.Property(e => e.IdOp).HasColumnName("id_op");
            entity.Property(e => e.ImagenPrevisualizacion).HasColumnName("imagen_previsualizacion");
            entity.Property(e => e.MetricasJson).HasColumnName("metricas_json");
            entity.Property(e => e.NombreArchivoDxf).HasColumnName("nombre_archivo_dxf");
            entity.Property(e => e.NombreVersion)
                .HasMaxLength(100)
                .HasColumnName("nombre_version");
            entity.Property(e => e.Notas).HasColumnName("notas");
            entity.Property(e => e.OrientacionPiezas)
                .HasMaxLength(20)
                .HasDefaultValueSql("'restringida'::character varying")
                .HasColumnName("orientacion_piezas");
            entity.Property(e => e.RepeticionesNecesarias).HasColumnName("repeticiones_necesarias");
            entity.Property(e => e.RutaPngGenerado).HasColumnName("ruta_png_generado");
            entity.Property(e => e.TelaUtilizadaM)
                .HasPrecision(9, 2)
                .HasColumnName("tela_utilizada_m");
            entity.Property(e => e.TiempoEstimadoMin).HasColumnName("tiempo_estimado_min");
            entity.Property(e => e.VersionNum)
                .HasDefaultValue((short)1)
                .HasColumnName("version_num");

            entity.HasOne(d => d.GeneradoPorNavigation).WithMany(p => p.Optimizaciones)
                .HasForeignKey(d => d.GeneradoPor)
                .HasConstraintName("optimizaciones_generado_por_fkey");

            entity.HasOne(d => d.IdMoldeNavigation).WithMany(p => p.Optimizaciones)
                .HasForeignKey(d => d.IdMolde)
                .HasConstraintName("optimizaciones_id_molde_fkey");

            entity.HasOne(d => d.IdOpNavigation).WithMany(p => p.Optimizaciones)
                .HasForeignKey(d => d.IdOp)
                .HasConstraintName("optimizaciones_id_op_fkey");
        });

        modelBuilder.Entity<OrdenProduccion>(entity =>
        {
            entity.HasKey(e => e.IdOp).HasName("orden_produccion_pkey");

            entity.ToTable("orden_produccion");

            entity.HasIndex(e => e.Estado, "idx_op_estado");

            entity.HasIndex(e => e.CodigoOp, "orden_produccion_codigo_op_key").IsUnique();

            entity.Property(e => e.IdOp)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_op");
            entity.Property(e => e.ArchivoBlob).HasColumnName("archivo_blob");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.CodigoOp)
                .HasMaxLength(80)
                .HasColumnName("codigo_op");
            entity.Property(e => e.Comentarios).HasColumnName("comentarios");
            entity.Property(e => e.Estado)
                .HasMaxLength(40)
                .HasDefaultValueSql("'pendiente'::character varying")
                .HasColumnName("estado");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.FechaEntrega).HasColumnName("fecha_entrega");
            entity.Property(e => e.IdUsuarioCreador).HasColumnName("id_usuario_creador");
            entity.Property(e => e.Modelo)
                .HasMaxLength(150)
                .HasColumnName("modelo");
            entity.Property(e => e.Talla)
                .HasMaxLength(50)
                .HasColumnName("talla");

            entity.HasOne(d => d.IdUsuarioCreadorNavigation).WithMany(p => p.OrdenProduccions)
                .HasForeignKey(d => d.IdUsuarioCreador)
                .HasConstraintName("orden_produccion_id_usuario_creador_fkey");
        });

        modelBuilder.Entity<OrdenRollo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orden_rollos_pkey");

            entity.ToTable("orden_rollos");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.FechaAsignacion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_asignacion");
            entity.Property(e => e.IdOp).HasColumnName("id_op");
            entity.Property(e => e.IdRollo).HasColumnName("id_rollo");
            entity.Property(e => e.MetrajeAsignadoM)
                .HasPrecision(9, 2)
                .HasColumnName("metraje_asignado_m");

            entity.HasOne(d => d.IdOpNavigation).WithMany(p => p.OrdenRollos)
                .HasForeignKey(d => d.IdOp)
                .HasConstraintName("orden_rollos_id_op_fkey");

            entity.HasOne(d => d.IdRolloNavigation).WithMany(p => p.OrdenRollos)
                .HasForeignKey(d => d.IdRollo)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("orden_rollos_id_rollo_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.IdRole).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.NombreRole, "roles_nombre_role_key").IsUnique();

            entity.Property(e => e.IdRole)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_role");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .HasColumnName("descripcion");
            entity.Property(e => e.NombreRole)
                .HasMaxLength(50)
                .HasColumnName("nombre_role");
        });

        modelBuilder.Entity<RollosTela>(entity =>
        {
            entity.HasKey(e => e.IdRollo).HasName("rollos_tela_pkey");

            entity.ToTable("rollos_tela");

            entity.HasIndex(e => e.Estado, "idx_rollo_estado");

            entity.HasIndex(e => e.CodigoRollo, "rollos_tela_codigo_rollo_key").IsUnique();

            entity.Property(e => e.IdRollo)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_rollo");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.AltoCm)
                .HasPrecision(7, 2)
                .HasColumnName("alto_cm");
            entity.Property(e => e.AnchoCm)
                .HasPrecision(7, 2)
                .HasColumnName("ancho_cm");
            entity.Property(e => e.CodigoRollo)
                .HasMaxLength(80)
                .HasColumnName("codigo_rollo");
            entity.Property(e => e.Color)
                .HasMaxLength(80)
                .HasColumnName("color");
            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .HasDefaultValueSql("'disponible'::character varying")
                .HasColumnName("estado");
            entity.Property(e => e.FechaRecepcion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_recepcion");
            entity.Property(e => e.IdUsuarioRegistro).HasColumnName("id_usuario_registro");
            entity.Property(e => e.MetrajeM)
                .HasPrecision(9, 2)
                .HasColumnName("metraje_m");
            entity.Property(e => e.Proveedor)
                .HasMaxLength(150)
                .HasColumnName("proveedor");
            entity.Property(e => e.TipoTela)
                .HasMaxLength(100)
                .HasColumnName("tipo_tela");

            entity.HasOne(d => d.IdUsuarioRegistroNavigation).WithMany(p => p.RollosTelas)
                .HasForeignKey(d => d.IdUsuarioRegistro)
                .HasConstraintName("rollos_tela_id_usuario_registro_fkey");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("usuarios_pkey");

            entity.ToTable("usuarios");

            entity.HasIndex(e => e.Correo, "usuarios_correo_key").IsUnique();

            entity.Property(e => e.IdUsuario)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_usuario");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.ContrasenaHash)
                .HasMaxLength(255)
                .HasColumnName("contrasena_hash");
            entity.Property(e => e.Correo)
                .HasMaxLength(255)
                .HasColumnName("correo");
            entity.Property(e => e.CreadoEn)
                .HasDefaultValueSql("now()")
                .HasColumnName("creado_en");
            entity.Property(e => e.IdRole).HasColumnName("id_role");
            entity.Property(e => e.NombreCompleto)
                .HasMaxLength(150)
                .HasColumnName("nombre_completo");
            entity.Property(e => e.UltimoAcceso).HasColumnName("ultimo_acceso");

            entity.HasOne(d => d.IdRoleNavigation).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.IdRole)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("usuarios_id_role_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
