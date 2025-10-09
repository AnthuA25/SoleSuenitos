/* eslint-env vitest */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// 👇 Polyfill NECESARIO para que SweetAlert2 (real) no reviente si se cuela.
//   Aunque vamos a mockear, esto es inocuo.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),        // legacy
    removeListener: vi.fn(),     // legacy
    addEventListener: vi.fn(),   // moderno
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 👇 MOCK de sweetalert2 ANTES de importar el componente
vi.mock("sweetalert2", () => {
  const fire = vi.fn(() => Promise.resolve({}));
  const toastFire = vi.fn(() => Promise.resolve({}));
  const mixin = vi.fn(() => ({ fire: toastFire }));

  return {
    default: {
      fire,
      mixin,
      close: vi.fn(),
      isVisible: vi.fn(),
      update: vi.fn(),
    },
  };
});

import GestionMoldes from "../GestionMoldes";
import Swal from "sweetalert2";

// mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ⚠️ Importante: no “restoreAllMocks” (desharía el mock del módulo).
afterEach(() => {
  vi.clearAllMocks();
});

const renderUI = () =>
  render(
    <MemoryRouter>
      <GestionMoldes />
    </MemoryRouter>
  );

describe("Gestión de Moldes", () => {
  it("renderiza títulos, dropzone, nombre y botones", () => {
    renderUI();
    expect(screen.getByRole("heading", { name: /gestión de moldes/i })).toBeInTheDocument();
    expect(screen.getByText(/registrar molde/i)).toBeInTheDocument();
    expect(screen.getByText(/arrastra para subir/i)).toBeInTheDocument();
    expect(screen.getByText(/seleccionar archivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre del molde/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar molde/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it("sube un .dxl por input y confirma el modal", async () => {
    const user = userEvent.setup();
    renderUI();

    const fileInput = screen.getByLabelText(/seleccionar archivo/i, { selector: "input[type='file']" });
    const file = new File(["contenido"], "molde.dxl", { type: "application/octet-stream" });

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmación de subida
      .mockResolvedValueOnce({});                   // éxito posterior

    await user.upload(fileInput, file);

    expect(Swal.fire).toHaveBeenCalled();
  });

  it("drag & drop con extensión inválida dispara error", async () => {
    renderUI();

    const dropText = screen.getByText(/arrastra para subir/i);
    const badFile = new File(["x"], "not-valid.txt", { type: "text/plain" });

    fireEvent.drop(dropText, {
      preventDefault: () => {},
      dataTransfer: { files: [badFile] },
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Formato incorrecto",
          text: "Por favor, sube un archivo .dxl",
          icon: "error",
        })
      );
    });
  });

  it("validación: sin archivo muestra 'Archivo requerido'", async () => {
    const user = userEvent.setup();
    renderUI();

    await user.type(screen.getByLabelText(/nombre del molde/i), "Molde Pantalón");
    await user.click(screen.getByRole("button", { name: /guardar molde/i }));

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Archivo requerido",
        text: "Por favor, carga un archivo .dxl",
        icon: "warning",
      })
    );
  });

  it("validación: sin nombre muestra 'Nombre requerido'", async () => {
    const user = userEvent.setup();
    renderUI();

    const fileInput = screen.getByLabelText(/seleccionar archivo/i, { selector: "input[type='file']" });
    const file = new File(["contenido"], "molde.dxl", { type: "application/octet-stream" });

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmar subida
      .mockResolvedValueOnce({});                   // éxito de subida

    await user.upload(fileInput, file);
    await user.click(screen.getByRole("button", { name: /guardar molde/i }));

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nombre requerido",
        text: "Por favor, ingresa un nombre para el molde",
        icon: "warning",
      })
    );
  });

  it("flujo feliz: confirmar registro → éxito y limpia formulario", async () => {
    const user = userEvent.setup();
    renderUI();

    const fileInput = screen.getByLabelText(/seleccionar archivo/i, { selector: "input[type='file']" });
    const file = new File(["contenido"], "molde.dxl", { type: "application/octet-stream" });

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmar subida
      .mockResolvedValueOnce({});                   // éxito subida

    await user.upload(fileInput, file);

    const nombre = screen.getByLabelText(/nombre del molde/i);
    await user.type(nombre, "Molde Pantalón");

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmar registro
      .mockResolvedValueOnce({});                   // éxito registro

    await user.click(screen.getByRole("button", { name: /guardar molde/i }));

    await waitFor(() => {
      expect(nombre).toHaveValue("");
    });
    expect(screen.getByText(/arrastra para subir/i)).toBeInTheDocument();
  });

  it("Cancelar con cambios: confirma limpiar", async () => {
    const user = userEvent.setup();
    renderUI();

    const nombre = screen.getByLabelText(/nombre del molde/i);
    await user.type(nombre, "Molde X");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => {
      expect(nombre).toHaveValue("");
    });
  });

  it("Cerrar sesión: confirma y navega a '/'", async () => {
    const user = userEvent.setup();
    renderUI();

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmar cerrar sesión
      .mockResolvedValueOnce({});                   // toast success

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
