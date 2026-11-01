const RESET = "\x1b[0m"

export function colorize(text: string, color: Bun.ColorInput): string {
  const ansi = Bun.color(color, "ansi")
  if (ansi === null) return text
  return `${ansi}${text}${RESET}`
}
