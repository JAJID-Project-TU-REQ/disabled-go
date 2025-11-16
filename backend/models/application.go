package models

import (
	"time"
)

type ApplicationStatus string

const (
	ApplicationStatusPending  ApplicationStatus = "pending"
	ApplicationStatusAccepted ApplicationStatus = "accepted"
	ApplicationStatusRejected ApplicationStatus = "rejected"
)

type Application struct {
	ID          string            `json:"id" db:"id"`
	JobID       string            `json:"jobId" db:"job_id"`
	VolunteerID string            `json:"volunteerId" db:"volunteer_id"`
	Status      ApplicationStatus `json:"status" db:"status"`
	CreatedAt   time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time         `json:"updatedAt" db:"updated_at"`
}

