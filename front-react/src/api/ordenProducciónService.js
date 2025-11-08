import api from "../api/axiosConfig"; 


export const leerPiezas = async (formData) => {
  try {
    const response = await api.post("/OrdenProduccion/leer-piezas", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en leerPiezas:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido al leer piezas." };
  }
};

// Generar optimización V1
export const generarV1 = async (formData) => {
  try {
    const response = await api.post("/OrdenProduccion/generar-v1", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en generarV1:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido al generar V1." };
  }
};

// Generar optimización V2
export const generarV2 = async (formData) => {
  try {
    const response = await api.post("/OrdenProduccion/generar-v2", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en generarV2:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido al generar V2." };
  }
};

export const compararOptimizaciones = async (formData) => {
  try {
    const res = await api.post("/OrdenProduccion/comparar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error en compararOptimizaciones:", error);
    throw (
      error.response?.data || {
        message: "Error al comparar optimizaciones.",
      }
    );
  }
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

export const listarRollos = async () => {
  try {
    const res = await api.get("/rollos/listar", { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error en listarRollos:", error);
    throw error.response?.data || { message: "Error al listar rollos" };
  }
};
