# Backend Setup

## Prerequisites
- Go 1.25.1 or later
- Docker and Docker Compose

## Installation Steps

### 1. Clone the repository (if not already cloned)
```bash
git clone https://github.com/JAJID-Project-TU-REQ/back-disabled-go.git
cd back-disabled-go
```

### 2. Install Go dependencies (equivalent to npm install)
```bash
cd backend
go mod download
```

### 3. Setup database password
Make sure `db/password.txt` exists with your MySQL password:
```bash
# If file doesn't exist, create it:
echo "your_password_here" > db/password.txt
```

### 4. Run with Docker Compose
```bash
docker compose up -d
```

The server will be running on port 3000

## Development (Without Docker)

If you want to run locally without Docker:

```bash
# Install dependencies
go mod download

# Run the server
go run main.go
```

Server will run on port 8080 (default Gin port)

## Database Connection

- **Host**: `db` (when using Docker) or `localhost` (local development)
- **Port**: `3306`
- **Database**: `disabled_go`
- **User**: `app_user`
- **Password**: Read from `db/password.txt`
- **Root Password**: Same as above

Connection string format:
```
app_user:password@tcp(db:3306)/disabled_go?charset=utf8mb4&parseTime=True&loc=Local
```

## Useful Commands

### Access server container terminal
```bash
docker exec -it backend-server-1 /bin/bash
```

### Access MySQL database
```bash
docker exec -it backend-db-1 mysql -u app_user -p disabled_go
# Enter password from db/password.txt
```

### View logs
```bash
docker compose logs -f server
docker compose logs -f db
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (⚠️ deletes database data)
```bash
docker compose down -v
```
