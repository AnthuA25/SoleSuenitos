import api from "../api/axiosConfig";

export const listarOrdenesDisponibles = async () => {
  try {
    const response = await api.get("/InspeccionesCalidad/ordenes-disponibles", {
      withCredentials: true,
    });
    return response.data.map((o) => ({
      idOp: o.IdOp,
      codigo: o.CodigoOp,
      producto: o.Modelo,
      estado: o.Estado,
      fechaCreacion: o.FechaCreacion
        ? new Date(o.FechaCreacion).toISOString()
        : null,
      cantidad: o.Cantidad,
    }));
  } catch (error) {
    console.error("Error al listar órdenes disponibles:", error);
    throw (
      error.response?.data || {
        message: "Error al listar órdenes disponibles.",
      }
    );
  }
};

export const obtenerOrden = async (idOp) => {
  const response = await api.get(`/InspeccionesCalidad/orden/${idOp}`, {
    withCredentials: true,
  });
  return response.data;
};

// Registrar una nueva inspección
export const registrarInspeccion = async (data) => {
  try {
    const response = await api.post("/InspeccionesCalidad/registrar", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al registrar inspección:", error);
    throw error.response?.data || { message: "Error al registrar inspección" };
  }
};

// Subir evidencia para un criterio
export const subirEvidencia = async (idInspeccion, criterio, archivo) => {
  try {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const response = await api.post(
      `/InspeccionesCalidad/${idInspeccion}/subir-evidencia/${criterio}`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al subir evidencia:", error);
    throw error.response?.data || { message: "Error al subir evidencia" };
  }
};

export const listarInspecciones = async () => {
  try {
    const response = await api.get("/InspeccionesCalidad/listar", {
      withCredentials: true,
    });

    return response.data.map((i) => ({
      id: i.IdInspeccion,
      codigo: i.CodigoInspeccion,
      producto: i.Producto,
      fecha: new Date(i.Fecha).toLocaleDateString(),
      orden: i.OrdenProduccion,
      resultado: i.Resultado,
      estado: i.Estado,
      inspector: i.Inspector,
    }));
  } catch (error) {
    console.error("Error al listar inspecciones:", error);
    throw error.response?.data || { message: "Error al listar inspecciones" };
  }
};
export const obtenerInspeccion = async (id) => {
  const response = await api.get(`/InspeccionesCalidad/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const descargarReporte = (id) => {
  window.open(
    `${api.defaults.baseURL}/InspeccionesCalidad/reporte/${id}`,
    "_blank"
  );
};

export const eliminarInspeccion = async (id) => {
  const response = await api.delete(`/InspeccionesCalidad/${id}`, {
    withCredentials: true,
  });
  return response.data;
};