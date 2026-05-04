import { describe, it, expect } from 'vitest';
import { toCsv } from '../../src/exporters/csv.js';
import type { EstacionPrecio } from '../../src/schemas.js';

const station: EstacionPrecio = {
  Numero: 'PL/001', Nombre: 'TEST', Direccion: 'AV 1',
  Producto: 'Gasolina', SubProducto: 'Regular 87',
  PrecioVigente: 23.99, EntidadFederativaId: 15, MunicipioId: '001',
};

describe('toCsv', () => {
  it('includes header row with all field names', async () => {
    const result = await toCsv([station]);
    const header = result.split('\n')[0];
    expect(header).toContain('Numero');
    expect(header).toContain('PrecioVigente');
    expect(header).toContain('SubProducto');
  });

  it('includes data row', async () => {
    const result = await toCsv([station]);
    expect(result).toContain('PL/001');
    expect(result).toContain('23.99');
  });

  it('renders null PrecioVigente as empty string', async () => {
    const result = await toCsv([{ ...station, PrecioVigente: null }]);
    expect(result).toContain('PL/001');
  });

  it('returns only header for empty array', async () => {
    const lines = (await toCsv([])).trim().split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('Numero');
  });
});
