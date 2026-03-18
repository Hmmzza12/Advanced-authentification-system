# Advanced Authentication System (2FA + Social Login)

A production-ready authentication system featuring a Spring Boot 3 backend, a React + Vite (TypeScript) frontend, and a secure SQLite data store. This project implements modern security standards including OAuth2, JWT stateless sessions, and 2FA.

## ✨ Features
- **Stateless JWT Sessions**: Access + Refresh Token mechanism for secure, scalable authentication.
- **Social Login (OAuth2)**: Seamless "Login with Google", "Facebook", and "GitHub" support.
- **Two-Factor Authentication (2FA)**: TOTP via Authenticator Apps (Google Authenticator, etc.) with real-time QR code generation.
- **Password Reset Flow**: Complete "Forgot Password" functionality with token-based email resets (Simulated via logs).
- **Secure Architecture**: 
  - **BCrypt (Strength 12)** password hashing.
  - **Rate Limiting** via Bucket4j to prevent brute-force and DDoS.
  - **Account Linking**: Connect multiple social providers to a single email identity.
- **Premium UI/UX**: Responsive Glassmorphism design system using Tailwind CSS, Framer Motion, and Lucide Icons.

## 🚀 Setup Instructions

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+**

### Configuration (Environment Variables)
For security, credentials are in `application.properties` as environment variables. Set these before running:

```bash
# Backend (.env or System Env)
JWT_SECRET=your_64_character_hex_string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

### Backend Setup (Spring Boot)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend starts on `http://localhost:8080`. SQLite database (`auth-db.sqlite`) is auto-generated.*

### Frontend Setup (React + Vite)
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies & Start:
   ```bash
   npm install
   npm run dev
   ```
   *The frontend typically starts on `http://localhost:5173`.*

---

## 🛡️ Security & Production Checklist
- [x] **Social Provider Linking**: Successfully links separate social accounts to one internal user via email.
- [ ] **Email Service**: Replace the `PasswordResetService` logger with a real JavaMailSender / SendGrid implementation.
- [ ] **HTTPS/TLS**: Ensure both tiers are served over HTTPS in production.
- [ ] **Database Migration**: Consider swapping SQLite for PostgreSQL or MySQL for high-concurrency environments.
- [ ] **CORS Settings**: Restrict `WebConfig.java` to specific production domains.

