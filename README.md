# Authentication System with 2FA TOTP

A production-ready authentication system featuring a Spring Boot backend, a React with TypeScript frontend, and a secure SQLite data store.

## Features
- JWT stateless authentication (Access Tokens + Refresh Tokens)
- Real-time password strength validation
- Two-Factor Authentication (TOTP via Authenticator Apps) using generated QR codes
- Rate limiting using Bucket4j to prevent brute-force attacks
- Custom Glassmorphism UI using Tailwind CSS and React Router protected routes
- Password Hashing with BCrypt (strength 12)

## Setup Instructions

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+**

### Backend Setup (Spring Boot)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`. SQLite database (`auth-db.sqlite`) will be auto-generated in the root of the backend folder.*

### Frontend Setup (React + Vite)
1. Open a separate terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on your local Vite port, typically `http://localhost:5173`.*

---

## Security Checklist
Before moving this entirely to production, ensure you review and update the following:
- [ ] **Change JWT Secret**: The `app.jwt.secret` in `application.properties` should be a randomly generated secure string strictly injected via environment variables.
- [ ] **HTTPS/TLS**: Ensure the frontend and backend are served over HTTPS. Configure Spring Security `requiresSecure()` if applicable.
- [ ] **CORS Origins**: Update the `WebConfig.java` CORS mapping to explicitly list your production frontend domains rather than `*` headers.
- [ ] **Email Service**: Implement real SMTP configuration in `EmailService.java` replacing the `Logger` statements.
- [ ] **Rate Limits**: Fine-tune Bucket4j rate limiting configuration mapped directly to your user traffic expectations.
- [ ] **Refresh Token Duration**: Consider tweaking token lifespan depending on your security versus UX requirement threshold.
- [ ] **Database Migration to Postgres/MySQL**: Swap SQLite for a robust production database by updating the JDBC driver and Spring JPA Dialect in `pom.xml` and `application.properties`.
