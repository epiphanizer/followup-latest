# Suspected Bugs / Oddities

- Historical note: the earlier `npm test -- --runTestsByPath …` / direct Jest SIGINT symptom no longer reproduces consistently in this environment. Focused `--runTestsByPath` coverage passed on 2026-05-18 for the operation-group form and operation service suites, so treat the old SIGINT note as stale unless it reappears on a different slice.
- `PatientCallStatusService.handleAsyncError` logs `Backend returned code undefined` when handed an `HttpErrorResponse` from the tests. The method still returns the HTML error string, but the logged status being `undefined` suggests the thrown error shape may not be fully respected in some cases.
