import cliProgress from 'cli-progress';

export function createProgressBar(total: number): cliProgress.SingleBar {
  const bar = new cliProgress.SingleBar(
    {
      format: 'Fetching |{bar}| {value}/{total} municipalities ({percentage}%)',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );
  bar.start(total, 0);
  return bar;
}
