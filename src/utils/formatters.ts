export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

export function formatFlops(tflops: number): string {
  if (tflops >= 1_000_000) {
    return `${(tflops / 1_000_000).toFixed(2)} EFLOPS`;
  }
  if (tflops >= 1_000) {
    return `${(tflops / 1_000).toFixed(2)} PFLOPS`;
  }
  return `${Math.round(tflops)} TFLOPS`;
}

export function formatStorage(pb: number): string {
  if (pb >= 1_000) {
    return `${(pb / 1_000).toFixed(2)} EB`;
  }
  if (pb < 1) {
    return `${Math.round(pb * 1000)} TB`;
  }
  return `${pb.toFixed(2)} PB`;
}

export function formatPower(kw: number): string {
  if (kw >= 1_000_000) {
    return `${(kw / 1_000_000).toFixed(2)} GW`;
  }
  if (kw >= 1_000) {
    return `${(kw / 1_000).toFixed(2)} MW`;
  }
  return `${Math.round(kw)} kW`;
}

export function formatBandwidth(gbps: number): string {
  if (gbps >= 1_000) {
    return `${(gbps / 1_000).toFixed(2)} Tbps`;
  }
  return `${Math.round(gbps)} Gbps`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
