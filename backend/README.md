# Backend
1. clone the repo 
```bash
git clone https://github.com/JAJID-Project-TU-REQ/back-disabled-go.git
```
2. go to the backend directory
```bash
cd back-disabled-go
```
3. run docker compose
```bash
docker compose up -d
```
4. The server will be running on port 3000

# Use terminal server
You can use the terminal to run commands inside the container. To access the terminal, run the following command:
```bash
docker exec -it backend-server-1 /bin/bash
```
# Use terminal database
You can use psql to connect to the database. To access psql, run the following command:
```bash
docker exec -it backend-db-1 psql -U postgres /bin/bash
```
