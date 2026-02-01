# Transport Management System

A comprehensive Transport Management Module for School Management Systems built with React, Node.js, Express, and PostgreSQL.

## Features

- **Routes Management**: Create and manage transport routes with start/end points
- **Vehicles Management**: Track vehicles, drivers, helpers, and maintenance schedules
- **Pickup Points**: Configure pickup/drop locations with GPS coordinates
- **Fee Structure**: Define transport fees per route and academic year
- **Route Configuration**: Assign pickup points to routes with stop ordering
- **Vehicle Assignment**: Assign vehicles to routes with shift management
- **Student Transport**: Assign students to routes with automatic fee generation

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, React Hook Form, Zod
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker, Docker Compose

---

## Quick Start with Docker (One Command)

**যে কেউ repo clone করে শুধু নিচের কমান্ড দিলেই project run করতে পারবে।** Migrations ও seed অটোমেটিক চলে।

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Run the Project

```bash
git clone <repository-url>
cd Transport-Management-System
docker-compose up -d
```

প্রথমবার একটু সময় লাগতে পারে (build + DB migration + seed)। লগ দেখতে: `docker-compose logs -f`

`.env` ফাইল দরকার নেই — Docker Compose এ default values আছে। চাইলে `cp .env.example .env` দিয়ে কাস্টম করতে পারবেন।

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application |
| **Backend API** | http://localhost:5000/api | REST API |
| **API Health** | http://localhost:5000/api/health | Health check endpoint |

**Login (after first run):** `admin@admin.com` / `admin123` (seed data)

### Connect to Database (DBeaver/pgAdmin)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `transport_management` |
| Username | `tms_user` |
| Password | `tms_password` |

### Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v
```

---

## Local Development (Without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## API Endpoints

### Transport Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/routes` | List all routes |
| POST | `/api/transport/routes` | Create route |
| GET | `/api/transport/routes/:id` | Get route by ID |
| PUT | `/api/transport/routes/:id` | Update route |
| DELETE | `/api/transport/routes/:id` | Delete route |

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/vehicles` | List all vehicles |
| POST | `/api/transport/vehicles` | Create vehicle |
| GET | `/api/transport/vehicles/:id` | Get vehicle by ID |
| PUT | `/api/transport/vehicles/:id` | Update vehicle |
| DELETE | `/api/transport/vehicles/:id` | Delete vehicle |

### Pickup Points

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/pickup-points` | List all pickup points |
| POST | `/api/transport/pickup-points` | Create pickup point |
| PUT | `/api/transport/pickup-points/:id` | Update pickup point |
| DELETE | `/api/transport/pickup-points/:id` | Delete pickup point |

### Fee Master

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/fee-master` | List fee structures |
| POST | `/api/transport/fee-master` | Create fee structure |
| PUT | `/api/transport/fee-master/:id` | Update fee structure |
| DELETE | `/api/transport/fee-master/:id` | Delete fee structure |

### Route Pickup Points

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transport/route-pickup-points` | Add pickup to route |
| GET | `/api/transport/route-pickup-points/route/:routeId` | Get route's pickup points |
| PUT | `/api/transport/route-pickup-points/:id` | Update mapping |
| DELETE | `/api/transport/route-pickup-points/:id` | Remove mapping |

### Vehicle Assignment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/route-vehicles` | List assignments |
| POST | `/api/transport/route-vehicles` | Assign vehicle to route |
| PUT | `/api/transport/route-vehicles/:id/deactivate` | Deactivate assignment |

### Student Transport

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transport/student-transport` | List student assignments |
| POST | `/api/transport/student-transport/assign` | Assign student (auto-generates fee) |
| PUT | `/api/transport/student-transport/:id` | Update assignment |
| PUT | `/api/transport/student-transport/:id/deactivate` | Deactivate assignment |
| GET | `/api/transport/students/search?q=` | Search students |

---

## Core Business Logic

### Automatic Fee Generation

When a student is assigned to a transport route:

1. System validates student, route, and pickup point
2. Retrieves fee structure from `TransportFeeMaster`
3. Creates `StudentTransportAssignment` record
4. Automatically generates `StudentFeeAssignment` for current month
5. All operations are wrapped in a database transaction (atomic)

If any step fails, the entire operation is rolled back.

---

## Project Structure

```
Transport-Management-System/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middlewares/       # Express middlewares
│   │   ├── modules/
│   │   │   └── transport/
│   │   │       ├── controllers/   # Request handlers
│   │   │       ├── services/      # Business logic
│   │   │       └── routes/        # API routes
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility classes
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities and constants
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `tms_user` |
| `POSTGRES_PASSWORD` | Database password | `tms_password` |
| `POSTGRES_DB` | Database name | `transport_management` |
| `POSTGRES_PORT` | Database port | `5432` |
| `BACKEND_PORT` | Backend API port | `5000` |
| `FRONTEND_PORT` | Frontend port | `3000` |
| `JWT_SECRET` | JWT signing secret | - |
| `CURRENT_ACADEMIC_YEAR` | Current academic year | `2024-2025` |

---

## Development Commands

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access container shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev

# Rebuild after code changes
docker-compose up -d --build
```

### Backend Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Frontend Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

---

## License

MIT
