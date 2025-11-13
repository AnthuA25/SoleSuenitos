import api from "../api/axiosConfig";

const mapOrden = (o) => ({
  idOp: o.IdOp,
  codigoOp: o.CodigoOp,
  modelo: o.Modelo,
  talla: o.Talla,
  cantidad: o.Cantidad,
  estado: o.Estado,
  fechaCreacion: o.FechaCreacion,
  fechaEntrega: o.FechaEntrega,
  optimizaciones: o.optimizaciones || o.Optimizaciones?.map(mapOptimizacion) || [],
  comentarios: o.comentarios || o.Comentarios?.map(mapComentario) || [],
});

const mapOptimizacion = (opt) => ({
  idOpt: opt.IdOpt,
  versionNum: opt.VersionNum,
  nombreVersion: opt.NombreVersion,
  aprovechamientoPorcent: opt.AprovechamientoPorcent,
  desperdicioM: opt.DesperdicioM,
  telaUtilizadaM: opt.TelaUtilizadaM,
  estado: opt.Estado,
  rutaPngGenerado: opt.RutaPngGenerado,
  nombreArchivoDxf: opt.NombreArchivoDxf,
  esOptimaFinal: opt.EsOptimaFinal,
});

const mapComentario = (c) => ({
  idCom: c.IdCom,
  mensaje: c.Mensaje,
  fecha: c.Fecha,
  leido: c.Leido,
  usuario: c.Usuario,
  idUsuario: c.IdUsuario,
});

export const listarOrdenesDisponibles = async () => {
  try {
    const response = await api.get("/OrdenDisponibles/listar", {
      withCredentials: true,
    });
    return response.data.map(mapOrden);
  } catch (error) {
    console.error("Error en listarOrdenesDisponibles:", error);
    throw (
      error.response?.data || {
        message: "Error al listar órdenes disponibles.",
      }
    );
  }
};

//Listar optimizaciones por orden (V1, V2, etc.)
export const listarOptimizacionesPorOrden = async (idOp) => {
  try {
    const response = await api.get(`/OrdenDisponibles/listar/${idOp}`, { withCredentials: true });
    return response.data.map(mapOptimizacion);
  } catch (error) {
    console.error("Error en listarOptimizacionesPorOrden:", error);
    throw error.response?.data || { message: "Error al listar optimizaciones de la orden." };
  }
};

export const obtenerDetalleOptimizacion = async (idOpt) => {
  try {
    const response = await api.get(`/OrdenDisponibles/detalle/${idOpt}`, { withCredentials: true });
    const o = response.data;
    return {
      idOpt: o.IdOpt,
      idOp: o.IdOp,
      nombreVersion: o.NombreVersion,
      versionNum: o.VersionNum,
      aprovechamientoPorcent: o.AprovechamientoPorcent,
      desperdicioM: o.DesperdicioM,
      telaUtilizadaM: o.TelaUtilizadaM,
      tiempoEstimadoMin: o.TiempoEstimadoMin,
      rutaPngGenerado: o.RutaPngGenerado,
      nombreArchivoDxf: o.NombreArchivoDxf,
      metricasJson: o.MetricasJson,
      estado: o.Estado,
    };
  } catch (error) {
    console.error("Error en obtenerDetalleOptimizacion:", error);
    throw error.response?.data || { message: "Error al obtener detalle de optimización." };
  }
};

// Listar comentarios por orden
export const listarComentarios = async (idOp) => {
  try {
    const response = await api.get(`/ComentariosOp/listar/${idOp}`, { withCredentials: true });
    return response.data.map(mapComentario);
  } catch (error) {
    console.error("Error en listarComentarios:", error);
    throw error.response?.data || { message: "Error al listar comentarios de la orden." };
  }
};

// Agregar comentario
export const agregarComentario = async (comentario) => {
  try {
    const response = await api.post("/ComentariosOp/agregar", comentario, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en agregarComentario:", error);
    throw error.response?.data || { message: "Error al agregar comentario." };
  }
};


export const marcarComentarioLeido = async (idCom) => {
  try {
    const response = await api.put(
      `/ComentariosOp/marcar-leido/${idCom}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error en marcarComentarioLeido:", error);
    throw error.response?.data || { message: "Error al marcar comentario como leído." };
  }
};