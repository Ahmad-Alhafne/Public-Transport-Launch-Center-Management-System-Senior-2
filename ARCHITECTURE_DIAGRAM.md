# DepartureCenterSystem: Microservices Architecture Diagram

## Overview
This diagram explains the system architecture for the public transportation management platform.

- Roles: Admin, Driver, Citizen
- Frontend: React (Vite)
- Backend: .NET Microservices
- API communication: REST
- Database: SQL Server (one per microservice, optionally shared as needed)
- Containerization: Docker
- Auth: AuthService (JWT)
- API Gateway: Ocelot

## Mermaid Architecture Diagram

```mermaid
flowchart LR
    subgraph Presentation Layer
      U["User (Admin/Driver/Citizen)"]
      F["React Frontend (Admin/Driver/Citizen dashboards)"]
    end

    subgraph Gateway Layer
      G["API Gateway (Ocelot)"]
    end

    subgraph Microservices Layer
      A["AuthService"]
      T["TripService"]
      R["RouteService"]
      C["ComplaintService"]
      Fav["FavoriteService"]
    end

    subgraph Database Layer
      DB_A["Auth DB (SQL Server)"]
      DB_T["Trip DB (SQL Server)"]
      DB_R["Route DB (SQL Server)"]
      DB_C["Complaint DB (SQL Server)"]
      DB_F["Favorite DB (SQL Server)"]
    end

    U -->|uses| F
    F -->|REST calls| G

    G -->|Auth calls| A
    G -->|Trip API calls| T
    G -->|Route API calls| R
    G -->|Complaint API calls| C
    G -->|Favorite API calls| Fav

    A -->|user/auth queries| DB_A
    T -->|trip data queries| DB_T
    R -->|route data queries| DB_R
    C -->|complaint data queries| DB_C
    Fav -->|favorite trip queries| DB_F

    style Presentation Layer fill:#f0f9ff,stroke:#0284c7,stroke-width:2px
    style Gateway Layer fill:#ecfccb,stroke:#65a30d,stroke-width:2px
    style Microservices Layer fill:#ecfdf5,stroke:#059669,stroke-width:2px
    style Database Layer fill:#fff7ed,stroke:#ea580c,stroke-width:2px
```

## Data Flow Explanation

1. User action (Admin/Driver/Citizen) occurs in the React frontend.
2. Frontend makes REST API calls to API Gateway (Ocelot).
3. API Gateway routes each request to the appropriate microservice:
   - AuthService for login/registration/JWT issuance.
   - TripService for trip scheduling, status, and booking.
   - RouteService for route management and stop data.
   - ComplaintService for complaint submission and status updates.
   - FavoriteService for managing saved favorite trips.
4. Each microservice reads from/writes to its own SQL Server database.
5. AuthService responses include JWT tokens for protected routes.
6. Frontend stores token in secure storage and sends it with subsequent requests.
7. The gateway verifies token through AuthService (or local validation) before forwarding.

## Notes

- The architecture follows strict separation by layer: Presentation, Gateway, Microservices, Data.
- Communication is primarily REST-based; internal microservices can be extended with async messaging if needed.
- Each microservice can be deployed in Docker containers and orchestrated using Docker Compose or Kubernetes.
