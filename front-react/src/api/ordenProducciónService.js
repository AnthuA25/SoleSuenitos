import api from "./axiosConfig"; 

// Leer piezas desde un DXF
export const leerPiezas = async (archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const response = await api.post("/ordenproduccion/leer-piezas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Generar versión V1
export const generarV1 = async (modelo, talla, cantidad, rollosSeleccionados, archivoMolde, permitirGiro90 = true) => {
  const formData = new FormData();
  formData.append("modelo", modelo);
  formData.append("talla", talla);
  formData.append("cantidad", cantidad);
  rollosSeleccionados.forEach((id) => formData.append("rollosSeleccionados", id));
  formData.append("archivoMolde", archivoMolde);
  formData.append("permitirGiro90", permitirGiro90);
  const response = await api.post("/ordenproduccion/generar-v1", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Generar versión V2
export const generarV2 = async (modelo, talla, cantidad, rollosSeleccionados, archivoMolde, permitirGiro90 = true) => {
  const formData = new FormData();
  formData.append("modelo", modelo);
  formData.append("talla", talla);
  formData.append("cantidad", cantidad);
  rollosSeleccionados.forEach((id) => formData.append("rollosSeleccionados", id));
  formData.append("archivoMolde", archivoMolde);
  formData.append("permitirGiro90", permitirGiro90);
  const response = await api.post("/ordenproduccion/generar-v2", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Comparar versiones
export const comparar = async (modelo, talla, cantidad, rollosSeleccionados, archivoMolde, permitirGiro90 = true) => {
  const formData = new FormData();
  formData.append("modelo", modelo);
  formData.append("talla", talla);
  formData.append("cantidad", cantidad);
  rollosSeleccionados.forEach((id) => formData.append("rollosSeleccionados", id));
  formData.append("archivoMolde", archivoMolde);
  formData.append("permitirGiro90", permitirGiro90);
  const response = await api.post("/ordenproduccion/comparar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
