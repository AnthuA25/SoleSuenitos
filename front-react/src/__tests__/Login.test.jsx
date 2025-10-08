/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";

// mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// mock sweetalert2
import Swal from "sweetalert2";
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(() => Promise.resolve({})) },
}));

// mock PasswordInput
vi.mock("../components/PasswordInput.jsx", () => ({
  default: (props) => <input type="password" {...props} />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe("Login", () => {
  it("renderiza email, rol, contraseña y botón", () => {
    renderLogin();

    expect(
      screen.getByPlaceholderText(/correo@sole\.suenitos\.com/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeEnabled();
  });

  it("con credenciales válidas muestra Swal y navega a /moldes", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/correo@sole\.suenitos\.com/i),
      "usuario@sole.suenitos.com"
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /Encargado de Logística/i })
    );
    await user.type(screen.getByPlaceholderText(/contraseña/i), "ClaveSecreta123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(Swal.fire).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/moldes");
    });
  });

  it("si faltan datos muestra error y NO navega", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        text: "Debes ingresar tus credenciales",
        icon: "error",
      })
    );

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
