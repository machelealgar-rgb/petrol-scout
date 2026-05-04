import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getEstaciones } from '../../src/api/report.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const mockStation = {
  Numero: 'PL/001',
  Nombre: 'GASOLINERA TEST',
  Direccion: 'AV 123',
  Producto: 'Gasolina',
  SubProducto: 'Regular 87',
  PrecioVigente: 23.99,
  EntidadFederativaId: 15,
  MunicipioId: '001',
};

describe('getEstaciones', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('returns parsed stations for state + municipality', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { Success: true, Errors: null, Value: [mockStation] },
    });

    const result = await getEstaciones(15, '001');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api-reportediario.cne.gob.mx/api/EstacionServicio/Petroliferos',
      expect.objectContaining({ params: { entidadId: 15, municipioId: '001' } })
    );
    expect(result).toHaveLength(1);
    expect(result[0].Numero).toBe('PL/001');
  });

  it('returns empty array for municipality with no stations', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { Success: true, Errors: null, Value: [] } });
    expect(await getEstaciones(15, '099')).toEqual([]);
  });

  it('propagates network errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Timeout'));
    await expect(getEstaciones(15, '001')).rejects.toThrow('Timeout');
  });
});
