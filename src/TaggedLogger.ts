import { colorize } from "./colorize"

export class TaggedLogger {
  readonly tags: readonly string[]
  #silent = !!process.env.TAGGED_LOGGER_SILENT
  timestamp = true

  constructor(...tags: string[]) {
    this.tags = tags
  }

  derive(...extraTags: string[]): TaggedLogger {
    const logger = new TaggedLogger(...this.tags, ...extraTags)
    logger.timestamp = this.timestamp
    return logger
  }

  log(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.log(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.log(...this.tags, ...args)
    }
  }

  error(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.error(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.error(...this.tags, ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.warn(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.warn(...this.tags, ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.info(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.info(...this.tags, ...args)
    }
  }

  debug(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.debug(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.debug(...this.tags, ...args)
    }
  }

  trace(...args: unknown[]): void {
    if (this.#silent) return
    if (this.timestamp) {
      console.trace(colorizeTimestamp(), ...this.tags, ...args)
    } else {
      console.trace(...this.tags, ...args)
    }
  }
}

function formatTimestamp(): string {
  const now = new Date()
  const YY = String(now.getFullYear()).slice(2)
  const MM = String(now.getMonth() + 1).padStart(2, "0")
  const DD = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  const ms = String(now.getMilliseconds()).padStart(3, "0")
  return `${YY}${MM}${DD}@${hh}${mm}${ss}.${ms}`
}

function colorizeTimestamp(): string {
  return colorize(formatTimestamp(), "grey")
}
