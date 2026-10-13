# CollectorCheck v1

CollectorCheck is a deterministic ingestion, metadata extraction, and cloud-processing engine for receipts and collectible documentation.

It provides a command-line interface, a versioned JavaScript API, structured logging and errors, and local and remote-simulation cloud adapters. The current OCR and PDF extractors are deterministic stubs; they provide pipeline wiring, not production text recognition or document verification.

## Requirements

- Node.js 22.12 or newer
- Git

This repository currently has no `package.json` or third-party runtime dependencies, so `npm install` is not required.

## Installation

```bash
git clone https://github.com/Isotherm-Applied-Sciences/collectorcheck.git
cd collectorcheck
```

## CLI Usage

The CLI reads files from `receipts/` by default. Set `COLLECTORCHECK_RECEIPTS_DIR` to use a different directory.

```bash
node bin/collectorcheck-cli.mjs snapshot
node bin/collectorcheck-cli.mjs process
node bin/collectorcheck-cli.mjs meta path/to/receipt.jpg
```

On PowerShell, set a custom input directory with:

```powershell
$env:COLLECTORCHECK_RECEIPTS_DIR = "C:\path\to\receipts"
```

The process command saves results to `collectorcheck-local/` and `collectorcheck-remote-sim/` by default. Configure these roots with `COLLECTORCHECK_LOCAL_ROOT` and `COLLECTORCHECK_REMOTE_ROOT` respectively.

## JavaScript API

Import the v1 API surface from `src/api/index.js`:

```js
import { v1 } from './src/api/index.js';

const result = await v1.processAll();
console.log(result);
```

The API also exposes `v1.snapshot()`, `v1.extractMetadata(file)`, and `v1.validateApiResult(result)`. Responses use this shape:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Errors use `ok: false`, `data: null`, and an `error` object containing `code`, `msg`, and `data`. See [the v1 API reference](src/api/docs/v1.md) and [machine-readable API description](src/api/docs/v1.json) for details.

## Tests

Run the API contract tests with:

```bash
node --input-type=module -e "import { runApiContractTests } from './src/api/tests/contract-tests.js'; console.log(await runApiContractTests());"
```

Run the documentation checks with:

```bash
node --input-type=module -e "import { runApiDocsTests } from './src/api/tests/docs-tests.js'; console.log(runApiDocsTests());"
```

## Architecture

- **Ingestion** snapshots the configured receipt directory.
- **Metadata pipeline** routes PDFs and images to deterministic parser stubs and normalizes extracted fields.
- **Engine** coordinates ingestion, metadata extraction, and cloud writes.
- **Cloud adapters** write JSON locally and to the remote simulation directory, returning contract-validated results.
- **API** exposes the versioned v1 methods and response contract.

Future API versions will be published under `src/api/v2`, `src/api/v3`, and so on. Contributions should follow the conventions in [CONTRIBUTING.md](CONTRIBUTING.md). CollectorCheck is released under the MIT License; see [LICENSE](LICENSE).
