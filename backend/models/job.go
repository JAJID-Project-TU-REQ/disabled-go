package models

import (
	"time"
)

type JobStatus string

const (
	JobStatusOpen      JobStatus = "open"
	JobStatusCompleted JobStatus = "completed"
	JobStatusCancelled JobStatus = "cancelled"
)

type Job struct {
	ID                  string     `json:"id" db:"id"`
	Title               string     `json:"title" db:"title"`
	RequesterID         string     `json:"requesterId" db:"requester_id"`
	WorkDate            *string    `json:"workDate,omitempty" db:"work_date"`
	StartTime           *string    `json:"startTime,omitempty" db:"start_time"`
	EndTime             *string    `json:"endTime,omitempty" db:"end_time"`
	Location            string     `json:"location" db:"location"`
	DistanceKm          float64    `json:"distanceKm" db:"distance_km"`
	Status              JobStatus  `json:"status" db:"status"`
	AcceptedVolunteerID *string    `json:"acceptedVolunteerId,omitempty" db:"accepted_volunteer_id"`
	Description         string     `json:"description" db:"description"`
	MeetingPoint        string     `json:"meetingPoint" db:"meeting_point"`
	Requirements        string     `json:"requirements" db:"requirements"` // JSON array stored as string
	Latitude            float64    `json:"latitude" db:"latitude"`
	Longitude           float64    `json:"longitude" db:"longitude"`
	ContactName         string     `json:"contactName" db:"contact_name"`
	ContactNumber       string     `json:"contactNumber" db:"contact_number"`
	RequesterRating     *int       `json:"requesterRating,omitempty" db:"requester_rating"`
	RequesterReview     *string    `json:"requesterReview,omitempty" db:"requester_review"`
	CreatedAt           time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time  `json:"updatedAt" db:"updated_at"`
}

