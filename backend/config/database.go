package config

import (
	"database/sql"
	"fmt"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

// InitDB initializes the database connection
func InitDB() error {
	// Try to get password from environment variable first, then from file
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		// Try multiple paths for password file
		paths := []string{"db/password.txt", "/app/db/password.txt", "./db/password.txt"}
		var err error
		var passwordBytes []byte
		for _, path := range paths {
			passwordBytes, err = os.ReadFile(path)
			if err == nil {
				password = string(passwordBytes)
				password = strings.TrimSpace(password)
				break
			}
		}
		if password == "" {
			return fmt.Errorf("failed to read database password from file or environment: %w", err)
		}
	}

	// Determine database host (db for Docker, localhost for local development)
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "db" // Default to Docker service name
	}

	// Database connection string
	// Format: user:password@tcp(host:port)/database?charset=utf8mb4&parseTime=True&loc=Local
	dsn := fmt.Sprintf("app_user:%s@tcp(%s:3306)/disabled_go?charset=utf8mb4&parseTime=True&loc=Local",
		password, dbHost)

	// Open database connection
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	DB = db
	return nil
}

// CloseDB closes the database connection
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
