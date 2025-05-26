# University Group Task Management System

A comprehensive task management platform designed for **university students** working in collaborative groups. Built with **Spring Boot (Java 21)** backend, **React 19** frontend, and **PostgreSQL** database, featuring real-time discussions, audit logging, and performance monitoring.

## Tech Stack

- **Backend**: Spring Boot 3.4.5 (Java 21) with REST API
- **Frontend**: React 19.1.0 with Material-UI 5
- **Database**: PostgreSQL 15

---

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (20.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)
- [Git](https://git-scm.com/)

### Clone & Run

```bash
# Clone the repository
git clone https://github.com/SarunasJJ/TaskManagementSystem.git
cd university-task-management

# Start all services with Docker Compose
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:3000` | React application (Main interface) |
| **Backend API** | `http://localhost:8080` | Spring Boot REST API |
| **Database** | `localhost:5432` | PostgreSQL (internal access) |

---

## Configuration

### Default Credentials & Ports

```env
# Database Configuration
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_PORT=5432

# Application Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Audit System (Configurable without code changes)
APP_AUDIT_ENABLED=true
APP_AUDIT_LOG_TO_DB=true
APP_AUDIT_LOG_TO_FILE=true
```
