package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/JAJID-Project-TU-REQ/back-disabled-go/config"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/migrations"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/routes"
)

func main() {
	// Initialize database
	if err := config.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer config.CloseDB()

	// Run migrations
	if err := migrations.RunMigrations(config.DB); err != nil {
		log.Printf("Warning: Migration failed: %v", err)
		// Continue anyway - tables might already exist
	}

	// Create Gin router
	r := gin.Default()

	// Setup CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // In production, specify actual origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Setup API routes
	routes.SetupRoutes(r)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // Default port for Docker
	}

	// Start server
	fmt.Printf("Server starting on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
