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

export const filtrarRollos = async (campo, criterio, estado) => {
  try {
    const params = new URLSearchParams();
    if (campo) params.append("campo", campo);
    if (criterio) params.append("criterio", criterio);
    if (estado) params.append("estado", estado);

    const response = await api.get(`/rollos/filtrar?${params.toString()}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en filtrarRollos:", error);
    throw error.response?.data || { message: "Error desconocido" };
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
