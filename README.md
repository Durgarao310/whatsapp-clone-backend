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

Create a `.env` file in the project root with the following variables:

```env
MONGO_URI=mongodb+srv://<user>:<password>@host/db
JWT_SECRET=your_jwt_secret_here
dbName=realtime-chat
ALLOWED_ORIGINS=http://localhost:3000
PORT=5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
```

> The server will not start if required variables are missing.

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

```
src/
  controllers/      # Route handlers (API logic)
  services/         # Business logic (DB, processing)
  models/           # Mongoose schemas (User, Message, Call)
  routes/           # Express routers (API endpoints)
  helpers/          # Async, validation, JWT, and utility helpers
  middlewares/      # Express and Socket middlewares (auth, error)
  socket/           # Socket.IO event handlers and setup
  validation/       # All validation logic (express-validator)
  swagger/          # OpenAPI YAML files for API docs
  __tests__/        # Integration and edge-case tests (Jest)
  types/            # Custom TypeScript types and module declarations
index.ts            # App entry point (Express, Socket.IO, Redis, Swagger)
```

---

## Socket.IO Events

| Event Name         | Direction      | Payload Example / Description                                 |
|--------------------|---------------|--------------------------------------------------------------|
| private-message    | client/server | `{ senderId, receiverId, content }`                          |
| message-seen       | client/server | `{ messageId, userId }`                                      |
| user-online        | server        | `{ userId }`                                                 |
| user-offline       | server        | `{ userId }`                                                 |
| call-user          | client/server | `{ callerId, calleeId, signal }`                             |
| answer-call        | client/server | `{ callId, callerId, calleeId, signal }`                     |
| ice-candidate      | client/server | `{ callerId, calleeId, signal }`                             |
| end-call           | client/server | `{ callId, status, userId, peerId }`                         |
| operation-error    | server        | `{ message, code }`                                          |
| friend-request     | server        | `{ fromUserId, toUserId }` (planned: on send/accept/reject)  |

**Flow Example:**
- `private-message`: Sent by client to server, then relayed to receiver's sockets.
- `user-online`/`user-offline`: Broadcast by server when a user connects/disconnects.
- `call-user`, `answer-call`, `ice-candidate`, `end-call`: Used for WebRTC signaling.
- `friend-request`: (Planned) Notify users of new, accepted, or rejected friend requests.

---

## Production Notes
- Set `NODE_ENV=production` and configure `ALLOWED_ORIGINS`.
- Consider using HTTPS and a process manager (e.g., PM2).

---

## Security Best Practice: JWT Secret Management

For enhanced security in production environments, it is recommended to store your JWT secret using a secrets manager (such as AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault) or use encrypted environment variables. Avoid hardcoding secrets or storing them in plaintext `.env` files in version control.

Example (for AWS Secrets Manager):
- Store your secret in AWS Secrets Manager.
- Fetch the secret at runtime and set it as `process.env.JWT_SECRET` before starting the server.

This helps prevent accidental exposure of sensitive credentials.

---

## License
MIT
# whatsapp-clone-backend
# whatsapp-clone-backend
