# Employee Management System

A full-stack employee directory with role-based administration, employee self-service, JWT authentication, and MySQL persistence.

## Stack

- Java 21, Spring Boot 3, Spring Data JPA, Spring Security, Maven
- React, Vite, React Router, Axios, Bootstrap
- MySQL 8+

## Run locally

1. Create a MySQL database and user (or use the supplied local defaults):

   ```sql
   CREATE DATABASE employee_management;
   ```

2. Configure the backend environment variables if needed. The defaults in `backend/src/main/resources/application.yml` connect to `localhost:3306/employee_management` as `root` with an empty password. Set `JWT_SECRET` to a private, random value of at least 32 characters before exposing the application beyond local development.
3. Start the backend from `backend`:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   On first startup, the application creates the configured admin account and two sample departments. Override `ADMIN_EMAIL` and `ADMIN_PASSWORD` before first startup to choose admin credentials; the default local-only credentials are `admin@company.com` / `Admin@123`.
4. In a second terminal, start the frontend from `frontend`:

   ```powershell
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend proxies `/api` requests to `http://localhost:8080`.

## Features

- Admin sign-in, employee create/edit/deactivate/delete, searchable employee directory, and department management.
- Employee sign-in, profile view/edit, and password change.
- JWT bearer authentication, BCrypt password hashing, role-based API authorization, request validation, and duplicate-email handling.

Admin-created employees are assigned a department and a temporary password. Share that password securely with the employee; password rotation is available from the employee profile.

## API overview

- `POST /api/auth/login`
- `GET /api/employees`, `POST /api/employees`, `GET|PUT|DELETE /api/employees/{id}`
- `GET|PUT /api/employees/me`, `PUT /api/employees/me/password`
- `GET|POST /api/departments`, `PUT|DELETE /api/departments/{id}`

The admin can also deactivate an account with `PUT /api/employees/{id}/status`. APIs require the `Authorization: Bearer <token>` header except for sign-in and health checks.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/employee_management?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC` | MySQL JDBC URL |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | empty | MySQL password |
| `JWT_SECRET` | local-development key in config | HMAC signing key (minimum 32 characters) |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime in milliseconds |
| `ADMIN_EMAIL` | `admin@company.com` | First-run administrator email |
| `ADMIN_PASSWORD` | `Admin@123` | First-run administrator password |
| `APP_CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Allowed browser origin |

For production, provide all secrets through a secret manager/environment, use HTTPS, and set appropriately restrictive CORS origins.
