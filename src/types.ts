export type OutputFormat = 'json' | 'csv' | 'xlsx';

export interface CliOptions {
  state: number;
  municipality?: string;
  output: OutputFormat;
  file?: string;
}
