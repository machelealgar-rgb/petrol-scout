import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import { fetchPrices } from './fetcher.js';
import { exportData } from './exporters/index.js';
import type { OutputFormat } from './types.js';

const VALID_FORMATS: OutputFormat[] = ['json', 'csv', 'xlsx'];

export function buildCli(): Command {
  const program = new Command();

  program
    .name('gas-prices')
    .description('Fetch Mexican gas station prices from CNE government APIs')
    .version('1.0.0');

  program
    .requiredOption('-s, --state <id>', 'State ID (entidad federativa)', parseInt)
    .option('-m, --municipality <id>', 'Municipality ID (optional — omit to fetch all)')
    .option('-o, --output <format>', 'Output format: json | csv | xlsx', 'json')
    .option('-f, --file <path>', 'Output file path (required for csv and xlsx)')
    .action(async (options) => {
      const format = options.output as OutputFormat;

      if (!VALID_FORMATS.includes(format)) {
        console.error(`Error: invalid format "${format}". Use json, csv, or xlsx.`);
        process.exit(1);
      }

      if (format !== 'json' && !options.file) {
        console.error(`Error: --file is required for ${format} output.`);
        process.exit(1);
      }

      try {
        const stations = await fetchPrices(options.state, options.municipality);

        if (stations.length === 0) {
          console.warn('Warning: no stations found for the given parameters.');
        }

        const output = await exportData(format, stations);

        if (options.file) {
          await writeFile(options.file, output as string | Buffer);
          console.log(`Wrote ${stations.length} records to ${options.file}`);
        } else {
          process.stdout.write(output as string);
        }
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    });

  return program;
}
