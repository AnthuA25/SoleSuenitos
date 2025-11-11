import React from 'react';
import { render, screen, fireEvent, waitFor, within,beforeEach } from '@testing-library/react';
import '@testing-library/jest-dom';
import Swal from 'sweetalert2';
import {jest,test ,expect,describe} from '@jest/globals';

// SUT
import RegistrarInspeccion from '../src/RegistrarInspeccion';

// ---- Mocks de dependencias que no importan en la lógica del test ----
jest.mock('../../components/SliderMenu', () => () => null);
jest.mock('../../components/UserHeader', () => () => <div data-testid="user-header"/>);
jest.mock('../../images/logo_blanco.svg', () => 'logo.svg');
jest.mock('../../css/GestionMoldes.css', () => ({}));
jest.mock('lucide-react', () => ({ Upload: (props) => <svg data-testid="upload-icon" {...props} /> }));

// ---- Mock de SweetAlert2 ----
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const getRow = (idx) => screen.getAllByRole('row')[idx + 1]; // +1 para saltar header

// ---------------------------------------------------------------------

describe('RegistrarInspeccion', () => {
  test('renderiza título, subtítulo y 4 criterios', () => {
    render(<RegistrarInspeccion />);

    expect(screen.getByText('Registrar Inspección')).toBeInTheDocument();
    expect(screen.getByText(/Completa el checklist/i)).toBeInTheDocument();

    // 4 filas de criterios (sin contar header)
    const rows = screen.getAllByRole('row');
    // rows[0] es el header
    expect(rows.length - 1).toBe(4);

    expect(screen.getByText(/¿Las piezas están correctamente unidas/)).toBeInTheDocument();
    expect(screen.getByText(/¿La tela no presenta defectos/)).toBeInTheDocument();
  });

  test('validación: si faltan respuestas muestra alerta de advertencia', async () => {
    render(<RegistrarInspeccion />);

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Respuestas incompletas',
        text: 'Debe marcar ✓ o ✕ en todos los criterios.',
        icon: 'warning',
        confirmButtonColor: '#2f6d6d',
      });
    });
  });

  test('marcar ✓ y ✕ cambia el estado visual (clases) y permite guardar', async () => {
    render(<RegistrarInspeccion />);

    // Para cada fila, haz click en ✓
    const filas = screen.getAllByRole('row').slice(1); // sin header
    filas.forEach((row) => {
      const yesBtn = within(row).getByText('✓');
      fireEvent.click(yesBtn);
      expect(yesBtn).toHaveClass('si');
      const noBtn = within(row).getByText('✕');
      expect(noBtn).not.toHaveClass('no');
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Inspección guardada',
        text: 'El registro fue guardado correctamente.',
        icon: 'success',
        confirmButtonColor: '#2f6d6d',
      });
    });
  });

  test('editar observación actualiza el input', () => {
    render(<RegistrarInspeccion />);
    const firstRow = getRow(0);
    const obsInput = within(firstRow).getByRole('textbox');

    fireEvent.change(obsInput, { target: { value: 'Observación editada' } });
    expect(obsInput).toHaveValue('Observación editada');
  });

  test('subir evidencia muestra punto verde', async () => {
    render(<RegistrarInspeccion />);
    const firstRow = getRow(0);

    // El input file está dentro del label "Subir foto"
    const label = within(firstRow).getByText(/Subir foto/i).closest('label');
    const fileInput = within(label).getByLabelText(/Subir foto/i, { selector: 'input[type="file"]' }) || label.querySelector('input[type="file"]');

    const file = new File(['img'], 'evidencia.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Aparece el indicador verde
    expect(await within(firstRow).findByText('●')).toBeInTheDocument();
    expect(within(firstRow).getByText('●')).toHaveClass('punto-verde');
  });

  test('guardar reinicia respuestas, evidencias y limpia notas', async () => {
    render(<RegistrarInspeccion />);

    // Marca todas ✓
    const filas = screen.getAllByRole('row').slice(1);
    filas.forEach((row) => fireEvent.click(within(row).getByText('✓')));

    // Sube evidencia en primera fila
    const firstRow = filas[0];
    const label = within(firstRow).getByText(/Subir foto/i).closest('label');
    const fileInput = label.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] } });

    // Escribe notas
    const notas = screen.getByPlaceholderText('Agregar notas adicionales...');
    fireEvent.change(notas, { target: { value: 'Notas de prueba' } });

    // Guarda
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Inspección guardada',
        text: 'El registro fue guardado correctamente.',
        icon: 'success',
        confirmButtonColor: '#2f6d6d',
      });
    });

    // Después del reset: no hay puntos verdes
    expect(screen.queryByText('●')).not.toBeInTheDocument();
    // Notas vacías
    expect(screen.getByPlaceholderText('Agregar notas adicionales...')).toHaveValue('');
    // Botones ✓ ya no tienen clase 'si'
    screen.getAllByText('✓').forEach((btn) => expect(btn).not.toHaveClass('si'));
    // Botones ✕ ya no tienen clase 'no'
    screen.getAllByText('✕').forEach((btn) => expect(btn).not.toHaveClass('no'));
  });
});
