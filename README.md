# @dimensionalpocket/tagged-logger

Console logger that prefixes output with tags, for tracing work through a
request, job or pipeline.

Not published to npm. Install it from GitHub, pinned to a tag:

<!-- x-release-please-start-version -->

```sh
bun add git@github.com:dimensionalpocket/tagged-logger.git#0.0.0
```

<!-- x-release-please-end -->

## Usage

```ts
import { TaggedLogger } from "@dimensionalpocket/tagged-logger"

const log = new TaggedLogger("request_id=123")

log.info("started")
// 260628@143045.123 request_id=123 started

log.error("failed", new Error("boom"))

// Add more tags without touching the original
const jobLog = log.derive("job=1")
jobLog.info("progress", "50%")
// 260628@143045.124 request_id=123 job=1 progress 50%
```

`log`, `error`, `warn`, `info`, `debug` and `trace` map to the `console` method
of the same name.

## Options

```ts
log.timestamp = false // omit the timestamp, default is true
```

Set `TAGGED_LOGGER_SILENT=1` to silence every logger.

## License

MIT
