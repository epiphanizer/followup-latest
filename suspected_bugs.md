# Suspected Bugs / Oddities

- `npm test -- --runTestsByPath …` and direct `node ./node_modules/jest/bin/jest.js --runTestsByPath …` keep exiting with code 130 (SIGINT) immediately in this environment. New service/resolver specs were added but could not be verified because the test runner is being interrupted before execution. Needs investigation on why SIGINT is being sent.
- `PatientCallStatusService.handleAsyncError` logs `Backend returned code undefined` when handed an `HttpErrorResponse` from the tests. The method still returns the HTML error string, but the logged status being `undefined` suggests the thrown error shape may not be fully respected in some cases.
