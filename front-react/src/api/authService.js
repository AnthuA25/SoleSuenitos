// src/api/authService.js
import api from "./axiosConfig";

export const login = async (correo, contrasena) => {
  try {
    const response = await api.post("/auth/login", { correo, contrasena });
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: "Error de conexión con el servidor." };
  }
};

export const register = async (nombreCompleto, correo, contrasena, idRole) => {
  const response = await api.post("/auth/register", {
    nombreCompleto,
    correo,
    contrasena,
    idRole,
  });
  return response.data;
};
