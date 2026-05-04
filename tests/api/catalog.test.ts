import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getMunicipios } from '../../src/api/catalog.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('getMunicipios', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('returns parsed municipios for a valid state', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { MunicipioId: '001', Nombre: 'Acambay' },
        { MunicipioId: '002', Nombre: 'Acolman' },
      ],
    });

    const result = await getMunicipios(15);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api-catalogo.cne.gob.mx/api/utiles/municipios',
      expect.objectContaining({ params: { EntidadFederativaId: 15 } })
    );
    expect(result).toHaveLength(2);
    expect(result[0].MunicipioId).toBe('001');
  });

  it('throws when API returns invalid data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ BadField: 'nope' }] });
    await expect(getMunicipios(15)).rejects.toThrow();
  });

  it('propagates network errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
    await expect(getMunicipios(15)).rejects.toThrow('Network Error');
  });
});
