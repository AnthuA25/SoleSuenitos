import api from "../api/axiosConfig";

export const registrarRollo = async (rollo) => {
  try {
    const response = await api.post("/rollos/registrar", rollo, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en registrarRollo:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const listarRollos = async () => {
  try {
    const response = await api.get("/rollos/listar", { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en listarRollos:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const obtenerRolloPorId = async (id) => {
  try {
    const response = await api.get(`/rollos/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en obtenerRolloPorId:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};

export const buscarRolloPorCodigo = async (criterio) => {
  try {
    const response = await api.get(`/rollos/buscar?criterio=${encodeURIComponent(criterio)}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return []; 
    console.error("Error en buscarRollos:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};

export const editarRollo = async (id, payload) => {
  try {
    const response = await api.put(`/rollos/${id}`, payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en editarRollo:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};

export const eliminarRollo = async (id) => {
  try {
    const response = await api.delete(`/rollos/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error en eliminarRollo:", error);
    throw error.response ? error.response.data : { message: "Error desconocido" };
  }
};
