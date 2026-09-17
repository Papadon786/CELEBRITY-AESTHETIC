type WithDecimal<T, K extends keyof T> = Omit<T, K> & { [P in K]: number | null }

export function serializeDecimal<T, K extends keyof T>(
  record: T,
  keys: K[]
): WithDecimal<T, K> {
  if (!record) return record as unknown as WithDecimal<T, K>
  const result = { ...record } as WithDecimal<T, K>
  for (const key of keys) {
    const value = record[key] as unknown
    ;(result as Record<string, unknown>)[key as string] =
      value == null ? null : typeof value === "number" ? value : Number(value)
  }
  return result
}

/**
 * Deep-walks a value and converts any Decimal/BigInt or numeric instance to a plain number.
 */
export function toPlain<T>(value: T): T {
  if (value == null) return value
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") return value
  if (value instanceof Date) return value
  if (typeof value === "object" && "toNumber" in (value as any) && typeof (value as any).toNumber === "function") {
    return (value as any).toNumber()
  }
  if (typeof value === "object" && "d" in (value as any) && "e" in (value as any) && "s" in (value as any)) {
    return Number(value) as unknown as T
  }
  if (Array.isArray(value)) return value.map((v) => toPlain(v)) as unknown as T
  if (typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v)
    return out as T
  }
  return value
}
