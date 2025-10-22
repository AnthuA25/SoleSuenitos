import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OrdenProduccion from "../OrdenProduccion";

// --- Mocks --- //
const mockNavigate = vi.fn();

// Mock de react-router-dom: solo sobreescribimos useNavigate
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de SweetAlert2
const swalFire = vi.fn();
vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: (...args) => swalFire(...args) },
  fire: (...args) => swalFire(...args),
}));

function renderOP() {
  return render(
    <MemoryRouter initialEntries={["/ordenproduccion"]}>
      <Routes>
        <Route path="/ordenproduccion" element={<OrdenProduccion />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Limpia cualquier posible localStorage entre tests
  localStorage.clear();
});

describe("Orden de Producción", () => {
  it("renderiza título, campos (por placeholder) y botones visibles", () => {
    renderOP();

    // Título principal
    expect(
      screen.getByRole("heading", { name: /orden de producción/i })
    ).toBeInTheDocument();

    // Inputs por placeholder (tu markup no asocia label->input)
    expect(
      screen.getByPlaceholderText(/ej\. pijama de invierno/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ej\. s/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ej\. 10/i)).toBeInTheDocument();

    // Botones visibles en la vista principal
    expect(
      screen.getByRole("button", { name: /ver rollos disponibles/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subir molde/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /elegir molde/i }))
      .toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /optimizar corte/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i }))
      .toBeInTheDocument();

    // La tabla por defecto (3 filas de datos)
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    // 1 header + 3 rows de datos
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/delantero/i)).toBeInTheDocument();
    expect(screen.getByText(/espalda/i)).toBeInTheDocument();
    expect(screen.getByText(/manga/i)).toBeInTheDocument();
  });

  it("validación: al optimizar sin completar modelo/talla/cantidad muestra warning", () => {
    renderOP();

    fireEvent.click(screen.getByRole("button", { name: /optimizar corte/i }));

    expect(swalFire).toHaveBeenCalled();
    const args = swalFire.mock.calls.at(-1);
    // Tu componente llama Swal.fire("Completar", "Completa modelo, talla y cantidad", "warning")
    expect(args?.some?.((a) => a === "warning")).toBe(true);
  });

  it("validación: al optimizar con datos pero sin rollos seleccionados muestra warning", () => {
    renderOP();

    // Completa los campos (por placeholder)
    fireEvent.change(screen.getByPlaceholderText(/ej\. pijama de invierno/i), {
      target: { value: "Pijama invierno" },
    });
    fireEvent.change(screen.getByPlaceholderText(/ej\. s/i), {
      target: { value: "S" },
    });
    fireEvent.change(screen.getByPlaceholderText(/ej\. 10/i), {
      target: { value: "10" },
    });

    // No seleccionamos rollos -> debe advertir
    fireEvent.click(screen.getByRole("button", { name: /optimizar corte/i }));

    expect(swalFire).toHaveBeenCalled();
    const args = swalFire.mock.calls.at(-1);
    // Tu componente llama Swal.fire("Seleccionar rollos", "...", "warning")
    expect(args?.some?.((a) => a === "warning")).toBe(true);
  });

  it("Cerrar sesión: abre menú, confirma y navega a '/'", async () => {
    renderOP();

    // Abre el menú de usuario (div con texto 'Sole Sueñitos')
    fireEvent.click(screen.getByText(/sole sueñitos/i));

    // Mock confirmación positiva del Swal
    swalFire.mockResolvedValueOnce({ isConfirmed: true });

    fireEvent.click(
      screen.getByRole("button", { name: /cerrar sesi(ó|o)n/i })
    );

    // Espera a que se resuelva la promesa del .then()
    await Promise.resolve();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("Sidebar: navegar a 'Historial de Rollos'", () => {
    renderOP();

    const li = screen.getByText(/historial de rollos/i);
    fireEvent.click(li);

    expect(mockNavigate).toHaveBeenCalledWith("/historialrollos");
  });
});
