/* eslint-env vitest */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,  } from "react-router-dom";
import HistorialOptimizaciones from "../HistorialOptimizaciones";

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
        {
          id: 1,
          version: "v1",
          telaUtilizada: "84 m",
          desperdicio: "16 m",
          aprovechamiento: "85%",
          tiempoEstimado: "3h 00min",
          codigoOrden: "OP-2025-001"
        },
        {
          id: 2,
          version: "v2",
          telaUtilizada: "69 m",
          desperdicio: "15 m",
          aprovechamiento: "85%",
          tiempoEstimado: "3h 20min",
          codigoOrden: "OP-2025-001"
        }
      ])
  })
);

afterEach(() => {
  vi.clearAllMocks();
});

const renderUI = () =>
  render(
    <MemoryRouter>
      <HistorialOptimizaciones />
    </MemoryRouter>
  );

describe("Historial de optimizaciones", () => {
  it("muestra los datos de optimizaciones cuando se cargan correctamente", async () => {
    renderUI();

    // Esperamos a que los datos de optimizaciones se carguen
    await waitFor(() => screen.getByText("v1"));
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("84 m")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("navega a la página del marcador cuando se hace clic en 'Ver'", async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return { ...actual, useNavigate: () => mockNavigate };
    });

    renderUI();

    // Esperamos que los marcadores se carguen
    await waitFor(() => screen.getByText("v1"));

    // Simulamos el clic en el botón 'Ver' del primer marcador
    const verButton = screen.getAllByText("[Ver]")[0];
    await user.click(verButton);

    // Verificamos que la función de navegación haya sido llamada correctamente
    expect(mockNavigate).toHaveBeenCalledWith("/marcador/v1");
  });

  it("navega a la página anterior cuando se hace clic en 'Volver'", async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return { ...actual, useNavigate: () => mockNavigate };
    });

    renderUI("OP-2025-001");

    // Esperamos que el código de la orden esté visible
    await waitFor(() => screen.getByText("OP-2025-001"));

    // Simulamos el clic en el botón de 'Volver'
    const volverButton = screen.getByRole("button", { name: /←/ });
    await user.click(volverButton);

    // Verificamos que la función de navegación haya sido llamada correctamente
    expect(mockNavigate).toHaveBeenCalledWith("/ordenesdisponibles");
  });

  it("muestra el mensaje 'No hay optimizaciones registradas' si no hay datos", async () => {
    // Simulamos que la respuesta de la API está vacía
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    });

    renderUI();

    // Esperamos que se muestre el mensaje de que no hay optimizaciones
    await waitFor(() => screen.getByText("No hay optimizaciones registradas"));
    expect(screen.getByText("No hay optimizaciones registradas")).toBeInTheDocument();
  });

  it("muestra el código de orden si se pasa como parámetro", async () => {
    renderUI("OP-2025-001");

    // Esperamos a que el código de orden se muestre
    await waitFor(() => screen.getByText("OP-2025-001"));
    expect(screen.getByText("OP-2025-001")).toBeInTheDocument();
  });
});
