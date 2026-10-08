export function touch<T extends object>(data: T): T & { updated_at: Date } {
  return { ...data, updated_at: new Date() };
}