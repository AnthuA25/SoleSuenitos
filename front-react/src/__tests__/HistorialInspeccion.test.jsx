import React from 'react';
import { render, screen, fireEvent, waitFor,beforeEach } from '@testing-library/react';
import '@testing-library/jest-dom';
import Swal from 'sweetalert2';
import {jest,test ,expect,describe} from '@jest/globals';

// SUT
import HistorialInspeccion from '../src/HistorialInspeccion';

// ---- Mocks visuales/estáticos para no romper Jest ----
jest.mock('../../components/SliderMenu', () => () => null);
jest.mock('../../components/UserHeader', () => () => <div data-testid="user-header"/>);
jest.mock('../../images/logo_blanco.svg', () => 'logo.svg');
jest.mock('../../css/GestionMoldes.css', () => ({}));

// Mock de iconos como spans clicables con data-testid
jest.mock('react-icons/fa', () => ({
  FaEye: (props) => <span data-testid="FaEye" {...props} />,
  FaRegEdit: (props) => <span data-testid="FaRegEdit" {...props} />,
  FaSearch: (props) => <span data-testid="FaSearch" {...props} />,
  FaTrashAlt: (props) => <span data-testid="FaTrashAlt" {...props} />,
}));

// ---- Mock de SweetAlert2 ----
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
  getPopup: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------

describe('HistorialInspeccion', () => {
  test('renderiza cabecera y filas iniciales', () => {
    render(<HistorialInspeccion />);

    expect(screen.getByText('Historial de Inspección')).toBeInTheDocument();
    expect(screen.getByText('Código')).toBeInTheDocument();

    // Códigos de ejemplo
    expect(screen.getByText('IS-2025-001')).toBeInTheDocument();
    expect(screen.getByText('IS-2025-002')).toBeInTheDocument();
  });

  test('al hacer click en ver (FaEye) abre SweetAlert con el título correcto', async () => {
    // Primer llamado a Swal.fire: detalle de inspección
    Swal.fire.mockResolvedValueOnce({});

    render(<HistorialInspeccion />);

    fireEvent.click(screen.getAllByTestId('FaEye')[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalled();
    });

    // Inspecciona la 1ra llamada
    const call = Swal.fire.mock.calls[0][0];
    expect(call.title).toContain('Detalle de Inspección - OP2025-001');
    expect(call.width).toBe(900);
    expect(call.confirmButtonText).toBe('Volver al historial');
  });

  test('en el modal de detalle, subir foto dispara una segunda alerta de éxito', async () => {
    // Preparar un contenedor que Swal.getPopup devolverá
    const popup = document.createElement('div');
    // Estructura mínima que el didOpen espera
    popup.innerHTML = `
      <button class="btn-upload" data-index="0">Subir foto</button>
      <button class="btn-upload" data-index="1">Subir foto</button>
      <input type="file" id="fileInputHidden" />
    `;
    Swal.getPopup.mockReturnValue(popup);

    // Primer llamado: detalle (ejecuta didOpen)
    Swal.fire.mockImplementationOnce(async (opts) => {
      // Ejecuta didOpen para que agregue listeners
      if (opts?.didOpen) opts.didOpen();
      return {};
    });

    // Segundo llamado esperado: éxito de carga
    Swal.fire.mockResolvedValueOnce({});

    render(<HistorialInspeccion />);

    // Abre detalle
    fireEvent.click(screen.getAllByTestId('FaEye')[0]);

    // Click en primer "Subir foto" dentro del popup simulado
    const uploadBtn = popup.querySelector('.btn-upload');
    const fileInput = popup.querySelector('#fileInputHidden');

    // El listener de didOpen asigna inputFile.onchange, así que disparamos change
    fireEvent.click(uploadBtn);
    const file = new File(['x'], 'evidencia.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      // Segunda llamada de Swal.fire debe ser la de éxito
      const last = Swal.fire.mock.calls[Swal.fire.mock.calls.length - 1][0];
      expect(last.icon).toBe('success');
      expect(last.title).toBe('Archivo cargado');
      expect(last.text).toContain('evidencia.png');
    });
  });

  test('eliminar una fila confirma y luego la quita de la tabla', async () => {
    // 1) Confirmación positiva
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    // 2) Toast de éxito
    Swal.fire.mockResolvedValueOnce({});

    render(<HistorialInspeccion />);

    const filasAntes = screen.getAllByRole('row').length;

    // Click en el icono de borrar de la primera fila
    fireEvent.click(screen.getAllByTestId('FaTrashAlt')[0]);

    await waitFor(() => {
      // Debió llamar 2 veces: confirmación y éxito
      expect(Swal.fire).toHaveBeenCalledTimes(2);
    });

    // Luego de eliminar, debe haber menos filas
    const filasDespues = screen.getAllByRole('row').length;
    expect(filasDespues).toBeLessThan(filasAntes);

    // Y el código eliminado ya no aparece
    expect(screen.queryByText('IS-2025-001')).not.toBeInTheDocument();
  });
});
