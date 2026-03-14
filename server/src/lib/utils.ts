export function genId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function nowISO(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}
