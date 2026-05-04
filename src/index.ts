import { buildCli } from './cli.js';

buildCli().parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
