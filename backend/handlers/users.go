package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/JAJID-Project-TU-REQ/back-disabled-go/config"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/models"
)

// GetProfile returns user profile by id
func GetProfile(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	query := `SELECT id, role, first_name, last_name, national_id, phone, email, password, 
		skills, biography, disability_type, additional_needs, rating, completed_jobs, created_at 
		FROM users WHERE id = ?`
	err := config.DB.QueryRow(query, id).Scan(
		&user.ID, &user.Role, &user.FirstName, &user.LastName, &user.NationalID, &user.Phone,
		&user.Email, &user.Password, &user.Skills, &user.Biography, &user.DisabilityType,
		&user.AdditionalNeeds, &user.Rating, &user.CompletedJobs, &user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, user.ToUserProfile())
}

type UpdateUserRequest struct {
	FirstName       *string  `json:"firstName"`
	LastName        *string  `json:"lastName"`
	Phone           *string  `json:"phone"`
	Email           *string  `json:"email"`
	Skills          []string `json:"skills"`
	Biography       *string  `json:"biography"`
	DisabilityType  *string  `json:"disabilityType"`
	AdditionalNeeds []string `json:"additionalNeeds"`
}

// UpdateUser updates allowed fields of a user
func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Fetch existing for role branching
	var role string
	if err := config.DB.QueryRow("SELECT role FROM users WHERE id = ?", id).Scan(&role); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Build update sets
	skillsJSON := (*string)(nil)
	additionalNeedsJSON := (*string)(nil)
	if req.Skills != nil {
		s := models.ToJSONArray(req.Skills)
		skillsJSON = &s
	}
	if req.AdditionalNeeds != nil {
		an := models.ToJSONArray(req.AdditionalNeeds)
		additionalNeedsJSON = &an
	}

	// Update statement with COALESCE-like behavior done in code
	query := `UPDATE users SET 
		first_name = IFNULL(?, first_name),
		last_name = IFNULL(?, last_name),
		phone = IFNULL(?, phone),
		email = ?,
		skills = IFNULL(?, skills),
		biography = IFNULL(?, biography),
		disability_type = ?,
		additional_needs = IFNULL(?, additional_needs)
		WHERE id = ?`

	_, err := config.DB.Exec(query,
		req.FirstName,
		req.LastName,
		req.Phone,
		req.Email,
		skillsJSON,
		req.Biography,
		req.DisabilityType,
		additionalNeedsJSON,
		id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	GetProfile(c)
}


