/* eslint-env vitest */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,  } from "react-router-dom";
import MarcadorDigitalV2 from "../MarcadorDigitalV2";
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
      Promise.resolve({
        telaUtilizada: '69 m',
        tiempoEstimado: '3h 20min',
        aprovechamiento: '85%',
        desperdicio: '15 m',
        codigoOrden: 'OP-2025-001'
      })
  })
);

afterEach(() => {
  vi.clearAllMocks();
});

const renderUI = () =>
  render(
    <MemoryRouter>
      <MarcadorDigitalV2 />
    </MemoryRouter>
  );

describe("MarcadorDigitalV2", () => {
  it("muestra los datos del marcador correctamente cuando se cargan", async () => {
    renderUI();

    // Esperamos a que los datos se carguen
    await waitFor(() => screen.getByText("Marcador Digital V2"));

    // Verificamos que los datos del marcador se muestran correctamente
    expect(screen.getByText("Tela utilizada")).toHaveTextContent("69 m");
    expect(screen.getByText("Tiempo estimado")).toHaveTextContent("3h 20min");
    expect(screen.getByText("Aprovechamiento")).toHaveTextContent("85%");
    expect(screen.getByText("Desperdicio")).toHaveTextContent("15 m");
  });

  it("muestra el código de orden del marcador", async () => {
    renderUI();

    // Esperamos a que se carguen los datos
    await waitFor(() => screen.getByText("Marcador: OP-2025-001"));

    // Verificamos que el código de orden esté visible
    expect(screen.getByText("Marcador: OP-2025-001")).toBeInTheDocument();
  });

  it("navega a la página anterior cuando se hace clic en 'Volver'", async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return { ...actual, useNavigate: () => mockNavigate };
    });

    renderUI();

    // Simulamos el clic en el botón de 'Volver'
    const volverButton = screen.getByRole("button", { name: /←/ });
    await user.click(volverButton);

    // Verificamos que la función de navegación haya sido llamada correctamente
    expect(mockNavigate).toHaveBeenCalledWith(-1); // Vuelve a la página anterior
  });

  it("muestra la alerta al hacer clic en 'Descargar DXL'", async () => {
    const user = userEvent.setup();
    renderUI();

    // Simulamos el clic en el botón 'Descargar DXL'
    const downloadButton = screen.getByText("Descargar DXL");
    await user.click(downloadButton);

    // Verificamos que la alerta haya sido mostrada
    expect(window.alert).toHaveBeenCalledWith("Descargando marcador V2 en formato DXL");
  });

  it("muestra la alerta al hacer clic en 'Descargar PDF'", async () => {
    const user = userEvent.setup();
    renderUI();

    // Simulamos el clic en el botón 'Descargar PDF'
    const downloadButton = screen.getByText("Descargar en PDF");
    await user.click(downloadButton);

    // Verificamos que la alerta haya sido mostrada
    expect(window.alert).toHaveBeenCalledWith("Descargando marcador V2 en formato PDF");
  });

  it("muestra la pantalla de carga mientras se obtienen los datos", () => {
    renderUI();

    // Verificamos que el texto de "Cargando marcador..." esté presente mientras se cargan los datos
    expect(screen.getByText("Cargando marcador...")).toBeInTheDocument();
  });
});
