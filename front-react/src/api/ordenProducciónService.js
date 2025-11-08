import api from "../api/axiosConfig"; 

// Generar optimización V1
export const generarV1 = async (formData) => {
  const res = await api.post("/OrdenProduccion/generar-v1", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Generar optimización V2
export const generarV2 = async (formData) => {
  const res = await api.post("/OrdenProduccion/generar-v2", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Listar optimizaciones
export const listarOptimizaciones = async () => {
  try {
    const response = await api.get("/OrdenProduccion/listar-optimizaciones", { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en listarOrdenProduccion:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};

// Obtener detalle de una optimización
export const obtenerDetalleOptimizacion = async (id) => {
  try {
    const response = await api.get(`/OrdenProduccion/detalle-optimizacion/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en obtenerProduccionPorId:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};

export const eliminarOrdenProduccion = async (id) => {
  try {
    const response = await api.delete(`/OrdenProduccion/eliminar-optimizacion/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en eliminarOrden:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};