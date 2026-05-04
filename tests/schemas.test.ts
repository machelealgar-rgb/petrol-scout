import { describe, it, expect } from 'vitest';
import {
  MunicipioSchema,
  MunicipiosResponseSchema,
  EstacionPrecioSchema,
  EstacionesResponseSchema,
} from '../src/schemas.js';

describe('MunicipioSchema', () => {
  it('parses a valid municipio', () => {
    const result = MunicipioSchema.parse({ MunicipioId: '001', Nombre: 'Acambay' });
    expect(result.MunicipioId).toBe('001');
  });

  it('rejects missing MunicipioId', () => {
    expect(() => MunicipioSchema.parse({ Nombre: 'Test' })).toThrow();
  });
});

describe('MunicipiosResponseSchema', () => {
  it('parses an array', () => {
    const result = MunicipiosResponseSchema.parse([
      { MunicipioId: '001', Nombre: 'A' },
      { MunicipioId: '002', Nombre: 'B' },
    ]);
    expect(result).toHaveLength(2);
  });
});

describe('EstacionPrecioSchema', () => {
  const valid = {
    Numero: 'PL/001',
    Nombre: 'GASOLINERA TEST',
    Direccion: 'AV 123',
    Producto: 'Gasolina',
    SubProducto: 'Regular 87',
    PrecioVigente: 23.99,
    EntidadFederativaId: 15,
    MunicipioId: '001',
  };

  it('parses a valid station', () => {
    expect(EstacionPrecioSchema.parse(valid).PrecioVigente).toBe(23.99);
  });

  it('allows null PrecioVigente', () => {
    expect(EstacionPrecioSchema.parse({ ...valid, PrecioVigente: null }).PrecioVigente).toBeNull();
  });

  it('rejects missing Numero', () => {
    const { Numero, ...rest } = valid;
    expect(() => EstacionPrecioSchema.parse(rest)).toThrow();
  });
});

describe('EstacionesResponseSchema', () => {
  it('parses wrapped response with empty Value', () => {
    const result = EstacionesResponseSchema.parse({ Success: true, Errors: null, Value: [] });
    expect(result.Value).toEqual([]);
  });
});
