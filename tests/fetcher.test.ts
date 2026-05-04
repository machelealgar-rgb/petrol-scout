import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/api/catalog.js');
vi.mock('../src/api/report.js');
vi.mock('../src/utils/delay.js');
vi.mock('../src/utils/progress.js');

import { getMunicipios } from '../src/api/catalog.js';
import { getEstaciones } from '../src/api/report.js';
import { delay } from '../src/utils/delay.js';
import { createProgressBar } from '../src/utils/progress.js';
import { fetchPrices } from '../src/fetcher.js';

const mockMunicipios = [
  { MunicipioId: '001', Nombre: 'Municipio A' },
  { MunicipioId: '002', Nombre: 'Municipio B' },
];

const mockStation = (municipioId: string) => ({
  Numero: `PL/00${municipioId}`,
  Nombre: 'TEST',
  Direccion: 'CALLE 1',
  Producto: 'Gasolina',
  SubProducto: 'Regular 87',
  PrecioVigente: 23.5,
  EntidadFederativaId: 15,
  MunicipioId: municipioId,
});

const mockBar = { update: vi.fn(), stop: vi.fn() };

describe('fetchPrices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createProgressBar).mockReturnValue(mockBar as any);
    vi.mocked(delay).mockResolvedValue(undefined);
  });

  it('fetches single municipality without calling catalog', async () => {
    vi.mocked(getEstaciones).mockResolvedValue([mockStation('001')]);
    const result = await fetchPrices(15, '001');
    expect(getMunicipios).not.toHaveBeenCalled();
    expect(getEstaciones).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
  });

  it('fetches all municipalities when no municipioId given', async () => {
    vi.mocked(getMunicipios).mockResolvedValue(mockMunicipios);
    vi.mocked(getEstaciones)
      .mockResolvedValueOnce([mockStation('001')])
      .mockResolvedValueOnce([mockStation('002')]);

    const result = await fetchPrices(15);
    expect(getMunicipios).toHaveBeenCalledWith(15);
    expect(getEstaciones).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('applies 200ms delay between requests (not after last)', async () => {
    vi.mocked(getMunicipios).mockResolvedValue(mockMunicipios);
    vi.mocked(getEstaciones)
      .mockResolvedValueOnce([mockStation('001')])
      .mockResolvedValueOnce([mockStation('002')]);

    await fetchPrices(15);
    expect(delay).toHaveBeenCalledWith(200);
    expect(delay).toHaveBeenCalledTimes(1);
  });

  it('updates progress bar for each municipality and stops at end', async () => {
    vi.mocked(getMunicipios).mockResolvedValue(mockMunicipios);
    vi.mocked(getEstaciones)
      .mockResolvedValueOnce([mockStation('001')])
      .mockResolvedValueOnce([mockStation('002')]);

    await fetchPrices(15);
    expect(mockBar.update).toHaveBeenCalledTimes(2);
    expect(mockBar.stop).toHaveBeenCalledOnce();
  });

  it('flattens results from all municipalities', async () => {
    vi.mocked(getMunicipios).mockResolvedValue(mockMunicipios);
    vi.mocked(getEstaciones)
      .mockResolvedValueOnce([mockStation('001'), mockStation('001')])
      .mockResolvedValueOnce([mockStation('002')]);

    const result = await fetchPrices(15);
    expect(result).toHaveLength(3);
  });

  it('skips municipalities that return empty arrays', async () => {
    vi.mocked(getMunicipios).mockResolvedValue(mockMunicipios);
    vi.mocked(getEstaciones)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockStation('002')]);

    const result = await fetchPrices(15);
    expect(result).toHaveLength(1);
  });
});
