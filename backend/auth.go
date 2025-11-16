package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest matches frontend RegisterPayload
type RegisterRequest struct {
	Role            string   `json:"role" binding:"required,oneof=volunteer requester"`
	FirstName       string   `json:"firstName" binding:"required"`
	LastName        string   `json:"lastName" binding:"required"`
	NationalID      string   `json:"nationalId" binding:"required"`
	Phone           string   `json:"phone" binding:"required"`
	Password        string   `json:"password" binding:"required,min=6"`
	Skills          []string `json:"skills"`
	Biography       string   `json:"biography"`
	DisabilityType  string   `json:"disabilityType"`
	AdditionalNeeds []string `json:"additionalNeeds"`
}

type LoginRequest struct {
	NationalID string `json:"nationalId" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

// Register creates a new user with a hashed password.
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check already exists by national ID
	if _, exists, err := userStore.GetByNationalID(req.NationalID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check existing user"})
		return
	} else if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nationalId already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	u := &User{
		Role:            req.Role,
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		NationalID:      req.NationalID,
		Phone:           req.Phone,
		Skills:          req.Skills,
		Biography:       req.Biography,
		DisabilityType:  req.DisabilityType,
		AdditionalNeeds: req.AdditionalNeeds,
		Interests:       []string{},
		Rating:          0,
		CompletedJobs:   0,
		PasswordHash:    string(hash),
	}

	if err := userStore.Create(u); err != nil {
		if err == ErrUserExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "nationalId already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return created profile (frontend will call login next)
	c.JSON(http.StatusCreated, gin.H{"id": u.ID, "user": u})
}

// Login verifies credentials and returns a JWT token and profile.
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, ok, err := userStore.GetByNationalID(req.NationalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := CreateToken(u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": u})
}
