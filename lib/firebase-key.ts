export const sanitizeKey = (raw: string): string =>
  // Firebase RTDB keys cannot contain . # $ [ ]
  raw.replace(/[.#$/[\]]/g, "_")
