import { getMunicipios } from './api/catalog.js';
import { getEstaciones } from './api/report.js';
import { delay } from './utils/delay.js';
import { createProgressBar } from './utils/progress.js';
import type { EstacionPrecio } from './schemas.js';

const RATE_LIMIT_MS = 200;

export async function fetchPrices(
  stateId: number,
  municipioId?: string
): Promise<EstacionPrecio[]> {
  if (municipioId !== undefined) {
    return getEstaciones(stateId, municipioId);
  }

  const municipios = await getMunicipios(stateId);
  const bar = createProgressBar(municipios.length);
  const results: EstacionPrecio[] = [];

  for (let i = 0; i < municipios.length; i++) {
    const estaciones = await getEstaciones(stateId, municipios[i].MunicipioId);
    results.push(...estaciones);
    bar.update(i + 1);

    if (i < municipios.length - 1) {
      await delay(RATE_LIMIT_MS);
    }
  }

  bar.stop();
  return results;
}
