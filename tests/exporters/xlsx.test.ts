import { describe, it, expect } from 'vitest';
import { toXlsx } from '../../src/exporters/xlsx.js';
import ExcelJS from 'exceljs';
import type { EstacionPrecio } from '../../src/schemas.js';

const station: EstacionPrecio = {
  Numero: 'PL/001', Nombre: 'TEST', Direccion: 'AV 1',
  Producto: 'Gasolina', SubProducto: 'Regular 87',
  PrecioVigente: 23.99, EntidadFederativaId: 15, MunicipioId: '001',
};

describe('toXlsx', () => {
  it('returns a Buffer', async () => {
    expect(await toXlsx([station])).toBeInstanceOf(Buffer);
  });

  it('produces a valid Excel workbook', async () => {
    const wb = new ExcelJS.Workbook();
    await expect(wb.xlsx.load(await toXlsx([station]))).resolves.not.toThrow();
  });

  it('has a sheet named Precios', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await toXlsx([station]));
    expect(wb.getWorksheet('Precios')).toBeDefined();
  });

  it('has correct header row', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await toXlsx([station]));
    const header = wb.getWorksheet('Precios')!.getRow(1).values as string[];
    expect(header).toContain('Numero');
    expect(header).toContain('PrecioVigente');
  });

  it('writes data on row 2', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await toXlsx([station]));
    const row = wb.getWorksheet('Precios')!.getRow(2).values as unknown[];
    expect(row).toContain('PL/001');
    expect(row).toContain(23.99);
  });
});
