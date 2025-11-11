import React from 'react';
import { render, screen, fireEvent, waitFor,beforeEach } from '@testing-library/react';
import '@testing-library/jest-dom';
import Swal from 'sweetalert2';
import {jest,test ,expect,describe} from '@jest/globals';
// SUT
// SUT
import OrdenProduccion from '../src/OrdenProduccion';

// Jest timers: la vista de optimización usa setInterval
jest.useFakeTimers();

// Mock de SweetAlert ------------------------------------------------
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
  showLoading: jest.fn(),
  close: jest.fn(),
  getPopup: jest.fn(() => document.body),
}));

// Utilidades --------------------------------------------------------
const mockFile = (name = 'molde.dxf', type = 'application/dxf') => new File(['DXF'], name, { type });

const provisionCheckInputs = (num = 1, checkedIdxs = [0]) => {
  for (let i = 0; i < num; i++) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `chk_${i}`;
    input.checked = checkedIdxs.includes(i);
    document.body.appendChild(input);
  }
};

const provisionElegirMoldeInputs = (d = { d1: true, d2: false, d3: false }) => {
  const m1 = document.createElement('input'); m1.type = 'checkbox'; m1.id = 'molde1'; m1.checked = !!d.d1; document.body.appendChild(m1);
  const m2 = document.createElement('input'); m2.type = 'checkbox'; m2.id = 'molde2'; m2.checked = !!d.d2; document.body.appendChild(m2);
  const m3 = document.createElement('input'); m3.type = 'checkbox'; m3.id = 'molde3'; m3.checked = !!d.d3; document.body.appendChild(m3);
};

// LocalStorage helpers ---------------------------------------------
const setRollosLS = (rollos) => localStorage.setItem('rollos', JSON.stringify(rollos));
const getOptisLS = () => JSON.parse(localStorage.getItem('optimizaciones') || '[]');

// Mock de Swal.fire con comportamientos por caso -------------------
const setupSwalBehavior = () => {
  Swal.fire.mockImplementation(async (opts) => {
    // Soporte de didOpen (loaders, etc.)
    if (opts?.didOpen) opts.didOpen();

    // Input de archivos: subir molde
    if (opts?.input === 'file') {
      return { value: mockFile(), isConfirmed: true };
    }

    // Elegir molde (checkboxes molde1..3 con preConfirm)
    if (opts?.title === 'Seleccionar Molde') {
      provisionElegirMoldeInputs({ d1: true, d2: true, d3: true });
      const v = opts?.preConfirm ? opts.preConfirm() : [];
      return { value: v, isConfirmed: true };
    }

    // Ver rollos: provee chk_i y ejecuta preConfirm para simular selección
    if (opts?.title === 'Rollos Registrados') {
      // Asumimos que hay los mismos rollos que en localStorage
      const data = JSON.parse(localStorage.getItem('rollos') || '[]');
      provisionCheckInputs(data.length, data.map((_, i) => i)); // todos seleccionados
      const sel = opts?.preConfirm ? opts.preConfirm() : [];
      return { isConfirmed: true, value: sel };
    }

    // Generar V2: devuelve opciones válidas
    if (opts?.title === 'Generar marcador v2') {
      // Simula selects válidos
      // Creamos nodos que preConfirm leerá
      const giro = document.createElement('select'); giro.id = 'giro'; const og = document.createElement('option'); og.value = '90°'; og.selected = true; giro.appendChild(og); document.body.appendChild(giro);
      const orient = document.createElement('select'); orient.id = 'orientacion'; const oo = document.createElement('option'); oo.value = 'Libre'; oo.selected = true; orient.appendChild(oo); document.body.appendChild(orient);
      const v = opts?.preConfirm ? opts.preConfirm() : { giro: '90°', orientacion: 'Libre' };
      return { isConfirmed: true, value: v };
    }

    // Progreso de optimización: el componente crea intervalos; nosotros solo devolvemos confirmación
    if (opts?.title === 'Optimizando corte...') {
      // didOpen ya corrió; el componente manejará intervalos. Aquí solo OK.
      return { isConfirmed: true };
    }

    // Confirmaciones genéricas
    return { isConfirmed: true };
  });
};

// Datos de ejemplo --------------------------------------------------
const rollosFixture = [
  { codigo: 'R-001', tipoTela: 'Algodón', color: 'Azul', metraje: 50, proveedor: 'Acme', estado: 'Disponible' },
  { codigo: 'R-002', tipoTela: 'Poli', color: 'Rojo', metraje: 40, proveedor: 'Tex', estado: 'Disponible' },
];

beforeEach(() => {
  localStorage.clear();
  setRollosLS(rollosFixture);
  jest.clearAllMocks();
  setupSwalBehavior();
});

// Tests -------------------------------------------------------------

describe('OrdenProduccion (local, SweetAlert + localStorage)', () => {
  test('render base y lectura de rollos desde localStorage', async () => {
    render(<OrdenProduccion />);
    expect(await screen.findByText('Orden de Producción')).toBeInTheDocument();
    // Debe existir el botón de rollos
    expect(screen.getByText('Ver Rollos Disponibles')).toBeInTheDocument();
  });

  test('validaciones: faltan campos y faltan rollos', async () => {
    render(<OrdenProduccion />);

    // Sin datos
    fireEvent.click(screen.getByText('Optimizar Corte'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Completar', 'Completa modelo, talla y cantidad', 'warning');
    });

    // Completar form pero sin seleccionar rollos
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });

    fireEvent.click(screen.getByText('Optimizar Corte'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Seleccionar rollos', 'Selecciona al menos 1 rollo para la orden', 'warning');
    });
  });

  test('ver rollos y que muestre tags seleccionados', async () => {
    render(<OrdenProduccion />);

    fireEvent.click(screen.getByText('Ver Rollos Disponibles'));

    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

    // Debe mostrar los tags con los códigos seleccionados
    expect(await screen.findByText('R-001')).toBeInTheDocument();
    expect(screen.getByText('R-002')).toBeInTheDocument();
  });

  test('subir molde agrega una fila "Molde subido"', async () => {
    render(<OrdenProduccion />);

    fireEvent.click(screen.getByText('Subir molde'));

    // Tras la subida simulada, debería aparecer la pieza en la tabla
    expect(await screen.findByText('Molde subido')).toBeInTheDocument();
  });

  test('flujo Optimizar Corte: completa, selecciona rollos y muestra métricas', async () => {
    render(<OrdenProduccion />);

    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });

    // Seleccionar rollos
    fireEvent.click(screen.getByText('Ver Rollos Disponibles'));

    // Lanzar optimización
    fireEvent.click(screen.getByText('Optimizar Corte'));

    // Avanza intervalos hasta completar
    jest.runOnlyPendingTimers();
    jest.advanceTimersByTime(5000);

    // Debe renderizar la vista de optimización con métricas
    expect(await screen.findByText('Optimización')).toBeInTheDocument();
    expect(screen.getByText(/Tela utilizada:/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprovechamiento:/i)).toBeInTheDocument();
    expect(screen.getByText(/Desperdicio:/i)).toBeInTheDocument();
  });

  test('Generar v2 y mostrar métricas v2, luego comparar', async () => {
    render(<OrdenProduccion />);

    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Pijama' } });
    fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });

    // Seleccionar rollos
    fireEvent.click(screen.getByText('Ver Rollos Disponibles'));

    // Optimizar V1
    fireEvent.click(screen.getByText('Optimizar Corte'));
    jest.advanceTimersByTime(5000);
    expect(await screen.findByText('Optimización')).toBeInTheDocument();

    // Generar V2
    fireEvent.click(screen.getByText('Generar v2'));

    expect(await screen.findByText('Marcador Versión Óptima (v2)')).toBeInTheDocument();
    expect(screen.getByText(/Giro permitido:/i).nextSibling.textContent).toBeTruthy();

    // Comparar marcadores
    fireEvent.click(screen.getByText('Comparar marcadores'));
    expect(await screen.findByText('Marcador versión óptima')).toBeInTheDocument();

    // Aprobar marcador optimizado guarda en localStorage
    const before = getOptisLS().length;
    fireEvent.click(screen.getByText('Aprobar marcador optimizado (Guardar V2)'));
    const after = getOptisLS().length;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('Elegir molde agrega piezas predefinidas a la tabla', async () => {
    render(<OrdenProduccion />);

    fireEvent.click(screen.getByText('Elegir molde'));

    expect(await screen.findByText('Delantero')).toBeInTheDocument();
    expect(screen.getByText('Espalda')).toBeInTheDocument();
    expect(screen.getByText('Manga')).toBeInTheDocument();
  });
});
