package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/JAJID-Project-TU-REQ/back-disabled-go/config"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/models"
)

type LoginRequest struct {
	NationalID string `json:"nationalId" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Role          string   `json:"role" binding:"required"`
	FirstName     string   `json:"firstName" binding:"required"`
	LastName      string   `json:"lastName" binding:"required"`
	NationalID    string   `json:"nationalId" binding:"required"`
	Phone         string   `json:"phone" binding:"required"`
	Email         *string  `json:"email"`
	Password      string   `json:"password" binding:"required"`
	Skills        []string `json:"skills"`
	Biography     string   `json:"biography"`
	DisabilityType *string `json:"disabilityType"`
	AdditionalNeeds []string `json:"additionalNeeds"`
}

// Login handles user login
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Find user by national ID
	var user models.User
	query := `SELECT id, role, first_name, last_name, national_id, phone, email, password, 
		skills, biography, disability_type, additional_needs, rating, completed_jobs, created_at 
		FROM users WHERE national_id = ?`
	
	err := config.DB.QueryRow(query, req.NationalID).Scan(
		&user.ID, &user.Role, &user.FirstName, &user.LastName, &user.NationalID, &user.Phone,
		&user.Email, &user.Password, &user.Skills, &user.Biography, &user.DisabilityType,
		&user.AdditionalNeeds, &user.Rating, &user.CompletedJobs, &user.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token (simple implementation - in production use JWT)
	token := uuid.New().String()

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user.ToUserProfile(),
	})
}

// Register handles user registration
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check if national ID already exists
	var count int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE national_id = ?", req.NationalID).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Convert arrays to JSON strings
	skillsJSON := models.ToJSONArray(req.Skills)
	additionalNeedsJSON := models.ToJSONArray(req.AdditionalNeeds)

	// Create user
	userID := uuid.New().String()
	query := `INSERT INTO users (id, role, first_name, last_name, national_id, phone, email, password, 
		skills, biography, disability_type, additional_needs, rating, completed_jobs) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = config.DB.Exec(query, userID, req.Role, req.FirstName, req.LastName, req.NationalID,
		req.Phone, req.Email, string(hashedPassword), skillsJSON, req.Biography, req.DisabilityType,
		additionalNeedsJSON, 0, 0)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Fetch created user
	var user models.User
	fetchQuery := `SELECT id, role, first_name, last_name, national_id, phone, email, password, 
		skills, biography, disability_type, additional_needs, rating, completed_jobs, created_at 
		FROM users WHERE id = ?`
	
	err = config.DB.QueryRow(fetchQuery, userID).Scan(
		&user.ID, &user.Role, &user.FirstName, &user.LastName, &user.NationalID, &user.Phone,
		&user.Email, &user.Password, &user.Skills, &user.Biography, &user.DisabilityType,
		&user.AdditionalNeeds, &user.Rating, &user.CompletedJobs, &user.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	c.JSON(http.StatusCreated, user.ToUserProfile())
}

