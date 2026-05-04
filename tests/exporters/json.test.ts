import { describe, it, expect } from 'vitest';
import { toJson } from '../../src/exporters/json.js';
import type { EstacionPrecio } from '../../src/schemas.js';

const station: EstacionPrecio = {
  Numero: 'PL/001', Nombre: 'TEST', Direccion: 'AV 1',
  Producto: 'Gasolina', SubProducto: 'Regular 87',
  PrecioVigente: 23.99, EntidadFederativaId: 15, MunicipioId: '001',
};

describe('toJson', () => {
  it('returns valid JSON string', () => {
    expect(() => JSON.parse(toJson([station]))).not.toThrow();
  });

  it('includes all station fields', () => {
    const parsed = JSON.parse(toJson([station]));
    expect(parsed[0].Numero).toBe('PL/001');
    expect(parsed[0].PrecioVigente).toBe(23.99);
  });

  it('is pretty-printed with 2-space indent', () => {
    expect(toJson([station])).toContain('\n  ');
  });

  it('handles empty array', () => {
    expect(JSON.parse(toJson([]))).toEqual([]);
  });
});
