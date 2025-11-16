# Backend

## Running locally with Docker Compose

1. From the `backend/` directory start the API and MySQL database:
	 ```bash
	 docker compose up --build
	 ```
2. The API listens on `http://localhost:8080`.
3. MySQL 8.4 is available on port `3306` with the credentials configured in `compose.yaml` (`MYSQL_USER=goapp`, `MYSQL_PASSWORD=goapp`, database `disabled_go`).

## Useful commands

- Connect to the running API container shell:
	```bash
	docker compose exec server /bin/sh
	```
- Connect to MySQL using the CLI:
	```bash
	docker compose exec mysql mysql -ugoapp -pgoapp disabled_go
	```
