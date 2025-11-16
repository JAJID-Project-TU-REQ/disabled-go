package migrations

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// RunMigrations executes all SQL migration files
func RunMigrations(db *sql.DB) error {
	// Read and execute migration files in order
	migrationFiles := []string{
		"001_initial_schema.sql",
	}

	for _, filename := range migrationFiles {
		// Try multiple paths (for different execution contexts)
		var sqlBytes []byte
		var err error
		paths := []string{
			filepath.Join("migrations", filename),
			filepath.Join("backend", "migrations", filename),
			filename,
		}
		
		for _, path := range paths {
			sqlBytes, err = os.ReadFile(path)
			if err == nil {
				break
			}
		}
		
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		// Split SQL statements by semicolon and execute them one by one
		sqlStatements := strings.Split(string(sqlBytes), ";")
		for _, stmt := range sqlStatements {
			stmt = strings.TrimSpace(stmt)
			// Skip empty statements and comments
			if stmt == "" || strings.HasPrefix(stmt, "--") {
				continue
			}
			if _, err := db.Exec(stmt); err != nil {
				return fmt.Errorf("failed to execute migration %s: %w\nStatement: %s", filename, err, stmt)
			}
		}

		fmt.Printf("Migration %s executed successfully\n", filename)
	}

	return nil
}

