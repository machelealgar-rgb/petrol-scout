import ExcelJS from 'exceljs';
import type { EstacionPrecio } from '../schemas.js';

const HEADERS: (keyof EstacionPrecio)[] = [
  'Numero', 'Nombre', 'Direccion', 'Producto', 'SubProducto',
  'PrecioVigente', 'EntidadFederativaId', 'MunicipioId',
];

export async function toXlsx(stations: EstacionPrecio[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'gas-prices-cli';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Precios');
  const headerRow = sheet.addRow(HEADERS);
  headerRow.font = { bold: true };
  headerRow.commit();

  for (const s of stations) {
    sheet.addRow(HEADERS.map((h) => s[h] ?? null));
  }

  sheet.columns.forEach((col) => { col.width = 20; });

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
