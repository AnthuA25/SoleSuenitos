import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Swal from "sweetalert2";
import HistorialOptimizaciones from "../HistorialOptimizaciones";

// Mock de sweetalert2
vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: vi.fn() },
  fire: vi.fn(),
}));

// Mock de useNavigate para simular la navegación
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate, // mockea correctamente useNavigate
  };
});

// Datos iniciales
const seedOptimizaciones = [
  {
    id: 1,
    modelo: "Pijama invierno",
    talla: "M",
    fecha: "2025-10-15",
    telaUtilizada: "3.2 m",
    aprovechamiento: "92%",
    desperdicio: "8%",
  },
  {
    id: 2,
    modelo: "Polo clásico",
    talla: "L",
    fecha: "2025-10-10",
    telaUtilizada: "2.7 m",
    aprovechamiento: "88%",
    desperdicio: "12%",
  },
];

// Antes de cada prueba
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear(); // Asegura que no haya datos residuales entre pruebas
  localStorage.setItem("optimizaciones", JSON.stringify(seedOptimizaciones));
});

describe("Historial de Optimización", () => {
  it("renderiza el componente correctamente", () => {
    render(
      <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
        <Routes>
          <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
        </Routes>
      </MemoryRouter>
    );

    // Verifica el título
    expect(screen.getByRole("heading", { name: /reportes de optimización/i })).toBeInTheDocument();
  });

  it("muestra los datos de optimización en la tabla", () => {
    render(
      <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
        <Routes>
          <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
        </Routes>
      </MemoryRouter>
    );

    // Verifica que los datos estén presentes en la tabla
    expect(screen.getByText("Pijama invierno")).toBeInTheDocument();
    expect(screen.getByText("Polo clásico")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay optimizaciones", async () => {
    // Simula la ausencia de datos
    localStorage.setItem("optimizaciones", JSON.stringify([]));

    render(
      <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
        <Routes>
          <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
        </Routes>
      </MemoryRouter>
    );

    // Usa un matcher flexible para encontrar el texto
    const message = await screen.findByText(/no hay optimizaciones registradas aún/i);
    expect(message).toBeInTheDocument();
  });

  it("muestra los detalles de la optimización cuando se hace click en 'Ver'", async () => {
    render(
      <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
        <Routes>
          <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
        </Routes>
      </MemoryRouter>
    );

    const verBtns = screen.getAllByText("Ver");
    fireEvent.click(verBtns[0]);

    // Verifica que los detalles del molde se muestran en un Swal
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "<strong>Detalles de Optimización</strong>",
          html: expect.stringContaining("Pijama invierno"),
        })
      );
    });
  });

  it("elimina una optimización cuando se hace click en 'Eliminar'", async () => {
    // Simula la confirmación antes de hacer clic
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    render(
      <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
        <Routes>
          <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
        </Routes>
      </MemoryRouter>
    );

    const eliminarBtns = screen.getAllByText("Eliminar");
    fireEvent.click(eliminarBtns[0]);

    // Verifica que el Swal de confirmación sea mostrado
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "¿Eliminar optimización?",
        })
      );
    });

    // Verifica que la optimización haya sido eliminada de la lista
    await waitFor(() => {
      expect(screen.queryByText("Pijama invierno")).not.toBeInTheDocument();
    });
  });

 it("cerrar sesión muestra el Swal de confirmación y navega a la página de inicio", async () => {
  render(
    <MemoryRouter initialEntries={["/historialoptimizaciones"]}>
      <Routes>
        <Route path="/historialoptimizaciones" element={<HistorialOptimizaciones />} />
      </Routes>
    </MemoryRouter>
  );

  // Abre el menú de usuario
  const userButton = screen.getByText("Sole Sueñitos"); // Accede al nombre del usuario
  fireEvent.click(userButton); // Clic en el nombre del usuario para desplegar el menú

  // Simula la respuesta de Swal.fire cuando se haga clic en "Cerrar sesión"
  Swal.fire.mockResolvedValueOnce({ isConfirmed: true }); // Simula una respuesta positiva de Swal.fire

  // Busca el botón de cerrar sesión y haz clic
  const cerrarSesionBtn = await screen.findByRole("button", { name: /cerrar sesión/i });
  fireEvent.click(cerrarSesionBtn);

  // Verifica que el Swal de confirmación sea mostrado
  await waitFor(() => {
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "¿Cerrar sesión?",
      })
    );
  });

  // Simula la confirmación
  Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

  // Verifica que la navegación se haya hecho hacia la página de inicio
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});


});
