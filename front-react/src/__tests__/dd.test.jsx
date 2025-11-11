import React from 'react';
import { render, screen, fireEvent, waitFor, beforeEach } from '@testing-library/react';
import '@testing-library/jest-dom';
import Swal from 'sweetalert2';
import {jest,test ,expect,describe} from '@jest/globals';
// SUT
import   OrdenProduccion from '../OrdenProduccion.jsx';

// API mocks
jest.mock('../../api/ordenProducciónService', () => ({
  leerPiezas: jest.fn(),
  generarV1: jest.fn(),
  generarV2: jest.fn(),
  compararOptimizaciones: jest.fn(),
  listarRollos: jest.fn(),
}));

import {
  leerPiezas,
  generarV1,
  generarV2,
  compararOptimizaciones,
  listarRollos,
} from '../../api/ordenProducciónService';

// SweetAlert mock
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
  showLoading: jest.fn(),
  close: jest.fn(),
}));

// Helpers -----------------------------------------------------------
const mockFile = (name = 'molde.dxf', type = 'application/dxf') => {
  return new File(['DXF'], name, { type });
};

const provisionCheckInputs = (num = 1, checkedIndexes = [0]) => {
  // Crea inputs con ids chk_0, chk_1, ... en el DOM global
  for (let i = 0; i < num; i++) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `chk_${i}`;
    input.checked = checkedIndexes.includes(i);
    document.body.appendChild(input);
  }
};

const rollosFixture = [
  {
    idRollo: 111,
    codigoRollo: 'R-001',
    tipoTela: 'Algodón',
    color: 'Azul',
    metrajeM: 50,
    estado: 'DISPONIBLE',
  },
];

// Default list response before each test
beforeEach(() => {
  jest.clearAllMocks();
  listarRollos.mockResolvedValue(rollosFixture);

  // Mock general de Swal.fire con comportamiento por título
  Swal.fire.mockImplementation(async (opts) => {
    // Loading toasts
    if (opts?.didOpen) opts.didOpen();

    // Subida de archivo DXF (varios sitios lo piden)
    if (opts?.input === 'file') {
      return { value: mockFile(), isConfirmed: true };
    }

    // Diálogo de Rollos
    if (opts?.title === 'Rollos Disponibles') {
      // Proveer checkboxes reales que el preConfirm va a leer via document.getElementById
      provisionCheckInputs(rollosFixture.length, [0]);
      // Ejecutar manualmente preConfirm para simular la selección
      if (opts?.preConfirm) opts.preConfirm();
      return { isConfirmed: true };
    }

    // Confirmaciones genéricas
    return { isConfirmed: true };
  });
});

// Tests -------------------------------------------------------------

describe('OrdenProduccion', () => {
  test('carga inicial: llama listarRollos y muestra pantalla base', async () => {
    render(<OrdenProduccion />);

    expect(await screen.findByText('Orden de Producción')).toBeInTheDocument();
    expect(listarRollos).toHaveBeenCalledTimes(1);
    // No debería mostrar "Sin piezas cargadas" solo si la tabla existe
    expect(screen.getByText('Sin piezas cargadas')).toBeInTheDocument();
  });

  test('validación: no permite Optimizar Corte sin modelo/talla/cantidad', async () => {
    render(<OrdenProduccion />);

    fireEvent.click(screen.getByText('Optimizar Corte'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Completar',
        'Completa modelo, talla y cantidad',
        'warning'
      );
    });
  });

  test('flujo V1: completa datos, selecciona rollo, sube DXF y muestra métricas', async () => {
    generarV1.mockResolvedValue({
      data: {
        metricas: {
          largo_usado_mm: 7340,
          aprovechamiento_porcentaje: 82.1234,
          desperdicio_porcentaje: 17.8766,
        },
      },
    });

    render(<OrdenProduccion />);

    // Completar formulario
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });

    // Abrir diálogo de rollos y aplicar selección (mock en Swal ya marca chk_0)
    fireEvent.click(screen.getByText('Ver Rollos'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

    // Lanzar Optimizar
    fireEvent.click(screen.getByText('Optimizar Corte'));

    // Debe mostrar pantalla de V1 con métricas
    expect(await screen.findByText('Optimización V1')).toBeInTheDocument();
    expect(screen.getByText(/Tela utilizada/i).nextSibling).toHaveTextContent('7.34 m');
    expect(screen.getByText(/Aprovechamiento/i).nextSibling).toHaveTextContent('82.12%');
    expect(screen.getByText(/Desperdicio/i).nextSibling).toHaveTextContent('17.88%');
  });

  test('flujo V2: desde V1 genera V2 y muestra métricas de V2', async () => {
    generarV1.mockResolvedValue({
      data: { metricas: { largo_usado_mm: 5000, aprovechamiento_porcentaje: 80, desperdicio_porcentaje: 20 } },
    });

    generarV2.mockResolvedValue({
      data: { metricas: { largo_usado_mm: 6000, aprovechamiento_porcentaje: 85.5, desperdicio_porcentaje: 14.5 } },
    });

    render(<OrdenProduccion />);

    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });

    // Seleccionar rollo
    fireEvent.click(screen.getByText('Ver Rollos'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

    // Optimizar V1
    fireEvent.click(screen.getByText('Optimizar Corte'));
    expect(await screen.findByText('Optimización V1')).toBeInTheDocument();

    // Generar V2
    fireEvent.click(screen.getByText('Generar V2'));

    expect(await screen.findByText('Optimización V2')).toBeInTheDocument();
    expect(screen.getByText(/Tela utilizada/i).nextSibling).toHaveTextContent('6.00 m');
    expect(screen.getByText(/Aprovechamiento/i).nextSibling).toHaveTextContent('85.50%');
    expect(screen.getByText(/Desperdicio/i).nextSibling).toHaveTextContent('14.50%');
  });

  test('comparar marcadores: muestra ganador tras comparar', async () => {
    generarV1.mockResolvedValue({ data: { metricas: { largo_usado_mm: 1, aprovechamiento_porcentaje: 1, desperdicio_porcentaje: 99 } } });
    generarV2.mockResolvedValue({ data: { metricas: { largo_usado_mm: 2, aprovechamiento_porcentaje: 2, desperdicio_porcentaje: 98 } } });
    compararOptimizaciones.mockResolvedValue({ mejor_version: 'V2' });

    render(<OrdenProduccion />);

    // Datos + selección
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Ver Rollos'));

    // V1 -> V2
    fireEvent.click(await screen.findByText('Optimizar Corte'));
    fireEvent.click(await screen.findByText('Generar V2'));

    // Comparar
    fireEvent.click(await screen.findByText('Comparar Marcadores'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Comparación completada',
        expect.stringContaining('La mejor versión es:'),
        'success'
      );
    });
  });

  test('handleSubirMolde: procesa piezas y llena la tabla', async () => {
    leerPiezas.mockResolvedValue({
      piezas: [
        { nombre: 'Frente', ancho_mm: 100, alto_mm: 200, area_mm2: 12345.678, repeticiones: 2, permite_giro_90: true },
        { nombre: 'Espalda', ancho_mm: 120, alto_mm: 180, area_mm2: 11111.111, repeticiones: 1, permite_giro_90: false },
      ],
    });

    render(<OrdenProduccion />);

    fireEvent.click(screen.getByText('Subir molde'));

    // Debe colocar filas con las piezas
    expect(await screen.findByText('Frente')).toBeInTheDocument();
    expect(screen.getByText('Espalda')).toBeInTheDocument();
    expect(screen.getByText('Giro 90°')).toBeInTheDocument();
    expect(screen.getByText('Recto hilo')).toBeInTheDocument();
  });

  test('errores de red: listarRollos lanza y muestra alerta', async () => {
    listarRollos.mockRejectedValueOnce(new Error('boom'));

    render(<OrdenProduccion />);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'No se pudieron obtener los rollos desde el servidor.',
        'error'
      );
    });
  });
});
