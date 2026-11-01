import {
  describe,
  expect,
  it,
  mock,
  beforeEach,
  afterEach,
  setSystemTime,
} from "bun:test"
import { TaggedLogger } from "./TaggedLogger"

describe("TaggedLogger", () => {
  const spies: ReturnType<typeof mock>[] = []

  beforeEach(() => {
    for (const method of ["log", "error", "warn", "info", "debug", "trace"]) {
      const spy = mock(() => {})
      spies.push(spy)
      // @ts-expect-error spy mock
      console[method] = spy
    }
  })

  afterEach(() => {
    spies.length = 0
    console.log = globalThis.console.log
    console.error = globalThis.console.error
    console.warn = globalThis.console.warn
    console.info = globalThis.console.info
    console.debug = globalThis.console.debug
    console.trace = globalThis.console.trace
  })

  it("prepends tags to log output", () => {
    const logger = new TaggedLogger("request_id=123")
    logger.timestamp = false
    logger.info("abc", "456")
    expect(console.info).toHaveBeenCalledWith("request_id=123", "abc", "456")
  })

  it("prepends tags to all console methods", () => {
    const logger = new TaggedLogger("tag1")
    logger.timestamp = false
    logger.log("a")
    logger.error("b")
    logger.warn("c")
    logger.info("d")
    logger.debug("e")
    logger.trace("f")

    expect(console.log).toHaveBeenCalledWith("tag1", "a")
    expect(console.error).toHaveBeenCalledWith("tag1", "b")
    expect(console.warn).toHaveBeenCalledWith("tag1", "c")
    expect(console.info).toHaveBeenCalledWith("tag1", "d")
    expect(console.debug).toHaveBeenCalledWith("tag1", "e")
    expect(console.trace).toHaveBeenCalledWith("tag1", "f")
  })

  it("handles multiple tags", () => {
    const logger = new TaggedLogger("a", "b", "c")
    logger.timestamp = false
    logger.info("msg")
    expect(console.info).toHaveBeenCalledWith("a", "b", "c", "msg")
  })

  it("handles no tags", () => {
    const logger = new TaggedLogger()
    logger.timestamp = false
    logger.info("msg")
    expect(console.info).toHaveBeenCalledWith("msg")
  })

  describe("#derive", () => {
    it("returns a new instance with appended tags", () => {
      const logger = new TaggedLogger("request_id=123")
      const derived = logger.derive("job=1")

      expect(derived).toBeInstanceOf(TaggedLogger)
      expect(derived).not.toBe(logger)
      expect(derived.tags).toEqual(["request_id=123", "job=1"])
    })

    it("does not mutate the original logger", () => {
      const logger = new TaggedLogger("a")
      logger.derive("b")
      expect(logger.tags).toEqual(["a"])
    })

    it("prepends all tags to output", () => {
      const logger = new TaggedLogger("request_id=123")
      logger.timestamp = false
      const derived = logger.derive("job=1")
      derived.info("progress", "50%")
      expect(console.info).toHaveBeenCalledWith(
        "request_id=123",
        "job=1",
        "progress",
        "50%",
      )
    })

    it("chains multiple derives", () => {
      const logger = new TaggedLogger("a")
      logger.timestamp = false
      const derived = logger.derive("b").derive("c")
      derived.info("msg")
      expect(console.info).toHaveBeenCalledWith("a", "b", "c", "msg")
    })
  })

  describe("#timestamp", () => {
    it("prepends timestamp by default", () => {
      const logger = new TaggedLogger("tag")
      logger.info("msg")
      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/^\x1b\[[\d;]+m\d{6}@\d{6}\.\d{3}\x1b\[0m$/),
        "tag",
        "msg",
      )
    })

    it("does not prepend timestamp when false", () => {
      const logger = new TaggedLogger("tag")
      logger.timestamp = false
      logger.info("msg")
      expect(console.info).toHaveBeenCalledWith("tag", "msg")
    })

    it("uses YYMMDD@hh24mmss.mmm format", () => {
      setSystemTime(new Date("2026-06-28T14:30:45.123Z"))
      const logger = new TaggedLogger()
      logger.info("msg")
      const callArgs = (console.info as ReturnType<typeof mock>).mock.calls[0]
      const ts = callArgs[0].replace(/\x1b\[[\d;]+m/g, "")
      expect(ts).toBe("260628@143045.123")
      setSystemTime()
    })

    it("prepends timestamp on all console methods", () => {
      const logger = new TaggedLogger("tag")
      logger.log("a")
      logger.error("b")
      logger.warn("c")
      logger.info("d")
      logger.debug("e")
      logger.trace("f")

      const expectedFirst = expect.stringMatching(/^\x1b\[[\d;]+m/)
      expect(console.log).toHaveBeenCalledWith(expectedFirst, "tag", "a")
      expect(console.error).toHaveBeenCalledWith(expectedFirst, "tag", "b")
      expect(console.warn).toHaveBeenCalledWith(expectedFirst, "tag", "c")
      expect(console.info).toHaveBeenCalledWith(expectedFirst, "tag", "d")
      expect(console.debug).toHaveBeenCalledWith(expectedFirst, "tag", "e")
      expect(console.trace).toHaveBeenCalledWith(expectedFirst, "tag", "f")
    })

    it("can be toggled off", () => {
      const logger = new TaggedLogger("tag")
      logger.info("with")
      logger.timestamp = false
      logger.info("without")

      expect(console.info).toHaveBeenCalledTimes(2)
      expect(
        (console.info as ReturnType<typeof mock>).mock.calls[0][0],
      ).toEqual(expect.stringMatching(/^\x1b\[[\d;]+m/))
      expect((console.info as ReturnType<typeof mock>).mock.calls[1]).toEqual([
        "tag",
        "without",
      ])
    })

    it("derive copies timestamp flag", () => {
      const logger = new TaggedLogger("a")
      logger.timestamp = false
      const derived = logger.derive("b")
      expect(derived.timestamp).toBe(false)
    })

    it("derive preserves timestamp behavior", () => {
      const logger = new TaggedLogger("a")
      const derived = logger.derive("b")
      derived.info("msg")
      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/^\x1b\[[\d;]+m/),
        "a",
        "b",
        "msg",
      )
    })
  })
})
