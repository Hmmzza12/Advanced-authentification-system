Advanced Authentication System

A production-ready authentication system built as a final education project (Projet de Fin d'Études). Features a Spring Boot 3 backend, a React + TypeScript frontend, JWT stateless sessions, OAuth2 social login, and TOTP-based two-factor authentication.

## Features

- **JWT auth** — stateless access + refresh token flow
- **Social login (OAuth2)** — Google, GitHub, and Facebook
- **Two-factor authentication (2FA)** — TOTP via any authenticator app (Google Authenticator, Authy, etc.) with QR code generation
- **Password reset** — complete "forgot password" flow with time-limited, single-use tokens
- **Account linking** — connect multiple social providers to one email identity
- **Rate limiting** — Bucket4j-based protection against brute-force and DDoS attacks
- **BCrypt hashing** — strength 12 password encryption
- **Premium UI** — glassmorphism design with Tailwind CSS, Framer Motion animations, and Lucide icons

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Java 17 |
| Frontend | React, Vite, TypeScript |
| Database | SQLite (auto-generated) |
| Auth | JWT, Spring Security, OAuth2 |
| Rate limiting | Bucket4j |
| Styling | Tailwind CSS, Framer Motion |

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- OAuth2 credentials for Google, GitHub, and/or Facebook

### 1. Configure environment variables

```bash
# Backend
export JWT_SECRET=your_64_character_hex_string
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
export GITHUB_CLIENT_ID=...
export GITHUB_CLIENT_SECRET=...
export FACEBOOK_CLIENT_ID=...
export FACEBOOK_CLIENT_SECRET=...
```

### 2. Start the backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`. The SQLite database (`auth-db.sqlite`) is auto-created on first run.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Production Checklist

- [x] Social provider account linking
- [ ] Replace the password reset logger with a real email service (JavaMailSender / SendGrid)
- [ ] Enforce HTTPS/TLS on both tiers
- [ ] Swap SQLite for PostgreSQL or MySQL for concurrent workloads
- [ ] Restrict CORS in `WebConfig.java` to production domains only

## License

MIT
