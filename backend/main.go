package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	db, err := InitDB()
	if err != nil {
		log.Fatalf("failed to connect to MySQL: %v", err)
	}
	defer db.Close()

	userStore = NewUserStore(db)
	if err := userStore.Setup(context.Background()); err != nil {
		log.Fatalf("failed to setup database schema: %v", err)
	}

	jobStore = NewJobStore(db)
	if err := jobStore.Setup(context.Background()); err != nil {
		log.Fatalf("failed to setup jobs schema: %v", err)
	}

	applicationStore = NewJobApplicationStore(db)
	if err := applicationStore.Setup(context.Background()); err != nil {
		log.Fatalf("failed to setup applications schema: %v", err)
	}

	// Create a Gin router with default middleware (logger and recovery)
	r := gin.Default()

	seedDefaultUsers()

	// Define a simple GET endpoint
	r.GET("/ping", func(c *gin.Context) {
		// Return JSON response
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Auth endpoints under /api
	api := r.Group("/api")
	api.POST("/register", Register)
	api.POST("/login", Login)
	api.POST("/jobs", CreateJob)
	api.GET("/jobs", ListJobs)
	api.GET("/jobs/:id", GetJob)
	api.POST("/jobs/:id/applications", ApplyToJob)
	api.GET("/jobs/:id/applications", ListJobApplications)
	api.POST("/applications/:id/accept", AcceptApplication)

	// Also accept root-level routes for convenience (some clients may call /register or /login)
	r.POST("/register", Register)
	r.POST("/login", Login)
	r.POST("/jobs", CreateJob)
	r.GET("/jobs", ListJobs)
	r.GET("/jobs/:id", GetJob)
	r.POST("/jobs/:id/applications", ApplyToJob)
	r.GET("/jobs/:id/applications", ListJobApplications)
	r.POST("/applications/:id/accept", AcceptApplication)

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	r.Run(":8080")
}

// seedDefaultUsers primes the store with a demo volunteer account
// so the mobile client can log in without registering first.
func seedDefaultUsers() {
	const nationalID = "1234567890123"
	user, ok, err := userStore.GetByNationalID(nationalID)
	if err != nil {
		log.Printf("failed to check default user: %v", err)
		return
	}
	if ok && user != nil {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("bcrypt failed for default user: %v", err)
		return
	}

	demo := &User{
		Role:          "volunteer",
		FirstName:     "Somchai",
		LastName:      "Jai Dee",
		NationalID:    nationalID,
		Phone:         "081-234-5678",
		Skills:        []string{"wheelchair_support", "thai_language", "first_aid"},
		Biography:     "Seeded helper account",
		Interests:     []string{},
		Rating:        4.8,
		CompletedJobs: 12,
		PasswordHash:  string(hash),
	}

	if err := userStore.Create(demo); err != nil {
		log.Printf("failed to seed default user: %v", err)
	}
}
