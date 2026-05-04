import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay } from '../../src/utils/delay.js';

describe('delay', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('resolves after specified ms', async () => {
    const promise = delay(200);
    vi.advanceTimersByTime(200);
    await expect(promise).resolves.toBeUndefined();
  });

  it('does not resolve before time elapses', async () => {
    let resolved = false;
    const promise = delay(200).then(() => { resolved = true; });
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(100);
    await promise;
    expect(resolved).toBe(true);
  });
});
