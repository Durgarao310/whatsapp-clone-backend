# Realtime Chat Backend

## Overview
A modular, production-ready Node.js + TypeScript backend for a realtime chat application. Features multi-device support, robust validation, async error handling, JWT authentication, CORS, rate limiting, logging, and real-time events via Socket.IO. Extensible for advanced features like 2FA, Redis caching, and granular security.

---

## Project Structure

```
src/
  controllers/      # Route handlers (API logic)
  services/         # Business logic (DB, processing)
  models/           # Mongoose schemas (User, Message, Call)
  routes/           # Express routers (API endpoints)
  helpers/          # Async, validation, JWT, Redis, and utility helpers
  middlewares/      # Express and Socket middlewares (auth, error, rate limit)
  socket/           # Socket.IO event handlers and setup
  validation/       # All validation logic (express-validator)
  swagger/          # OpenAPI YAML files for API docs
  __tests__/        # Integration and edge-case tests (Jest)
  types/            # Custom TypeScript types and module declarations
index.ts            # App entry point (Express, Socket.IO, Redis, Swagger)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

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
# REDIS_URL=redis://default:your_redis_password@127.0.0.1:6379 (if using ioredis)
```

---

## Features
- JWT authentication (register/login)
- Contacts and friend request workflow (send, accept, reject, list)
- Real-time messaging and call signaling (Socket.IO)
- Typing indicators and message read receipts (real-time)
- Multi-device support (multiple socket connections per user)
- Robust validation and error handling
- Rate limiting (global and per-route)
- Swagger/OpenAPI documentation
- Redis support for scaling and caching (user status, message metadata)
- Extensible for advanced features: 2FA, granular security, and more

---

## API Endpoints

### Auth
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and receive JWT

### Contacts & Friend Requests
- `POST /api/contacts/request` – Send a friend request
- `POST /api/contacts/accept` – Accept a friend request
- `POST /api/contacts/reject` – Reject a friend request
- `GET  /api/contacts/requests` – List pending (received) and sent friend requests
- `GET  /api/contacts/profile` – Get full user profile (contacts, friendRequests, sentRequests)

### Chats
- `GET /api/chats` – Get all contacts for the authenticated user, with latest message

### Messages
- `GET /api/messages` – Get messages between two users (paginated)
- `POST /api/messages` – Send a message

### Calls
- `GET /api/calls` – Get call history for the authenticated user

---

## Socket.IO Events

| Event Name               | Direction      | Payload Example / Description                                 |
|--------------------------|---------------|--------------------------------------------------------------|
| private-message          | client/server | `{ senderId, receiverId, content }`                          |
| message-seen             | client/server | `{ messageId, userId }`                                      |
| message_read             | client/server | `{ messageId }` (real-time read receipts)                    |
| typing                   | client/server | `{ receiverId }` (client) / `{ senderId }` (server)          |
| stop_typing              | client/server | `{ receiverId }` (client) / `{ senderId }` (server)          |
| user-online              | server        | `{ userId }`                                                 |
| user-offline             | server        | `{ userId }`                                                 |
| call-user                | client/server | `{ callerId, calleeId, signal }`                             |
| answer-call              | client/server | `{ callId, callerId, calleeId, signal }`                     |
| ice-candidate            | client/server | `{ callerId, calleeId, signal }`                             |
| end-call                 | client/server | `{ callId, status, userId, peerId }`                         |
| operation-error          | server        | `{ message, code }`                                          |
| friend_request_received  | server        | `{ senderId, createdAt }`                                    |
| friend_request_accepted  | server        | `{ accepterId }`                                             |
| friend_request_rejected  | server        | `{ rejecterId }`                                             |

---

## Validation
- All input is validated using express-validator and custom helpers.
- Validation errors return HTTP 400 with details.

---

## Error Handling
- All errors are handled by a global error middleware.
- Custom `AppError` class for business logic errors.
- Mongoose, JWT, and validation errors are handled with clear messages.

---

## Security & Best Practices
- Passwords are hashed (argon2).
- Password field is excluded from all API responses.
- JWT secret is required and should be managed securely.
- Rate limiting is enabled globally and can be customized per route.
- CORS is restricted via environment variable.
- Helmet is used for HTTP security headers.
- All environment variables are checked at startup.
- Redis is used for user status and message metadata caching (if enabled).
- All endpoints and events are documented in Swagger/OpenAPI YAML.

---

## Testing
- Jest is used for integration and edge-case tests.
- Tests cover authentication, messaging, calls, and user service edge cases.

---

## Documentation
- Swagger UI is available at `/api/docs` when the server is running.
- All endpoints, request/response schemas, and error formats are documented in OpenAPI YAML files in `src/swagger/`.
- README and Swagger are kept up to date as features are added.

---

## How to Run

1. Install dependencies:
   ```zsh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values.
3. Start the server:
   ```zsh
   npm run dev
   ```
   or for production:
   ```zsh
   npm run prod
   ```
4. Run tests:
   ```zsh
   npm test
   ```

---

## Friend Request Workflow

1. User sends a friend request (`/api/contacts/request`).
2. Target user sees the request in `/api/contacts/requests` and receives a real-time notification.
3. Target user can accept (`/api/contacts/accept`) or reject (`/api/contacts/reject`) the request (with real-time notification to sender).
4. On acceptance, both users become contacts and can chat/call.

---

## Advanced Features & Roadmap
- **Two-Factor Authentication (2FA):** Planned endpoints and logic for enhanced account security.
- **Redis Caching:** For user online status, message metadata, and scaling Socket.IO.
- **Granular Rate Limiting:** Per-route and per-user/IP rate limiting for security and performance.
- **Extensibility:** Modular architecture for easy addition of new features (e.g., group chat, media, 2FA, etc.).
- **Security Reviews:** Ongoing improvements to validation, authentication, and authorization.
- **Performance:** Indexed queries, Redis caching, and scalable Socket.IO setup.

---

## Production Notes
- Set `NODE_ENV=production` and configure `ALLOWED_ORIGINS`.
- Use HTTPS and a process manager (e.g., PM2) in production.
- Store secrets securely (see `.env.example`).
- Monitor logs and errors (Winston logger is included).

---

## License
MIT
