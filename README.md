# petrol-scout

Scout gas station prices across Mexican states via CNE government APIs.

A command-line tool that fetches real-time fuel prices from the Mexican National Energy Commission (CNE) and exports them as JSON, CSV, or Excel files.

## Features

- **Real-time data**: Fetches current prices from CNE's public APIs
- **Flexible queries**: Search by state, optionally filter by municipality
- **Multiple formats**: Export as JSON, CSV, or XLSX
- **Rate-limited**: Respects API limits with automatic delays
- **Progress tracking**: Visual progress bar for bulk exports
- **Type-safe**: Built with TypeScript and Zod validation

## Installation

```bash
npm install -g petrol-scout
```

Or clone and build from source:

```bash
git clone https://github.com/YOUR_USERNAME/petrol-scout.git
cd petrol-scout
npm install
npm run build
node dist/index.js --help
```

## Usage

### Basic: Single municipality to stdout (JSON)

```bash
petrol-scout --state 15 --municipality 001
```

Output: Pretty-printed JSON array of gas stations with prices.

### Export to CSV

```bash
petrol-scout --state 15 --municipality 001 --output csv --file prices.csv
```

### Export to Excel

```bash
petrol-scout --state 15 --municipality 001 --output xlsx --file prices.xlsx
```

### Fetch all municipalities in a state

```bash
petrol-scout --state 15 --output json --file estado-mexico.json
```

Estado de México (state 15) has 125 municipalities. Total fetch time ~60 seconds with progress bar.

### Options

```
-s, --state <id>           State ID (entidad federativa) — required
                           Example: 15 for Estado de México

-m, --municipality <id>    Municipality ID (optional)
                           If omitted, fetches all municipalities in the state
                           Example: 001, 099, etc.

-o, --output <format>      Output format: json | csv | xlsx
                           Default: json

-f, --file <path>          Output file path
                           Required for csv and xlsx formats
                           Optional for json (prints to stdout if omitted)
```

## Examples

**Estado de México (State 15):**
```bash
# Capital city (Toluca)
petrol-scout --state 15 --municipality 106

# All municipalities
petrol-scout --state 15 --output json --file edomex-all.json

# Specific municipalities to CSV
petrol-scout --state 15 --municipality 057 --output csv --file naucalpan.csv
```

**Other states:**
- State 1: Aguascalientes
- State 5: Coahuila
- State 8: Chihuahua
- State 28: Tamaulipas

## Data Structure

Each station record contains:

```json
{
  "Numero": "PL/1632/EXP/ES/2015",
  "Nombre": "CRIMER S.A. DE C.V.",
  "Direccion": "Acambay - Temascalcingo - San José Ixtapan Km 2.800",
  "Producto": "Gasolinas",
  "SubProducto": "Regular (con un índice de octano mínimo de 87)",
  "PrecioVigente": 23.99,
  "EntidadFederativaId": 15,
  "MunicipioId": "1"
}
```

- **Numero**: Station permit ID
- **Nombre**: Owner/operator company name
- **Direccion**: Street address
- **Producto**: Fuel type (Gasolinas, Diésel)
- **SubProducto**: Fuel specification (Regular 87, Premium 91, etc.)
- **PrecioVigente**: Current price in Mexican Pesos (MXN)
- **EntidadFederativaId**: State ID
- **MunicipioId**: Municipality ID

## Development

### Requirements

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
npm run build    # Compile TypeScript
npm test         # Run test suite
npm run test:watch  # Watch mode
npm run dev      # Run from source with tsx
```

### Project Structure

```
src/
├── index.ts           # Entry point
├── cli.ts             # CLI setup (commander)
├── fetcher.ts         # Orchestrates API calls
├── types.ts           # TypeScript types
├── schemas.ts         # Zod validation schemas
├── api/
│   ├── catalog.ts     # Municipalities lookup
│   └── report.ts      # Gas station prices
├── exporters/
│   ├── index.ts       # Export factory
│   ├── json.ts        # JSON output
│   ├── csv.ts         # CSV output
│   └── xlsx.ts        # Excel output
└── utils/
    ├── delay.ts       # Rate-limiting
    └── progress.ts    # Progress bar

tests/                 # Test suite (vitest)
├── schemas.test.ts
├── api/
├── exporters/
└── utils/
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

34 tests across schemas, API clients, exporters, and utilities.

## API Details

Data comes from the CNE (Comisión Nacional de Energía):

- **Catalog API**: `https://api-catalogo.cne.gob.mx/api/utiles/municipios`
- **Report API**: `https://api-reportediario.cne.gob.mx/api/EstacionServicio/Petroliferos`

Both endpoints are public and require no authentication.

## Performance

- Single municipality: ~1–2 seconds
- Full state (125 municipalities): ~60 seconds with 200ms rate-limiting between requests
- Progress bar shown for multi-municipality queries

## License

MIT

## Contributing

Contributions welcome. Please open an issue or submit a PR.

## Disclaimer

Prices are sourced from CNE public APIs. petrol-scout is not affiliated with the CNE. Use data for informational purposes only.
