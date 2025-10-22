// __tests__/HistorialMoldes.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HistorialMoldes from "../HistorialMoldes";

// --- Mocks --- //
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const swalFire = vi.fn();
vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: (...args) => swalFire(...args) },
  fire: (...args) => swalFire(...args),
}));

function renderHM() {
  return render(
    <MemoryRouter initialEntries={["/historialmoldes"]}>
      <Routes>
        <Route path="/historialmoldes" element={<HistorialMoldes />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HistorialMoldes (componente)", () => {
  it("renderiza título, filtros, botones y la tabla con filas", () => {
    renderHM();

    // Título
    expect(screen.getByRole("heading", { name: /historial de moldes/i })).toBeInTheDocument();

    // Input de búsqueda placeholder "Buscar"
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();

    // Select (combobox) y botón reset (texto "Resetear")
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resetear/i })).toBeInTheDocument();

    // Tabla: header + 2 filas de datos => al menos 3 filas
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length).toBeGreaterThanOrEqual(3);

    // Contenido inicial
    expect(screen.getByText("M-001")).toBeInTheDocument();
    expect(screen.getByText("M-002")).toBeInTheDocument();
  });

  it("filtra por código (filtro por defecto 'codigo')", async () => {
    renderHM();

    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.clear(input);
    await userEvent.type(input, "M-001");

    await waitFor(() => {
      expect(screen.getByText("M-001")).toBeInTheDocument();
      expect(screen.queryByText("M-002")).not.toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length).toBe(2); // header + 1 fila filtrada
  });

  it("filtra por 'nombre' al cambiar el select", async () => {
    renderHM();

    // seleccionar opción por value "nombre"
    const combobox = screen.getByRole("combobox");
    await userEvent.selectOptions(combobox, "nombre");

    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.clear(input);
    await userEvent.type(input, "Pantalón");

    await waitFor(() => {
      expect(screen.getByText("M-002")).toBeInTheDocument();
      expect(screen.queryByText("M-001")).not.toBeInTheDocument();
    });
  });

  it("resetear filtros muestra de nuevo todos los moldes", async () => {
    renderHM();

    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, "M-001");

    // comprobar filtrado
    await waitFor(() => expect(screen.getByText("M-001")).toBeInTheDocument());

    // click resetear
    await userEvent.click(screen.getByRole("button", { name: /resetear/i }));

    await waitFor(() => {
      expect(screen.getByText("M-001")).toBeInTheDocument();
      expect(screen.getByText("M-002")).toBeInTheDocument();
    });
  });

  it("ver detalles: al clickear el icono se invoca Swal.fire", async () => {
    renderHM();

    const verBtns = screen.getAllByTitle(/ver detalles/i);
    expect(verBtns.length).toBeGreaterThan(0);

    // Simulamos que Swal.fire devuelve una promesa vacía cuando se usa solo para mostrar
    swalFire.mockResolvedValueOnce({});

    await userEvent.click(verBtns[0]);

    await waitFor(() => {
      expect(swalFire).toHaveBeenCalled();
      // opcional: comprobar que se llamó con un title esperado
      const firstCall = swalFire.mock.calls[0][0];
      expect(firstCall).toHaveProperty("title");
      expect(String(firstCall.title).toLowerCase()).toContain("detalles");
    });
  });

  it("eliminar: si confirma, se remueve la fila y se muestra feedback (Swal)", async () => {
    renderHM();

    // La primera llamada (confirmación) debe devolver isConfirmed: true
    swalFire.mockResolvedValueOnce({ isConfirmed: true });
    // Posterior llamada (mensaje eliminado) también se resuelve
    swalFire.mockResolvedValueOnce({});

    const eliminarBtns = screen.getAllByTitle(/eliminar/i);
    expect(eliminarBtns.length).toBeGreaterThan(0);

    await userEvent.click(eliminarBtns[0]);

    // Espera a que la fila sea removida
    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = within(table).getAllByRole("row");
      // header + 1 fila restante
      expect(rows.length).toBe(2);
    });

    // Swal fue llamado al menos para confirmar
    expect(swalFire).toHaveBeenCalled();
  });

  it("Registrar: botón navega a /moldes", async () => {
    renderHM();

    const btnRegistrar = screen.getByRole("button", { name: /registrar molde/i });
    await userEvent.click(btnRegistrar);

    expect(mockNavigate).toHaveBeenCalledWith("/moldes");
  });

  it("sidebar: items navegan a las rutas correspondientes", async () => {
    renderHM();

    // Click en "Gestión de Moldes" navega a /moldes
    await userEvent.click(screen.getByText(/gestión de moldes/i));
    expect(mockNavigate).toHaveBeenCalledWith("/moldes");

    // Click en "Recepción de Rollos"
    await userEvent.click(screen.getByText(/recepción de rollos/i));
    expect(mockNavigate).toHaveBeenCalledWith("/recepcionrollos");

    // Click en "Orden de Producción"
    await userEvent.click(screen.getByText(/orden de producción/i));
    expect(mockNavigate).toHaveBeenCalledWith("/ordenproduccion");
  });

  it("logout: abre menú de usuario y confirma cierre de sesión (navega a /)", async () => {
    renderHM();

    // Abrir menú (texto del usuario "Sole Suenito")
    await userEvent.click(screen.getByText(/sole suenito/i));

    // Mock confirmación de Swal (para cerrar sesión)
    swalFire.mockResolvedValueOnce({ isConfirmed: true });

    // Click en el botón "Cerrar sesión" dentro del dropdown
    const cerrarBtn = screen.getByRole("button", { name: /cerrar sesión/i });
    await userEvent.click(cerrarBtn);

    // Esperamos microtasks
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
