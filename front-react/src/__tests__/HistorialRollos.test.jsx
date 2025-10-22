import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HistorialRollos from "../HistorialRollos";

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

function renderHR() {
  return render(
    <MemoryRouter initialEntries={["/historialrollos"]}>
      <Routes>
        <Route path="/historialrollos" element={<HistorialRollos />} />
      </Routes>
    </MemoryRouter>
  );
}

const seedRollos = [
  {
    codigo: "R-001",
    metraje: "120",
    color: "Azul",
    tipoTela: "Algodón",
    ancho: "1500",
    proveedor: "Proveedor A",
    estado: "Disponible",
    fechaIngreso: "2025-01-10 09:00",
  },
  {
    codigo: "R-002",
    metraje: "80",
    color: "Rojo",
    tipoTela: "Poliéster",
    ancho: "1600",
    proveedor: "Proveedor B",
    estado: "Agotado",
    fechaIngreso: "2024-12-20 08:00",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("rollos", JSON.stringify(seedRollos));
});

describe("Historial de Rollos", () => {
  it("renderiza título, filtros y tabla con filas", () => {
    renderHR();

    expect(
      screen.getByRole("heading", { name: /historial de rollos/i })
    ).toBeInTheDocument();

    // Filtros
    expect(screen.getByPlaceholderText(/buscar código/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();

    // Tabla y filas
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("R-001")).toBeInTheDocument();
    expect(screen.getByText("R-002")).toBeInTheDocument();
  });

  it("filtra por código", () => {
    renderHR();

    fireEvent.change(screen.getByPlaceholderText(/buscar código/i), {
      target: { value: "R-001" },
    });

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length).toBe(2);
    expect(screen.getByText("R-001")).toBeInTheDocument();
    expect(screen.queryByText("R-002")).not.toBeInTheDocument();
  });

  it("filtra por estado", () => {
    renderHR();

    fireEvent.change(screen.getByDisplayValue(/estado/i), {
      target: { value: "Disponible" },
    });

    const table = screen.getByRole("table");
    const bodyCells = within(table).getAllByRole("cell").map((c) => c.textContent);
    expect(bodyCells.join(" ")).toMatch(/R-001/);
    expect(bodyCells.join(" ")).not.toMatch(/R-002/);
  });

  it("reset de filtros", () => {
    renderHR();

    fireEvent.change(screen.getByPlaceholderText(/buscar código/i), {
      target: { value: "R-001" },
    });
    fireEvent.change(screen.getByDisplayValue(/estado/i), {
      target: { value: "Disponible" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByText("R-001")).toBeInTheDocument();
    expect(screen.getByText("R-002")).toBeInTheDocument();
  });

  it("ordena por fecha ingreso al hacer click en el header", () => {
    renderHR();

    const thFecha = screen.getByText(/fecha ingreso/i);
    fireEvent.click(thFecha);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstDataRowCells = within(rows[1]).getAllByRole("cell");
    expect(firstDataRowCells[0]).toHaveTextContent("R-002");

    fireEvent.click(thFecha);
    const rows2 = within(table).getAllByRole("row");
    const firstDataRowCells2 = within(rows2[1]).getAllByRole("cell");
    expect(firstDataRowCells2[0]).toHaveTextContent("R-001");
  });

  it("abre modal de edición, guarda y persiste cambios", async () => {
    renderHR();

    // Abre el modal
    const editarBtns = screen.getAllByTitle(/editar/i);
    fireEvent.click(editarBtns[0]);

    // Encuentra inputs por placeholder en lugar de label (no hay for/id en el componente)
    const inputs = screen.getAllByRole("textbox");
    // color y proveedor son los últimos dos textboxes
    const colorInput = inputs.find((i) => i.value === "Azul");
    const provInput = inputs.find((i) => i.value === "Proveedor A");

    fireEvent.change(colorInput, { target: { value: "Verde" } });
    fireEvent.change(provInput, { target: { value: "Proveedor Z" } });

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(swalFire).toHaveBeenCalled();

    const saved = JSON.parse(localStorage.getItem("rollos") || "[]");
    expect(saved[0].color).toBe("Verde");
    expect(saved[0].proveedor).toBe("Proveedor Z");
  });

  it("elimina un rollo tras confirmar", async () => {
    renderHR();

    swalFire.mockResolvedValueOnce({ isConfirmed: true });

    const eliminarBtns = screen.getAllByTitle(/eliminar/i);
    fireEvent.click(eliminarBtns[0]);

    // Espera al re-render
    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = within(table).getAllByRole("row");
      expect(rows.length).toBe(2);
    });

    expect(swalFire).toHaveBeenCalled();
  });

  it("logout: abrir menú de usuario y confirmar", async () => {
    renderHR();

    fireEvent.click(screen.getByText(/sole suenito/i));
    swalFire.mockResolvedValueOnce({ isConfirmed: true });

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesi(ó|o)n/i }));

    await Promise.resolve();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("sidebar: navega a 'Orden de Producción' y 'Recepción de Rollos'", () => {
    renderHR();

    fireEvent.click(screen.getByText(/orden de producción/i));
    expect(mockNavigate).toHaveBeenCalledWith("/ordenproduccion");

    fireEvent.click(screen.getByText(/recepción de rollos/i));
    expect(mockNavigate).toHaveBeenCalledWith("/recepcionrollos");
  });
});
