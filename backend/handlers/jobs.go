package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/JAJID-Project-TU-REQ/back-disabled-go/config"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/models"
)

type JobResponse struct {
	ID                    string   `json:"id"`
	Title                 string   `json:"title"`
	RequesterID           string   `json:"requesterId"`
	WorkDate              *string  `json:"workDate,omitempty"`
	StartTime             *string  `json:"startTime,omitempty"`
	EndTime               *string  `json:"endTime,omitempty"`
	Location              string   `json:"location"`
	DistanceKm            float64  `json:"distanceKm"`
	Status                string   `json:"status"`
	AcceptedVolunteerID   *string  `json:"acceptedVolunteerId,omitempty"`
	AcceptedVolunteerName *string  `json:"acceptedVolunteerName,omitempty"`
	Description           string   `json:"description,omitempty"`
	MeetingPoint          string   `json:"meetingPoint,omitempty"`
	Requirements          []string `json:"requirements,omitempty"`
	Latitude              float64  `json:"latitude,omitempty"`
	Longitude             float64  `json:"longitude,omitempty"`
	ContactName           string   `json:"contactName,omitempty"`
	ContactNumber         string   `json:"contactNumber,omitempty"`
	RequesterRating       *int     `json:"requesterRating,omitempty"`
	RequesterReview       *string  `json:"requesterReview,omitempty"`
	RequesterDisability   *string  `json:"requesterDisabilityType,omitempty"`
	ApplicationStatus     *string  `json:"applicationStatus,omitempty"`
}

func parseJSONArrayString(jsonStr string) []string {
	if jsonStr == "" {
		return []string{}
	}
	var result []string
	if err := json.Unmarshal([]byte(jsonStr), &result); err == nil {
		return result
	}
	// fallback: simple comma split
	var items []string
	if jsonStr != "" {
		for _, part := range strings.Split(jsonStr, ",") {
			part = strings.TrimSpace(part)
			if part != "" {
				items = append(items, part)
			}
		}
	}
	return items
}

func toJobResponse(job models.Job, requesterDisability *string, applicationStatus *string, acceptedVolunteerName *string) JobResponse {
	resp := JobResponse{
		ID:                    job.ID,
		Title:                 job.Title,
		RequesterID:           job.RequesterID,
		Location:              job.Location,
		DistanceKm:            job.DistanceKm,
		Status:                string(job.Status),
		Description:           job.Description,
		MeetingPoint:          job.MeetingPoint,
		Requirements:          parseJSONArrayString(job.Requirements),
		Latitude:              job.Latitude,
		Longitude:             job.Longitude,
		ContactName:           job.ContactName,
		ContactNumber:         job.ContactNumber,
		RequesterDisability:   requesterDisability,
		ApplicationStatus:     applicationStatus,
		AcceptedVolunteerName: acceptedVolunteerName,
	}
	if job.AcceptedVolunteerID != nil {
		resp.AcceptedVolunteerID = job.AcceptedVolunteerID
	}
	if job.WorkDate != nil {
		resp.WorkDate = job.WorkDate
	}
	if job.StartTime != nil {
		resp.StartTime = job.StartTime
	}
	if job.EndTime != nil {
		resp.EndTime = job.EndTime
	}
	if job.RequesterRating != nil {
		resp.RequesterRating = job.RequesterRating
	}
	if job.RequesterReview != nil {
		resp.RequesterReview = job.RequesterReview
	}
	return resp
}

// GET /api/jobs?volunteerId=...
func GetJobs(c *gin.Context) {
	volunteerID := c.Query("volunteerId")

	rows, err := config.DB.Query(`SELECT 
		j.id, j.title, j.requester_id, j.work_date, j.start_time, j.end_time, j.location, j.distance_km,
		j.status, j.accepted_volunteer_id, j.description, j.meeting_point, j.requirements, j.latitude, j.longitude,
		j.contact_name, j.contact_number, j.requester_rating, j.requester_review,
		u.disability_type
		FROM jobs j
		JOIN users u ON u.id = j.requester_id
		ORDER BY j.created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var items []JobResponse
	for rows.Next() {
		var job models.Job
		var requesterDisability sql.NullString
		err := rows.Scan(
			&job.ID, &job.Title, &job.RequesterID, &job.WorkDate, &job.StartTime, &job.EndTime, &job.Location, &job.DistanceKm,
			&job.Status, &job.AcceptedVolunteerID, &job.Description, &job.MeetingPoint, &job.Requirements, &job.Latitude, &job.Longitude,
			&job.ContactName, &job.ContactNumber, &job.RequesterRating, &job.RequesterReview,
			&requesterDisability,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		var applicationStatus *string
		if volunteerID != "" {
			var status sql.NullString
			err := config.DB.QueryRow("SELECT status FROM applications WHERE job_id = ? AND volunteer_id = ? LIMIT 1", job.ID, volunteerID).Scan(&status)
			if err == nil && status.Valid {
				s := status.String
				applicationStatus = &s
			}
		}

		var dis *string
		if requesterDisability.Valid {
			s := requesterDisability.String
			dis = &s
		}
		items = append(items, toJobResponse(job, dis, applicationStatus, nil))
	}
	c.JSON(http.StatusOK, gin.H{"jobs": items})
}

// GET /api/jobs/:id?volunteerId=...
func GetJob(c *gin.Context) {
	id := c.Param("id")
	volunteerID := c.Query("volunteerId")

	var job models.Job
	var requesterDisability sql.NullString
	err := config.DB.QueryRow(`SELECT 
		j.id, j.title, j.requester_id, j.work_date, j.start_time, j.end_time, j.location, j.distance_km,
		j.status, j.accepted_volunteer_id, j.description, j.meeting_point, j.requirements, j.latitude, j.longitude,
		j.contact_name, j.contact_number, j.requester_rating, j.requester_review,
		u.disability_type
		FROM jobs j
		JOIN users u ON u.id = j.requester_id
		WHERE j.id = ?`, id).
		Scan(
			&job.ID, &job.Title, &job.RequesterID, &job.WorkDate, &job.StartTime, &job.EndTime, &job.Location, &job.DistanceKm,
			&job.Status, &job.AcceptedVolunteerID, &job.Description, &job.MeetingPoint, &job.Requirements, &job.Latitude, &job.Longitude,
			&job.ContactName, &job.ContactNumber, &job.RequesterRating, &job.RequesterReview,
			&requesterDisability,
		)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบงาน"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	var applicationStatus *string
	if volunteerID != "" {
		var status sql.NullString
		if err := config.DB.QueryRow("SELECT status FROM applications WHERE job_id = ? AND volunteer_id = ? LIMIT 1", id, volunteerID).Scan(&status); err == nil && status.Valid {
			s := status.String
			applicationStatus = &s
		}
	}

	var dis *string
	if requesterDisability.Valid {
		s := requesterDisability.String
		dis = &s
	}

	c.JSON(http.StatusOK, toJobResponse(job, dis, applicationStatus, nil))
}

type CreateJobRequest struct {
	RequesterID  string   `json:"requesterId" binding:"required"`
	Title        string   `json:"title" binding:"required"`
	Location     string   `json:"location" binding:"required"`
	MeetingPoint string   `json:"meetingPoint" binding:"required"`
	Description  string   `json:"description" binding:"required"`
	Requirements []string `json:"requirements" binding:"required"`
	Latitude     float64  `json:"latitude" binding:"required"`
	Longitude    float64  `json:"longitude" binding:"required"`
	WorkDate     *string  `json:"workDate"`
	StartTime    *string  `json:"startTime"`
	EndTime      *string  `json:"endTime"`
}

// POST /api/jobs
func CreateJob(c *gin.Context) {
	var req CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	jobID := uuid.New().String()
	// ใช้ string ตรงๆ เพื่อให้รองรับทั้ง HH:MM และ HH:MM:SS
	var workDate interface{} = nil
	var startTime interface{} = nil
	var endTime interface{} = nil
	if req.WorkDate != nil && *req.WorkDate != "" {
		workDate = *req.WorkDate
	}
	if req.StartTime != nil && *req.StartTime != "" {
		startTime = *req.StartTime
	}
	if req.EndTime != nil && *req.EndTime != "" {
		endTime = *req.EndTime
	}

	_, err := config.DB.Exec(`INSERT INTO jobs 
		(id, title, requester_id, work_date, start_time, end_time, location, distance_km, status, description, meeting_point, requirements, latitude, longitude, contact_name, contact_number)
		VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 'open', ?, ?, ?, ?, ?, ?, ?)`,
		jobID, req.Title, req.RequesterID, workDate, startTime, endTime, req.Location, req.Description, req.MeetingPoint, models.ToJSONArray(req.Requirements),
		req.Latitude, req.Longitude, "", "",
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job"})
		return
	}

	// return created
	var job models.Job
	err = config.DB.QueryRow(`SELECT id, title, requester_id, work_date, start_time, end_time, location, distance_km,
		status, accepted_volunteer_id, description, meeting_point, requirements, latitude, longitude,
		contact_name, contact_number, requester_rating, requester_review
		FROM jobs WHERE id = ?`, jobID).
		Scan(&job.ID, &job.Title, &job.RequesterID, &job.WorkDate, &job.StartTime, &job.EndTime, &job.Location, &job.DistanceKm,
			&job.Status, &job.AcceptedVolunteerID, &job.Description, &job.MeetingPoint, &job.Requirements, &job.Latitude, &job.Longitude,
			&job.ContactName, &job.ContactNumber, &job.RequesterRating, &job.RequesterReview)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch job"})
		return
	}

	c.JSON(http.StatusCreated, toJobResponse(job, nil, nil, nil))
}

type UpdateJobRequest struct {
	Title       *string  `json:"title"`
	WorkDate    *string  `json:"workDate"`
	StartTime   *string  `json:"startTime"`
	EndTime     *string  `json:"endTime"`
	Location    *string  `json:"location"`
	Description *string  `json:"description"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
}

// PUT /api/jobs/:id
func UpdateJob(c *gin.Context) {
	id := c.Param("id")
	var req UpdateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var workDate interface{} = nil
	var startTime interface{} = nil
	var endTime interface{} = nil
	if req.WorkDate != nil {
		if *req.WorkDate == "" {
			workDate = nil
		} else {
			workDate = *req.WorkDate
		}
	}
	if req.StartTime != nil {
		if *req.StartTime == "" {
			startTime = nil
		} else {
			startTime = *req.StartTime
		}
	}
	if req.EndTime != nil {
		if *req.EndTime == "" {
			endTime = nil
		} else {
			endTime = *req.EndTime
		}
	}

	_, err := config.DB.Exec(`UPDATE jobs SET
		title = IFNULL(?, title),
		work_date = IFNULL(?, work_date),
		start_time = IFNULL(?, start_time),
		end_time = IFNULL(?, end_time),
		location = IFNULL(?, location),
		description = IFNULL(?, description),
		latitude = IFNULL(?, latitude),
		longitude = IFNULL(?, longitude)
		WHERE id = ?`,
		req.Title, workDate, startTime, endTime, req.Location, req.Description, req.Latitude, req.Longitude, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update job"})
		return
	}
	GetJob(c)
}

// DELETE /api/jobs/:id
func DeleteJob(c *gin.Context) {
	id := c.Param("id")
	if _, err := config.DB.Exec("DELETE FROM jobs WHERE id = ?", id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete job"})
		return
	}
	c.Status(http.StatusNoContent)
}

// GET /api/requesters/:id/jobs
func GetRequesterJobs(c *gin.Context) {
	reqID := c.Param("id")
	rows, err := config.DB.Query(`SELECT 
		j.id, j.title, j.requester_id, j.work_date, j.start_time, j.end_time, j.location, j.distance_km,
		j.status, j.accepted_volunteer_id, j.description, j.meeting_point, j.requirements, j.latitude, j.longitude,
		j.contact_name, j.contact_number, j.requester_rating, j.requester_review,
		CONCAT(u.first_name, ' ', u.last_name) as volunteer_name
		FROM jobs j
		LEFT JOIN users u ON u.id = j.accepted_volunteer_id
		WHERE j.requester_id = ? ORDER BY j.created_at DESC`, reqID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var items []JobResponse
	for rows.Next() {
		var job models.Job
		var volunteerName sql.NullString
		if err := rows.Scan(
			&job.ID, &job.Title, &job.RequesterID, &job.WorkDate, &job.StartTime, &job.EndTime, &job.Location, &job.DistanceKm,
			&job.Status, &job.AcceptedVolunteerID, &job.Description, &job.MeetingPoint, &job.Requirements, &job.Latitude, &job.Longitude,
			&job.ContactName, &job.ContactNumber, &job.RequesterRating, &job.RequesterReview,
			&volunteerName,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		var volName *string
		if volunteerName.Valid {
			s := volunteerName.String
			volName = &s
		}
		items = append(items, toJobResponse(job, nil, nil, volName))
	}
	c.JSON(http.StatusOK, gin.H{"jobs": items})
}
