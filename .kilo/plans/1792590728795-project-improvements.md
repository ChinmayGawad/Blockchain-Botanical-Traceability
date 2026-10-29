# Phased Improvement Plan — Blockchain Botanical Traceability

> **Status: all five phases implemented.** Every phase was validated locally
> (backend `mvnw verify`, frontend `npm run test:unit` / `typecheck` / `build` /
> `analyze:bundle`). The notes under each phase record how the phase was
> realised and where the implementation deliberately differs from the original
> wording.

## Phase 1 — Backend Test Coverage & CI Baseline (implement first)
Goal: Establish reliable backend test baseline before refactoring.

Tasks:
1. Add unit tests for ProductService (CRUD, not-found, validation). — `ProductServiceTest` (12 cases: registration, QR value, provenance records, sanitisation, lookups, filters, role scoping).
2. Add unit tests for BatchService (create, status transitions, RBAC). — There is no `BatchService`; the batch lifecycle lives in the stage services, so `BatchLifecycleServiceTest` covers registration → processing → laboratory QA → cold chain → retail receipt plus the rejected transitions.
3. Add unit tests for ShipmentService and QR generation. — `ShipmentServiceTest` (dispatch, status updates, duplicate/invalid guards, QR continuity) and `RetailerServiceTest` (retail receipt activates the consumer QR code).
4. Add AuthController integration tests for role guards and JWT validation. — `AuthControllerTest` (15 cases) plus `ProductControllerTest`, `ShipmentControllerTest` and `JwtTokenProviderTest` (signature, expiry, tampering, unsigned tokens).
5. Wire backend Maven tests into CI (already runs `mvn test`); ensure tests pass on ubuntu. — CI now runs `./mvnw verify` (tests + JaCoCo gate) and uploads the coverage report.
6. Add test fixtures using H2 or Testcontainers; avoid mutating prod DB. — `application-test.yml` (isolated H2 `florachain_test_db`), `TestFixtures` helpers, and `SchemaMigrationTest` which asserts the datasource is H2 and that Flyway applied every migration.

Validation:
- `cd backend && mvnw test` passes locally and in CI. — 92 tests, 0 failures.
- Coverage report generated (optional jacoco). — JaCoCo report on every `mvn test`, quality gate on `mvn verify` (line coverage 77.7 %, gate 35 %).

## Phase 2 — Security Hardening
- Enforce 256-bit JWT secret across all profiles; add startup validation. — `JwtTokenProvider` rejects weak secrets, the previously published placeholder and missing secrets in `prod`; dev/test use a random per-boot key.
- Add rate limiting on `/auth/**`. — Sliding window limiter, configurable via `RATE_LIMIT_*`, covered by `RateLimitingFilterTest`.
- Input validation/sanitization in controllers. — Bean validation on the DTOs, `InputSanitizer` in the services, `ConstraintViolationException`/`HttpMessageNotReadableException` mapped to `400`.
- Secrets via env only; no hardcoded defaults. — Removed the hardcoded secret from `application.yml`, `.env.example` and `docker-compose.yml` (compose now fails fast with `JWT_SECRET` unset).

## Phase 3 — Frontend Performance
- Lazy-load heavy map components and BlockchainContext. — The journey map and the Mapbox/Turf partner selector are loaded on demand. `BlockchainContext` itself is imported statically by ~25 components, so the heavy part (ethers) was split out instead: `web3Service` is now loaded through a dynamic import and the ethers-free configuration lives in `src/services/web3Config.ts` (initial payload −100 kB gzipped).
- Analyze bundle; remove unused deps. — `npm run analyze:bundle` prints the chunk report and fails on budget violations; all declared dependencies are in use, so none were removed.
- Add React error boundary already present; extend to async routes. — `ErrorBoundary` gained a `route` variant that detects lazy-chunk failures and offers a reload; it now wraps every route in `AppRoutes`.

## Phase 4 — Observability
- Structured logging (SLF4J + MDC) in backend. — `RequestCorrelationFilter` + `logback-spring.xml` (request id, user, role, method, path, status).
- Frontend error reporting (console fallback or Sentry). — `src/services/errorReporting.ts` (console + optional collector via `VITE_ERROR_REPORTING_URL`), wired into the error boundaries and the global `error`/`unhandledrejection` handlers.
- Health/readiness endpoints. — Actuator health, liveness and readiness probes (public, used by the compose healthchecks).

## Phase 5 — Data Integrity & DX
- Replace runtime DataInitializer writes with Flyway seed migrations. — `DataInitializer` deleted; `V3__seed_reference_data.sql` seeds the demo dataset, `V2__align_schema_with_jpa_entities.sql` reconciles the schema with the entity model.
- Add DB constraints/indexes. — `NOT NULL`, foreign keys, `CHECK` constraints and lookup indexes added in V2 and asserted by `SchemaMigrationTest`.
- Complete .env.example; docker-compose healthchecks. — Both rewritten: no secret defaults, healthchecks for postgres/backend (readiness probe)/frontend.
- Pre-commit hooks for lint/typecheck. — `.githooks/pre-commit` (secret guard, typecheck, unit tests, backend compile), installed through `npm run prepare`.

## Risks
- Backend refactor may require DB migration; test locally. — Addressed: the migration set was validated against H2 (dev/test) and the entity mapping is verified by `ddl-auto=validate` in `SchemaMigrationTest`. Existing PostgreSQL deployments keep their data; V2 migrates the legacy columns in place.
- Lazy loading may affect E2E selectors. — The Playwright specs are unaffected (routes and DOM stay the same); only the loading strategy changed.

## Open Questions
- Preferred observability provider. — Open: the backend now emits structured key/value logs and the frontend ships errors to a configurable HTTP collector; a hosted provider (Sentry/Datadog) can be plugged into `VITE_ERROR_REPORTING_URL` later.
- Keep mock data for demo or remove. — Kept: the demo dataset now lives in `V3__seed_reference_data.sql` and is available in every profile, so the runtime mock seeding code could be removed safely.

## Final Validation (2026-10-21)
- `backend\mvnw.cmd verify` → `BUILD SUCCESS`, 92 tests / 0 failures, JaCoCo line coverage 77.7 % (gate 35 %), "All coverage checks have been met".
- `npm run test:unit` → 20 files / 135 tests passed; `npm run typecheck` → clean.
- `npm run build` → entry chunk 90.71 kB gzipped; `npm run analyze:bundle` → "All chunks are within budget" (total 988.7 kB gzipped).
- `npm run prepare` → `core.hooksPath=.githooks` installed locally.
- Migration hardening: the legacy `VARCHAR` → `DATE`/`DOUBLE` casts in V2 now skip empty strings, so a production row with a blank legacy value cannot abort the migration; V2 documents the assumption that the tables originate from V1 (a Hibernate-provisioned database needs a baseline/repair first).
