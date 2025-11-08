import api from "./axiosConfig";

export const login = async (correo, contrasena) => {
  try {
    const response = await api.post("/auth/login", { correo, contrasena });
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: "Error de conexión con el servidor." };
  }
};

export const resetPassword = async (correo, nuevaContrasena, confirmarContrasena) => {
  try {
    const response = await api.post("/auth/reset-password", {
      correo,
      nuevaContrasena,
      confirmarContrasena,
    });
    return response.data; 
  } catch (error) {
    console.error("Error en resetPassword:", error);
    throw error.response?.data || { message: "Error de conexión con el servidor." };
  }
};
