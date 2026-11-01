import { describe, expect, it } from "bun:test"
import { colorize } from "./colorize"

describe("colorize", () => {
  it("wraps text with ANSI color code and reset", () => {
    const result = colorize("hello", "red")
    expect(result.startsWith("\x1b[")).toBe(true)
    expect(result.endsWith("\x1b[0m")).toBe(true)
    expect(result).toContain("hello")
  })

  it("supports string color names", () => {
    const red = colorize("x", "red")
    const blue = colorize("x", "blue")
    expect(red).not.toBe(blue)
  })

  it("supports hex strings", () => {
    const a = colorize("x", "#ff0000")
    const b = colorize("x", "#0000ff")
    expect(a).not.toBe(b)
  })

  it("supports numeric colors", () => {
    const result = colorize("x", 0xff0000)
    expect(result.startsWith("\x1b[")).toBe(true)
    expect(result.endsWith("\x1b[0m")).toBe(true)
  })

  it("supports RGB objects", () => {
    const result = colorize("x", { r: 255, g: 0, b: 0 })
    expect(result.startsWith("\x1b[")).toBe(true)
    expect(result.endsWith("\x1b[0m")).toBe(true)
  })

  it("supports RGB arrays", () => {
    const result = colorize("x", [255, 0, 0])
    expect(result.startsWith("\x1b[")).toBe(true)
    expect(result.endsWith("\x1b[0m")).toBe(true)
  })

  it("returns text as-is when color is invalid", () => {
    const result = colorize("hello", "not-a-color" as any)
    expect(result).toBe("hello")
  })

  it("always ends with reset code", () => {
    for (const input of [
      "green",
      "#00ff00",
      0x00ff00,
      { r: 0, g: 255, b: 0 },
      [0, 255, 0],
    ]) {
      const result = colorize("text", input as any)
      expect(result.endsWith("\x1b[0m")).toBe(true)
    }
  })
})
