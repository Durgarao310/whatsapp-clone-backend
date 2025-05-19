# Frontend API Documentation for Real-Time Chat Backend

## Overview
This document provides frontend developers with all necessary information to integrate with the real-time chat backend. It covers REST API endpoints, authentication, and real-time communication via Socket.IO.

---

## Authentication

### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `201 Created` with user info and JWT token

### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK` with user info and JWT token

### Auth Headers
- For protected endpoints, include:
  - `Authorization: Bearer <JWT_TOKEN>`

---

## User Endpoints

### Get Current User
- **Endpoint:** `GET /api/users/me`
- **Headers:** Auth required
- **Response:** User profile

### Search Users
- **Endpoint:** `GET /api/users?search=<query>`
- **Headers:** Auth required
- **Response:** List of users

---

## Chat Endpoints

### Get User Chats
- **Endpoint:** `GET /api/chats`
- **Headers:** Auth required
- **Response:** List of chat objects

### Create Chat
- **Endpoint:** `POST /api/chats`
- **Body:**
  ```json
  {
    "userId": "string"
  }
  ```
- **Response:** Chat object

---

## Message Endpoints

### Get Messages in Chat
- **Endpoint:** `GET /api/messages?chatId=<chatId>`
- **Headers:** Auth required
- **Response:** List of messages

### Send Message
- **Endpoint:** `POST /api/messages`
- **Body:**
  ```json
  {
    "chatId": "string",
    "content": "string"
  }
  ```
- **Response:** Message object

---

## Contact Endpoints

### Get Contacts
- **Endpoint:** `GET /api/contacts`
- **Headers:** Auth required
- **Response:** List of contacts

### Send Friend Request
- **Endpoint:** `POST /api/contacts/request`
- **Body:**
  ```json
  {
    "userId": "string"
  }
  ```
- **Response:** Friend request object

---

## Call Endpoints

### Get Call History
- **Endpoint:** `GET /api/calls`
- **Headers:** Auth required
- **Response:** List of calls

### Start Call
- **Endpoint:** `POST /api/calls/start`
- **Body:**
  ```json
  {
    "userId": "string"
  }
  ```
- **Response:** Call object

---

## Real-Time Communication (Socket.IO)

Socket.IO enables real-time, bidirectional communication between the frontend and backend for chat, user status, and call features.

### Connecting
- Use the Socket.IO client to connect to the backend server.
- The socket URL should be your backend's base URL (e.g., `http://localhost:5000` for local development, or your production domain).
- It is recommended to store the URL in an environment variable (e.g., `REACT_APP_SOCKET_URL`).
- Pass the JWT token for authentication (recommended via `auth` option):

```js
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  auth: { token: 'JWT_TOKEN' }
});
```

---

### Client-to-Server Events

| Event Name         | Payload Example                          | Description                       |
|--------------------|------------------------------------------|-----------------------------------|
| `message:send`     | `{ chatId: string, content: string }`    | Send a new message                |
| `chat:create`      | `{ userId: string }`                     | Create a new chat                 |
| `call:start`       | `{ userId: string }`                     | Initiate a call                   |
| `call:end`         | `{ callId: string }`                     | End an ongoing call               |
| `user:typing`      | `{ chatId: string, isTyping: boolean }`  | Indicate typing status            |

---

### Server-to-Client Events

| Event Name         | Payload Example                          | Description                       |
|--------------------|------------------------------------------|-----------------------------------|
| `message:new`      | `{ message: { ... } }`                   | Receive a new message             |
| `chat:created`     | `{ chat: { ... } }`                      | Notified of a new chat            |
| `user:online`      | `{ userId: string }`                     | User came online                  |
| `user:offline`     | `{ userId: string }`                     | User went offline                 |
| `user:typing`      | `{ chatId: string, userId: string, isTyping: boolean }` | Typing indicator update |
| `call:incoming`    | `{ call: { ... } }`                      | Incoming call event               |
| `call:ended`       | `{ callId: string }`                     | Call ended event                  |

---

### Example Usage

```js
// Sending a message
socket.emit('message:send', { chatId: 'abc123', content: 'Hello!' });

// Listening for new messages
socket.on('message:new', (data) => {
  console.log('New message:', data.message);
});

// Typing indicator
socket.emit('user:typing', { chatId: 'abc123', isTyping: true });
socket.on('user:typing', (data) => {
  // data: { chatId, userId, isTyping }
});

// Starting a call
socket.emit('call:start', { userId: 'user456' });
socket.on('call:incoming', (data) => {
  // data.call
});
```

---

### Error Handling
- Socket.IO errors are sent as `error` events with a message payload.
- Example:
```js
socket.on('error', (err) => {
  alert(err.message);
});
```

---

## Error Handling
- All errors return JSON with `message` and `status` fields.

---

## Swagger/OpenAPI
- Full API schemas are available in the `src/swagger/` folder for detailed request/response formats.

---

## Contact
For further questions, contact the backend team or refer to the `README.md`.

---

# Frontend Integration Guide

This section provides a step-by-step guide for frontend developers to integrate with the real-time chat backend using REST APIs and Socket.IO.

## 1. Project Setup
- Use any modern frontend framework (React, Vue, Angular, etc.)
- Install dependencies:
  - For HTTP requests: `axios` or `fetch`
  - For real-time: `socket.io-client`

```bash
npm install axios socket.io-client
```

## 2. Authentication Flow
- Register or login using the REST API to obtain a JWT token.
- Store the JWT token securely (e.g., in memory, HTTP-only cookie, or localStorage).
- Attach the token to all protected API requests:

```js
axios.get('/api/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 3. Connecting to Socket.IO
- Use the JWT token for authentication when connecting:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:PORT', {
  auth: { token }
});
```

## 4. Making API Calls
- Use the documented endpoints for users, chats, messages, contacts, and calls.
- Example: Fetching chats

```js
axios.get('/api/chats', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 5. Real-Time Messaging
- Emit and listen for events as documented in the Socket.IO section.
- Example: Send and receive messages

```js
// Send message
socket.emit('message:send', { chatId, content });

// Listen for new messages
socket.on('message:new', (data) => {
  // Update UI with data.message
});
```

## 6. Typing Indicators
- Emit `user:typing` when the user is typing.
- Listen for `user:typing` to show typing status in the UI.

## 7. Calls
- Start a call with `call:start` and handle incoming calls with `call:incoming`.

## 8. Error Handling
- Handle REST API errors using try/catch or `.catch()`.
- Listen for Socket.IO `error` events.

## 9. Best Practices
- Always validate user input before sending to the backend.
- Handle token expiration (refresh or redirect to login).
- Use environment variables for API URLs.
- Clean up socket listeners on component unmount (in React, use `useEffect` cleanup).

---

For more details, refer to the API documentation above and the Swagger/OpenAPI specs in `src/swagger/`.
