import api from "../api/axiosConfig";

export const registrarMolde = async (archivo, nombreMolde) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("nombreMolde", nombreMolde);

  try {
    const response = await api.post("/moldes/registrar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en registrarMolde:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const listarMoldes = async () => {
  try {
    const response = await api.get("/moldes/listar", { withCredentials: true });
    const data = response.data;

    // Normalizamos las claves para el frontend
    return data.map((m) => ({
      idMolde: m.IdMolde,
      codigoMolde: m.CodigoMolde,
      nombreMolde: m.NombreMolde,
      versionMolde: m.VersionMolde,
      fechaSubida: m.FechaSubida,
      nombreArchivoOriginal: m.NombreArchivoOriginal,
      usuarioSubida: m.UsuarioSubida,
    }));
  } catch (error) {
    console.error("Error en listarMoldes:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const buscarMoldes = async (campo, criterio) => {
  try {
    const response = await api.get(
      `/moldes/buscar?campo=${campo}&criterio=${criterio}`,
      {
        withCredentials: true,
      }
    );
    const data = response.data;
    return data.map((m) => ({
      idMolde: m.IdMolde,
      codigoMolde: m.CodigoMolde,
      nombreMolde: m.NombreMolde,
      versionMolde: m.VersionMolde,
      fechaSubida: m.FechaSubida,
      nombreArchivoOriginal: m.NombreArchivoOriginal,
    }));
  } catch (error) {
    console.error("Error en buscarMoldes:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const obtenerMoldePorId = async (id) => {
  try {
    const response = await api.get(`/moldes/${id}`, { withCredentials: true });
    const m = response.data;
    return {
      idMolde: m.IdMolde,
      codigoMolde: m.CodigoMolde,
      nombreMolde: m.NombreMolde,
      versionMolde: m.VersionMolde,
      fechaSubida: m.FechaSubida,
      nombreArchivoOriginal: m.NombreArchivoOriginal,
    };
  } catch (error) {
    console.error("Error en obtenerMoldePorId:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};

export const eliminarMolde = async (id) => {
  try {
    const response = await api.delete(`/moldes/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error en eliminarMolde:", error);
    throw error.response
      ? error.response.data
      : { message: "Error desconocido" };
  }
};
