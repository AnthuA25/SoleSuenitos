/* eslint-env vitest */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AprobacionMarcadores from "../AprobacionMarcadores";
import {global,Swal} from "vitest";

// Mock de SweetAlert2 (si lo usas para mostrar alertas o confirmaciones)
vi.mock("sweetalert2", () => {
  const fire = vi.fn(() => Promise.resolve({}));
  return { default: { fire } };
});

// Mock de fetch para simular la API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { id: 1, descripcion: "Marcador V1", estado: "Pendiente" },
        { id: 2, descripcion: "Marcador V2", estado: "Pendiente" },
      ]),
  })
);

afterEach(() => {
  vi.clearAllMocks();
});

const renderUI = () =>
  render(
    <MemoryRouter>
      <AprobacionMarcadores />
    </MemoryRouter>
  );

describe("Aprobación de Marcadores", () => {
  it("muestra los marcadores cargados", async () => {
    renderUI();

    // Esperamos a que se carguen los marcadores
    await waitFor(() => screen.getByText("Marcador V1"));

    // Verificamos que los marcadores estén presentes
    expect(screen.getByText("Marcador V1")).toBeInTheDocument();
    expect(screen.getByText("Marcador V2")).toBeInTheDocument();
  });

  it("aprueba un marcador cuando se hace clic en 'Aprobar'", async () => {
    const user = userEvent.setup();
    renderUI();

    // Esperamos a que los marcadores se carguen
    await waitFor(() => screen.getByText("Marcador V1"));

    // Simulamos el clic en el botón de aprobar
    const aprobarButton = screen.getAllByText("Aprobar")[0];
    await user.click(aprobarButton);

    // Verificamos que se haya llamado al `fetch` de la API para aprobar el marcador
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/marcadores/1/aprobar",
      expect.objectContaining({ method: "PATCH" })
    );

    // Verificamos que SweetAlert2 haya mostrado una alerta
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Marcador 1 aprobado ✅",
      })
    );
  });

  it("muestra un mensaje de error si no se puede aprobar un marcador", async () => {
    // Simulamos un error en la llamada de aprobación
    fetch.mockRejectedValueOnce(new Error("Error al aprobar"));

    renderUI();

    // Esperamos a que los marcadores se carguen
    await waitFor(() => screen.getByText("Marcador V1"));

    const aprobarButton = screen.getAllByText("Aprobar")[0];
    fireEvent.click(aprobarButton);

    // Verificamos que se haya mostrado el mensaje de error
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error al aprobar el marcador",
        icon: "error",
      })
    );
  });

  it("muestra un mensaje si no hay marcadores pendientes", async () => {
    // Simulamos una respuesta vacía de la API (sin marcadores pendientes)
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([]),
    });

    renderUI();

    // Esperamos a que los marcadores se carguen
    await waitFor(() => screen.getByText("No hay marcadores pendientes de aprobación"));

    expect(screen.getByText("No hay marcadores pendientes de aprobación")).toBeInTheDocument();
  });
});
