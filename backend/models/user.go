package models

import (
	"time"
)

type UserRole string

const (
	RoleVolunteer UserRole = "volunteer"
	RoleRequester UserRole = "requester"
)

type User struct {
	ID            string    `json:"id" db:"id"`
	Role          UserRole  `json:"role" db:"role"`
	FirstName     string    `json:"firstName" db:"first_name"`
	LastName      string    `json:"lastName" db:"last_name"`
	NationalID    string    `json:"nationalId" db:"national_id"`
	Phone         string    `json:"phone" db:"phone"`
	Email         *string   `json:"email,omitempty" db:"email"`
	Password      string    `json:"-" db:"password"` // Don't expose password in JSON
	Skills        string    `json:"skills" db:"skills"` // JSON array stored as string
	Biography     string    `json:"biography" db:"biography"`
	DisabilityType *string  `json:"disabilityType,omitempty" db:"disability_type"`
	AdditionalNeeds string  `json:"additionalNeeds" db:"additional_needs"` // JSON array stored as string
	Rating        float64   `json:"rating" db:"rating"`
	CompletedJobs int       `json:"completedJobs" db:"completed_jobs"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
}

// ToUserProfile converts User to UserProfile format (for API response)
func (u *User) ToUserProfile() map[string]interface{} {
	profile := map[string]interface{}{
		"id":            u.ID,
		"role":          string(u.Role),
		"firstName":     u.FirstName,
		"lastName":      u.LastName,
		"nationalId":    u.NationalID,
		"phone":         u.Phone,
		"skills":        parseJSONArray(u.Skills),
		"biography":     u.Biography,
		"interests":     []string{}, // For backward compatibility
		"rating":        u.Rating,
		"completedJobs": u.CompletedJobs,
		"createdAt":     u.CreatedAt.Format(time.RFC3339),
	}

	if u.Email != nil && *u.Email != "" {
		profile["email"] = *u.Email
	}

	if u.DisabilityType != nil && *u.DisabilityType != "" {
		profile["disabilityType"] = *u.DisabilityType
	}

	if u.AdditionalNeeds != "" {
		profile["additionalNeeds"] = parseJSONArray(u.AdditionalNeeds)
	}

	return profile
}

