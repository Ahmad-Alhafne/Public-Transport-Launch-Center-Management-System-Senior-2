# Departure Center System

A microservices-based departure center system built using:

- **.NET 8** microservices (API Gateway + AuthService + TripService + BookingService + ComplaintService + NotificationService + etc.)
- **React + Vite** frontend
- **SQL Server** (via EF Core)
- **Docker Compose** for local full-stack orchestration

---

##  Project Structure

- `backend/` - All backend services (each service is a separate solution and contains API/Application/Domain/Infrastructure layers)
  - `ApiGateway/` - Aggregates data across services for admin dashboards
  - `AuthService/` - Authentication + user/driver management
  - `TripService/` - Trip management, driver profiles, driver change requests
  - `BookingService/` - Bookings and seat management
  - `ComplaintService/` - Complaint management + notification integration
  - `NotificationService/` - New service for storing / delivering notifications
  - `RouteService/` - Routes and scheduling

- `frontend/` - React application using Tailwind, React Router, and context-based auth + notifications

---

##  Getting Started (Local Development)

> These instructions assume you have Docker + Docker Compose installed, and either .NET 8 SDK and Node.js installed for local development.

### 1) Clone the repository

```bash
git clone <repo-url> "DepartureCenterSystem"
cd "DepartureCenterSystem - Copy"
```

### 2) Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3) Configure Environment

Most services use `appsettings.json` and `docker-compose.yml` defaults. The default configuration expects SQL Server to run in Docker.

If you need to customize settings (connection strings, ports, etc.), edit:

- `backend/*/appsettings.json`
- `docker-compose.yml`

### 4) Run the Full System (Docker Compose)

From the project root:

```bash
docker compose up --build
```

This will build and start all services, including:

- AuthService
- TripService
- BookingService
- ComplaintService
- NotificationService
- RouteService
- API Gateway
- SQL Server (if configured)

Once up, you can access the frontend at:

```
http://localhost:3000
```

---

##  Running Services Individually (Optional)

If you want to run a single backend service without Docker:

1. Open the service folder (e.g. `backend/AuthService/AuthService.Api`) in your IDE.
2. Restore and run with `dotnet`:

```bash
dotnet restore
dotnet run
```

> Ensure its configured ports do not conflict with any running Docker containers.

---

##  Frontend Development

From `frontend/`:

```bash
npm run dev
```

This starts the Vite dev server at `http://localhost:5173` (default). It will proxy API requests to the gateway via your `vite.config.js` settings.

---

##  Notes / Tips

- If you encounter authentication issues, verify your local clock is correct (JWT tokens use a 5-minute `ClockSkew`).
- If you change API ports, update `frontend/src/config.js` and `docker-compose.yml` accordingly.

---

##  Quick Checklist

- [ ] `docker compose up --build` (start full stack)
- [ ] Visit `http://localhost:3000` (frontend)
- [ ] Log in as an admin/driver/citizen
- [ ] Use notification bell + notifications page to see new alerts

---
