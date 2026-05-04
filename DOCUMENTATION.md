# Petrol Scout CLI Documentation

## 1. Project Overview

**Petrol Scout** is a Command-Line Interface (CLI) application designed to extract and analyze real-time retail fuel prices (gasoline and diesel) across different regions in Mexico.

### What it does
The tool queries public government Application Programming Interfaces (APIs) maintained by the Comisión Nacional de Energía (CNE). It allows users to fetch detailed, station-level price reports for specific municipalities or entire states. Once fetched, the data can be output directly to the terminal, saved as JSON, exported to CSV for database ingestion, or exported to XLSX (Excel) for data analysis.

### Key Use Cases
- Data analysts scraping price data for historical trend analysis.
- Automation scripts syncing live fuel prices into central databases (e.g., Supabase/PostgreSQL).
- Business intelligence monitoring for retail pricing strategy.

---

## 2. Architecture & Implementation (How it works)

Petrol Scout is built on a modern **Node.js** and **TypeScript** stack, ensuring type safety and maintainability.

### Under the Hood
1. **CLI Routing (`src/cli.ts`)**: Built with `commander`, it sets up argument parsing and handles the main flow, validating required arguments (`--state`) and optional ones (`--municipality`, `--output`, `--file`).
2. **API Clients (`src/api`)**: Uses `axios` to perform HTTP GET requests to the CNE public endpoints:
   - **Catalog API:** Fetches the list of all municipalities within a given state ID.
   - **Report API:** Fetches the actual prices (by station permit, product type, and price) for a given state and municipality ID.
3. **Data Validation (`src/schemas.ts`)**: Uses `zod` to strictly validate the JSON payloads coming from the CNE APIs. This ensures that upstream changes to the API will throw structured validation errors rather than silently failing downstream.
4. **Orchestration & Rate Limiting (`src/fetcher.ts`)**: 
   - If a specific municipality is requested, it makes a single fast API call.
   - If an entire state is requested, the fetcher first queries the Catalog API to list all municipalities, then iterates over them. To respect the CNE servers, it applies a `delay()` of 200ms between calls and displays a progress bar (`cli-progress`) so the user can track large queries.
5. **Exporters (`src/exporters`)**: Converts the normalized JSON arrays into standard CSV (via `csv-stringify`) or Excel files (via `exceljs`), writing them directly to the file system.

---

## 3. User Manual

### Installation & Setup

Ensure you have **Node.js 18+** installed.

Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/petrol-scout.git
cd petrol-scout
npm install
npm run build
```

To run it during development:
```bash
npm run dev -- [arguments]
```
To run the built version:
```bash
node dist/index.js [arguments]
```

*(You can also use `npm link` to run it globally via the `petrol-scout` command).*

### Command Reference

```bash
petrol-scout --state <id> [options]
```

| Option | Shorthand | Description | Required | Default |
|--------|-----------|-------------|----------|---------|
| `--state` | `-s` | The numerical ID of the Mexican state (e.g., `15` for Estado de México, `27` for Tabasco). | Yes | None |
| `--municipality`| `-m` | The ID of a specific municipality. If omitted, fetches the whole state. | No | All |
| `--output` | `-o` | The output file format. Valid options: `json`, `csv`, `xlsx`. | No | `json` |
| `--file` | `-f` | Path where the output file will be saved. Required if using `csv` or `xlsx`. | No* | stdout |

### Usage Examples

**1. Fetching a specific municipality to terminal (JSON)**
If you want to view the data directly in your terminal for debugging:
```bash
node dist/index.js --state 27 --municipality 4
```

**2. Fetching an entire state to a JSON file**
If you want to dump the entire state of Tabasco (State ID 27) into a local file:
```bash
node dist/index.js -s 27 -f tabasco-prices.json
```
*Note: You will see a progress bar indicating the fetch progress for all municipalities within the state.*

**3. Exporting specific data to CSV**
Perfect for database seeding or manual SQL comparisons:
```bash
node dist/index.js --state 27 --municipality 4 --output csv --file centro-tabasco.csv
```

**4. Exporting to Excel (XLSX)**
Ideal for sharing with non-technical stakeholders or data analysts:
```bash
node dist/index.js --state 15 --output xlsx --file edomex-prices.xlsx
```

---

## Troubleshooting

- **`Error: invalid format "txt"`**: You passed an unsupported output format. Make sure to use `json`, `csv`, or `xlsx`.
- **`Error: --file is required for csv output`**: You must specify a file path using `-f` or `--file` when using the CSV or Excel exporters.
- **Empty results**: If the CLI finishes but outputs an empty array `[]`, the state or municipality ID might be invalid, or the CNE API might currently have no data for that region. Verify the IDs against the `STATES.md` and `MUNICIPALITIES.md` reference files included in this project.
