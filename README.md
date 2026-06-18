# AgentFlow

AgentFlow is a local platform for running coding tasks through an isolated,
observable worker pipeline.

A task submitted from the CLI or web interface is persisted in Postgres, claimed by
a worker, processed by a coding agent, and validated inside a Docker container.
AgentFlow records the complete execution history—including status transitions,
logs, generated patches, test results, and runtime metrics—and makes it available
through a single API.

The initial implementation uses a deterministic mock agent that modifies a real Git
repository and produces a real patch. This keeps runs reproducible while exercising
the same orchestration and execution path that a model-backed agent would use.

## Architecture

```text
                         +-------------------+
                         |      Web UI       |
                         +---------+---------+
                                   |
 +-------------+                   | HTTP / event stream
 |     CLI     +-------------------+
 +-------------+                   |
                                   v
                         +---------+---------+
                         |    FastAPI API    |
                         +---------+---------+
                                   |
                                   v
                         +---------+---------+
                         |     Postgres      |
                         +---------+---------+
                                   ^
                                   | tasks, leases, events
                                   |
                         +---------+---------+
                         |      Worker       |
                         +---------+---------+
                                   |
                                   v
                         +---------+---------+
                         |  Docker sandbox   |
                         | agent + test run  |
                         +-------------------+
```

### API

The FastAPI service is the control plane for AgentFlow. It accepts tasks, exposes
their current state and execution history, handles cancellation requests, and
serves artifacts such as patches and test results.

Task creation is asynchronous: the API persists the request and returns an
identifier without waiting for execution to finish.

### Postgres

Postgres is the source of truth for tasks, execution attempts, worker leases,
events, and artifacts. It also acts as the initial task queue, allowing workers to
claim work atomically without a separate message broker.

### Worker

Workers claim queued tasks, maintain leases while processing them, and persist each
meaningful state transition. Expired leases allow interrupted work to be recovered
after a worker exits unexpectedly.

### Docker runner

Each task runs in a disposable workspace inside a constrained Docker container.
The runner applies the generated change, executes the configured validation
commands, captures output, and cleans up the execution environment.

### CLI and web UI

The CLI and web dashboard use the same API. Both expose task creation, status,
ordered logs, generated diffs, test results, retry history, and execution metrics.

## Task Lifecycle

```text
queued -> claimed -> preparing -> generating -> testing -> succeeded
   |         |           |             |           |
   +---------+-----------+-------------+-----------+-> failed
                         |
                         +---------------------------> cancelled
```

AgentFlow stores state transitions explicitly so a task's outcome can be understood
without reconstructing state from log messages. A task may have multiple execution
attempts, preserving the history of failures and retries.

## Features

- asynchronous coding-task execution
- durable task and run history
- concurrent workers with atomic task claiming
- worker leases and recovery of interrupted tasks
- deterministic mock agent producing real Git patches
- isolated test execution in Docker
- execution timeouts and resource limits
- structured logs and status events
- patch, test-result, and runtime-metric storage
- retry and cancellation support
- CLI and web interfaces backed by one API

## Running Locally

Local development instructions will be added when the Docker Compose environment is
available.

The intended setup will start Postgres, the API, a worker, and the web UI with a
single command.


