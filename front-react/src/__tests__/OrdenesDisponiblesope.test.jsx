import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, beforeEach } from '@testing-library/react';
import {jest,test ,expect,describe,require} from '@jest/globals';
// SUT
import OrdenesDisponibles from '../src/OrdenesDisponibles';

// Mock router navigate -------------------------------------------------
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Helpers --------------------------------------------------------------
const setUsuarioLS = (u) => localStorage.setItem('usuario', JSON.stringify(u));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// Tests ----------------------------------------------------------------

describe('OrdenesDisponibles', () => {
  test('renderiza la tabla con órdenes ficticias', () => {
    render(<OrdenesDisponibles />);

    expect(screen.getByText('Órdenes de Producción disponibles')).toBeInTheDocument();

    // Cabeceras
    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Fecha de entrega')).toBeInTheDocument();

    // Algunas órdenes por código
    expect(screen.getByText('OP-2025-001')).toBeInTheDocument();
    expect(screen.getByText('OP-2025-002')).toBeInTheDocument();
  });

  test('abre modal de comentarios para una orden y muestra los existentes', async () => {
    render(<OrdenesDisponibles />);

    // OP-2025-001 tiene 2 comentarios
    fireEvent.click(screen.getAllByText(/\[ Ver \(\d+\) \]/)[0]);

    // Modal visible
    expect(await screen.findByText(/Comentarios - Polo Básico/)).toBeInTheDocument();

    // Comentarios existentes
    expect(screen.getByText('Luis Díaz:')).toBeInTheDocument();
    expect(screen.getByText(/Se descartó la versión 1/)).toBeInTheDocument();
    expect(screen.getByText('Martin Campos:')).toBeInTheDocument();
  });

  test('botón Comentar deshabilitado cuando textarea está vacío', async () => {
    render(<OrdenesDisponibles />);

    fireEvent.click(screen.getAllByText(/\[ Ver \(\d+\) \]/)[0]);

    const btn = await screen.findByText('Comentar');
    expect(btn).toBeDisabled();
  });

  test('agrega un comentario usando el nombre desde localStorage', async () => {
    setUsuarioLS({ nombreCompleto: 'Sole Sueñitos' });
    render(<OrdenesDisponibles />);

    // Abrir modal para la primera orden
    fireEvent.click(screen.getAllByText(/\[ Ver \(\d+\) \]/)[0]);

    // Escribir y comentar
    const textarea = await screen.findByPlaceholderText('Escribir comentario...');
    fireEvent.change(textarea, { target: { value: 'Nuevo comentario de prueba' } });

    const btn = screen.getByText('Comentar');
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);

    // Se agrega al listado en memoria del modal
    await waitFor(() => {
      expect(screen.getByText('Sole Sueñitos:')).toBeInTheDocument();
      expect(screen.getByText('Nuevo comentario de prueba')).toBeInTheDocument();
    });
  });

  test('cierra el modal al pulsar Cerrar y al pulsar sobre el overlay', async () => {
    render(<OrdenesDisponibles />);

    // Abrir modal
    fireEvent.click(screen.getAllByText(/\[ Ver \(\d+\) \]/)[0]);
    const titulo = await screen.findByText(/Comentarios - Polo Básico/);
    expect(titulo).toBeInTheDocument();

    // Cerrar con botón
    fireEvent.click(screen.getByText('Cerrar'));
    await waitFor(() => {
      expect(screen.queryByText(/Comentarios - Polo Básico/)).not.toBeInTheDocument();
    });

    // Abrir de nuevo y cerrar clickeando overlay
    fireEvent.click(screen.getAllByText(/\[ Ver \(\d+\) \]/)[0]);
    await screen.findByText(/Comentarios - Polo Básico/);

    // El overlay es el contenedor con role implícito; seleccionamos por texto del botón de cerrar y subimos al parent más cercano del modal
    const overlay = document.querySelector('[style*="position: fixed"][style*="rgba(0, 0, 0, 0.5)"]');
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByText(/Comentarios - Polo Básico/)).not.toBeInTheDocument();
    });
  });

  test('navega a historial de optimizaciones al hacer click en "Ver optimizaciones"', () => {
    const mockedNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockedNavigate,
    }));

    // Necesitamos re-importar el SUT con el nuevo mock aplicado
    const OrdenesDisponiblesReimport = require('../src/OrdenesDisponibles').default;

    render(<OrdenesDisponiblesReimport />);

    // Click en la primera fila "Ver optimizaciones"
    fireEvent.click(screen.getAllByText('[ Ver optimizaciones ]')[0]);

    expect(mockedNavigate).toHaveBeenCalledWith('/historialoptiope/OP-2025-001');
  });
});
