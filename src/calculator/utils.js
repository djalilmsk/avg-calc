export function clampNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function nowLabel() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function safeParse(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}
