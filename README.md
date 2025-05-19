# Realtime Chat Backend

## Overview
This is a modular, maintainable Node.js + TypeScript backend for a realtime chat application. It supports multi-device connections, robust validation, async error handling, and is production-ready with CORS, rate limiting, and logging.

---

## Helpers

### `asyncatch`
A utility for concise async error handling:
```ts
const [result, err] = await asyncatch(promise);
```
Returns a tuple: `[result, error]`.

### `saveDoc`
A utility to save a Mongoose document with error handling:
```ts
const [saved, err] = await saveDoc(doc);
```

### `handleValidation`
Express middleware to handle validation errors from `express-validator`:
```ts
import { handleValidation } from '../helpers/validation';
```
Use after validation arrays in routes.

---

## Validation Structure
- All validation logic is in `src/validation/`.
- Each route imports relevant validation arrays and uses `handleValidation` middleware.

---

## Environment Variables
- `MONGO_URI` (required)
- `JWT_SECRET` (required)
- `dbName` (required)
- `ALLOWED_ORIGINS` (comma-separated, for CORS)
- `PORT` (optional, default 5000)

The server will not start if required variables are missing.

---

## CORS & Rate Limiting
- CORS origins are restricted via `ALLOWED_ORIGINS`.
- Global rate limiting is enabled. Sensitive endpoints (e.g., auth) have stricter limits.

---

## Logging
- All errors in controllers and services are logged using Winston (`logger`).

---

## Multi-Device Socket Support
- Each user has a `socketIds: string[]` array in the DB.
- Socket event handlers and user logic support multiple concurrent device connections.

---

## Swagger API Docs
- Available at `/api/docs` when the server is running.
- User schema now documents `socketIds: string[]`.

---

## Testing
- See `src/__tests__/` for integration and validation tests.

---

## Adding New Validation
1. Create a new file in `src/validation/`.
2. Export an array of validation rules.
3. Import and use in the relevant route, followed by `handleValidation`.

---

## Project Structure
- `controllers/` - Route handlers
- `services/` - Business logic
- `models/` - Mongoose schemas
- `routes/` - Express routers
- `helpers/` - Async, validation, and JWT helpers
- `validation/` - All validation logic
- `middlewares/` - Express and Socket middlewares
- `socket/` - Socket.IO logic
- `__tests__/` - Tests

---

## Production Notes
- Set `NODE_ENV=production` and configure `ALLOWED_ORIGINS`.
- Consider using HTTPS and a process manager (e.g., PM2).

---

## License
MIT
# whatsapp-clone-backend
