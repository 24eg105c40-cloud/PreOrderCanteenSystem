<<<<<<< HEAD
# Pre-Order Canteen System — Full Stack Java Project

## Technology
- Frontend: React + Vite
- Backend: Java 21, Spring Boot, Spring Data JPA, Maven
- Database: H2 for quick local testing; MySQL profile included

## 1. Run the backend
Install Java 21 and Maven, then open a terminal in `backend`:

```bash
mvn spring-boot:run
```

Backend: http://localhost:8080  
API health: http://localhost:8080/api/health  
Food menu: http://localhost:8080/api/foods

The default H2 database is in-memory, so it resets when the backend restarts.

## 2. Run the frontend
Install Node.js (LTS), then open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## 3. Use MySQL instead of H2
Create a database in MySQL:

```sql
CREATE DATABASE canteen_db;
```

Set environment variables before starting Spring Boot:

Windows PowerShell:
```powershell
$env:SPRING_PROFILES_ACTIVE="mysql"
$env:DB_URL="jdbc:mysql://localhost:3306/canteen_db"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
mvn spring-boot:run
```

Git Bash:
```bash
export SPRING_PROFILES_ACTIVE=mysql
export DB_URL=jdbc:mysql://localhost:3306/canteen_db
export DB_USERNAME=root
export DB_PASSWORD='your_mysql_password'
mvn spring-boot:run
```

## Features
- Browse available food items
- Add food items to the menu (demo admin form)
- Place pre-orders with customer name, pickup time, and quantity
- View orders and update order status
- Delete food items
- REST API with validation and CORS enabled for local Vite

## API endpoints
- `GET /api/health`
- `GET /api/foods`
- `GET /api/foods/{id}`
- `POST /api/foods`
- `PUT /api/foods/{id}`
- `DELETE /api/foods/{id}`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PUT /api/orders/{id}/status`

This is a student-project starter. Before real deployment, add secure authentication/authorization, payment integration if required, and production database credentials via environment variables.
=======
# PreOrderCanteenSystem
>>>>>>> b7a0238badebeb3166cda0d71e320c2108941cac
