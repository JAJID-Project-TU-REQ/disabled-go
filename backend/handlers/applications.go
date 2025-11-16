package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/JAJID-Project-TU-REQ/back-disabled-go/config"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/models"
)

type ApplyRequest struct {
	VolunteerID string `json:"volunteerId" binding:"required"`
}

// POST /api/jobs/:id/apply
func ApplyToJob(c *gin.Context) {
	jobID := c.Param("id")
	var req ApplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Ensure job exists and is open and not yet assigned
	var status string
	var accepted sql.NullString
	err := config.DB.QueryRow("SELECT status, accepted_volunteer_id FROM jobs WHERE id = ?", jobID).Scan(&status, &accepted)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบงาน"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if status != "open" || (accepted.Valid && accepted.String != "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถสมัครงานนี้ได้"})
		return
	}

	// Insert application (unique constraint will guard duplicates)
	appID := uuid.New().String()
	_, err = config.DB.Exec(`INSERT INTO applications (id, job_id, volunteer_id, status) VALUES (?, ?, ?, 'pending')`,
		appID, jobID, req.VolunteerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คุณได้สมัครงานนี้แล้ว"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": appID})
}

// POST /api/jobs/:id/cancel
func CancelApplication(c *gin.Context) {
	jobID := c.Param("id")
	var req ApplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Only pending can be cancelled
	res, err := config.DB.Exec(`DELETE FROM applications WHERE job_id = ? AND volunteer_id = ? AND status = 'pending'`, jobID, req.VolunteerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถยกเลิกได้"})
		return
	}
	c.Status(http.StatusNoContent)
}

// POST /api/applications/:id/accept
func AcceptApplication(c *gin.Context) {
	appID := c.Param("id")

	// Fetch application
	var jobID, volunteerID string
	err := config.DB.QueryRow("SELECT job_id, volunteer_id FROM applications WHERE id = ?", appID).Scan(&jobID, &volunteerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัคร"})
		return
	}
	if err != nil {
		log.Printf("acceptApplication: query application failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Accept chosen application; reject others
	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("acceptApplication: begin tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`UPDATE applications SET status = 'accepted', updated_at = ? WHERE id = ?`, time.Now(), appID); err != nil {
		log.Printf("acceptApplication: update chosen application failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// ไม่เปลี่ยน status เป็นค่าใหม่ที่ไม่อยู่ใน ENUM เพื่อไม่ให้ DB error
	if _, err := tx.Exec(`UPDATE jobs SET accepted_volunteer_id = ? WHERE id = ?`, volunteerID, jobID); err != nil {
		log.Printf("acceptApplication: update job failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if _, err := tx.Exec(`UPDATE applications SET status = 'rejected', updated_at = ? WHERE job_id = ? AND id <> ? AND status = 'pending'`, time.Now(), jobID, appID); err != nil {
		log.Printf("acceptApplication: reject other applications failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := tx.Commit(); err != nil {
		log.Printf("acceptApplication: commit tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// POST /api/applications/:id/reject
func RejectApplication(c *gin.Context) {
	appID := c.Param("id")
	res, err := config.DB.Exec(`UPDATE applications SET status = 'rejected', updated_at = ? WHERE id = ? AND status = 'pending'`, time.Now(), appID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถปฏิเสธได้"})
		return
	}
	c.Status(http.StatusNoContent)
}

// GET /api/jobs/:id/applications
func GetJobApplications(c *gin.Context) {
	jobID := c.Param("id")
	rows, err := config.DB.Query(`
		SELECT a.id, a.job_id, a.volunteer_id, a.status, a.created_at, a.updated_at,
		       u.id, u.role, u.first_name, u.last_name, u.national_id, u.phone, u.email, u.password,
			   u.skills, u.biography, u.disability_type, u.additional_needs, u.rating, u.completed_jobs, u.created_at
		FROM applications a
		JOIN users u ON u.id = a.volunteer_id
		WHERE a.job_id = ? AND a.status = 'pending'
		ORDER BY a.created_at ASC
	`, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	type Result struct {
		ID          string                 `json:"id"`
		JobID       string                 `json:"jobId"`
		VolunteerID string                 `json:"volunteerId"`
		Status      string                 `json:"status"`
		CreatedAt   time.Time              `json:"createdAt"`
		UpdatedAt   time.Time              `json:"updatedAt"`
		Volunteer   map[string]interface{} `json:"volunteer"`
	}
	var list []Result
	for rows.Next() {
		var appID, jobId, volId, status string
		var createdAt, updatedAt time.Time
		var volunteer models.User
		if err := rows.Scan(
			&appID, &jobId, &volId, &status, &createdAt, &updatedAt,
			&volunteer.ID, &volunteer.Role, &volunteer.FirstName, &volunteer.LastName, &volunteer.NationalID, &volunteer.Phone, &volunteer.Email, &volunteer.Password,
			&volunteer.Skills, &volunteer.Biography, &volunteer.DisabilityType, &volunteer.AdditionalNeeds, &volunteer.Rating, &volunteer.CompletedJobs, &volunteer.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		list = append(list, Result{
			ID:          appID,
			JobID:       jobId,
			VolunteerID: volId,
			Status:      status,
			CreatedAt:   createdAt,
			UpdatedAt:   updatedAt,
			Volunteer:   volunteer.ToUserProfile(),
		})
	}
	c.JSON(http.StatusOK, gin.H{"applications": list})
}

// GET /api/volunteers/:id/applications
func GetVolunteerApplications(c *gin.Context) {
	volID := c.Param("id")
	rows, err := config.DB.Query(`
		SELECT a.id, a.job_id, a.volunteer_id, a.status, a.created_at, a.updated_at,
		       j.id, j.title, j.requester_id, j.work_date, j.start_time, j.end_time, j.location, j.distance_km, j.status, j.accepted_volunteer_id,
			   u.disability_type
		FROM applications a
		JOIN jobs j ON j.id = a.job_id
		JOIN users u ON u.id = j.requester_id
		WHERE a.volunteer_id = ?
		ORDER BY a.created_at DESC
	`, volID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	type Application struct {
		ID           string    `json:"id"`
		JobID        string    `json:"jobId"`
		VolunteerID  string    `json:"volunteerId"`
		Status       string    `json:"status"`
		CreatedAt    time.Time `json:"createdAt"`
		UpdatedAt    time.Time `json:"updatedAt"`
	}

	type VolunteerApplication struct {
		Application Application `json:"application"`
		Job         struct {
			ID                     string   `json:"id"`
			Title                  string   `json:"title"`
			RequesterID            string   `json:"requesterId"`
			WorkDate               *string  `json:"workDate"`
			StartTime              *string  `json:"startTime"`
			EndTime                *string  `json:"endTime"`
			Location               string   `json:"location"`
			DistanceKm             float64  `json:"distanceKm"`
			Status                 string   `json:"status"`
			AcceptedVolunteerID    *string  `json:"acceptedVolunteerId"`
			RequesterDisabilityType *string `json:"requesterDisabilityType"`
		} `json:"job"`
	}

	var items []VolunteerApplication
	for rows.Next() {
		var app Application
		var job models.Job
		var requesterDisability sql.NullString
		if err := rows.Scan(
			&app.ID, &app.JobID, &app.VolunteerID, &app.Status, &app.CreatedAt, &app.UpdatedAt,
			&job.ID, &job.Title, &job.RequesterID, &job.WorkDate, &job.StartTime, &job.EndTime, &job.Location, &job.DistanceKm, &job.Status, &job.AcceptedVolunteerID,
			&requesterDisability,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		// models.Job already uses *string for date/time fields
		workDate := job.WorkDate
		startTime := job.StartTime
		endTime := job.EndTime
		acceptedID := job.AcceptedVolunteerID
		var dis *string
		if requesterDisability.Valid {
			s := requesterDisability.String
			dis = &s
		}

		item := VolunteerApplication{
			Application: app,
		}
		item.Job.ID = job.ID
		item.Job.Title = job.Title
		item.Job.RequesterID = job.RequesterID
		item.Job.WorkDate = workDate
		item.Job.StartTime = startTime
		item.Job.EndTime = endTime
		item.Job.Location = job.Location
		item.Job.DistanceKm = job.DistanceKm
		item.Job.Status = string(job.Status)
		item.Job.AcceptedVolunteerID = acceptedID
		item.Job.RequesterDisabilityType = dis

		items = append(items, item)
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

type CompleteJobRequest struct {
	VolunteerID string `json:"volunteerId" binding:"required"`
}

// POST /api/jobs/:id/complete
func CompleteJob(c *gin.Context) {
	jobID := c.Param("id")
	var req CompleteJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("completeJob: begin tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer tx.Rollback()

	// update job status เป็น completed (ยังไม่แตะ rating/review)
	if _, err := tx.Exec(`UPDATE jobs SET status='completed', updated_at=? WHERE id = ?`,
		time.Now(), jobID); err != nil {
		log.Printf("completeJob: update job failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	// update application: เก็บ status เป็น accepted เอาไว้ (ไม่ใช้ค่าใหม่ที่ไม่อยู่ใน ENUM)
	if _, err := tx.Exec(`UPDATE applications SET updated_at=? WHERE job_id = ? AND volunteer_id = ?`,
		time.Now(), jobID, req.VolunteerID); err != nil {
		log.Printf("completeJob: update application failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	// update volunteer stats (increment completed_jobs, naive rating averaging)
	if _, err := tx.Exec(`UPDATE users SET completed_jobs = completed_jobs + 1 WHERE id = ?`, req.VolunteerID); err != nil {
		log.Printf("completeJob: update volunteer stats failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if err := tx.Commit(); err != nil {
		log.Printf("completeJob: commit tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.Status(http.StatusNoContent)
}

// GET /api/volunteers/:id/reviews
func GetVolunteerReviews(c *gin.Context) {
	volID := c.Param("id")
	rows, err := config.DB.Query(`
		SELECT j.title, j.requester_rating, j.requester_review, u.first_name, u.last_name, a.updated_at
		FROM jobs j
		JOIN applications a ON a.job_id = j.id AND a.volunteer_id = ? AND a.status IN ('accepted','completed')
		JOIN users u ON u.id = j.requester_id
		WHERE j.accepted_volunteer_id = ? AND j.status = 'completed' AND j.requester_review IS NOT NULL
		ORDER BY a.updated_at DESC
	`, volID, volID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	type Review struct {
		JobTitle      string    `json:"jobTitle"`
		Rating        int       `json:"rating"`
		Review        string    `json:"review"`
		RequesterName string    `json:"requesterName"`
		CreatedAt     time.Time `json:"createdAt"`
	}
	var items []Review
	for rows.Next() {
		var r Review
		var rating sql.NullInt64
		var review sql.NullString
		var first, last string
		if err := rows.Scan(&r.JobTitle, &rating, &review, &first, &last, &r.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if rating.Valid {
			r.Rating = int(rating.Int64)
		}
		if review.Valid {
			r.Review = review.String
		}
		r.RequesterName = (first + " " + last)
		items = append(items, r)
	}
	c.JSON(http.StatusOK, items)
}

type SubmitRatingRequest struct {
	Rating int    `json:"rating" binding:"required,min=1,max=5"`
	Review string `json:"review" binding:"required"`
}

// POST /api/jobs/:id/rating
func SubmitRating(c *gin.Context) {
	jobID := c.Param("id")
	var req SubmitRatingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// ตรวจสอบว่างานมีอยู่และเสร็จแล้ว
	var jobStatus string
	var acceptedVolunteerID sql.NullString
	err := config.DB.QueryRow("SELECT status, accepted_volunteer_id FROM jobs WHERE id = ?", jobID).Scan(&jobStatus, &acceptedVolunteerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบงาน"})
		return
	}
	if err != nil {
		log.Printf("submitRating: query job failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if jobStatus != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "งานนี้ยังไม่เสร็จสิ้น"})
		return
	}
	if !acceptedVolunteerID.Valid || acceptedVolunteerID.String == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "งานนี้ยังไม่มีผู้ดูแล"})
		return
	}

	// ตรวจสอบว่าให้คะแนนไปแล้วหรือยัง
	var existingRating sql.NullInt64
	err = config.DB.QueryRow("SELECT requester_rating FROM jobs WHERE id = ?", jobID).Scan(&existingRating)
	if err != nil {
		log.Printf("submitRating: query existing rating failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if existingRating.Valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ให้คะแนนไปแล้ว"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("submitRating: begin tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer tx.Rollback()

	// อัปเดต rating และ review ใน jobs
	if _, err := tx.Exec(`UPDATE jobs SET requester_rating = ?, requester_review = ?, updated_at = ? WHERE id = ?`,
		req.Rating, req.Review, time.Now(), jobID); err != nil {
		log.Printf("submitRating: update job failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// คำนวณ rating ใหม่ของ volunteer (เฉลี่ย)
	// ดึง rating และ completed_jobs ปัจจุบัน
	var currentRating float64
	var completedJobs int
	err = tx.QueryRow("SELECT rating, completed_jobs FROM users WHERE id = ?", acceptedVolunteerID.String).Scan(&currentRating, &completedJobs)
	if err != nil {
		log.Printf("submitRating: query volunteer stats failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// คำนวณ rating ใหม่: (currentRating * (completedJobs - 1) + newRating) / completedJobs
	// หรือถ้า completedJobs = 1: ใช้ rating ใหม่เลย
	var newRating float64
	if completedJobs > 1 {
		newRating = (currentRating*float64(completedJobs-1) + float64(req.Rating)) / float64(completedJobs)
	} else {
		newRating = float64(req.Rating)
	}

	// อัปเดต rating ของ volunteer
	if _, err := tx.Exec(`UPDATE users SET rating = ? WHERE id = ?`, newRating, acceptedVolunteerID.String); err != nil {
		log.Printf("submitRating: update volunteer rating failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("submitRating: commit tx failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.Status(http.StatusNoContent)
}


