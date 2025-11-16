package main

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateJobRequest matches the payload sent from the mobile client when posting a job.
type CreateJobRequest struct {
	RequesterID  string   `json:"requesterId" binding:"required"`
	Title        string   `json:"title" binding:"required"`
	Location     string   `json:"location" binding:"required"`
	MeetingPoint string   `json:"meetingPoint"`
	Description  string   `json:"description"`
	Requirements []string `json:"requirements"`
	Latitude     float64  `json:"latitude"`
	Longitude    float64  `json:"longitude"`
	WorkDate     string   `json:"workDate"`
	StartTime    string   `json:"startTime"`
	EndTime      string   `json:"endTime"`
}

// JobDetailResponse mirrors the frontend JobDetail type for convenience.
type JobDetailResponse struct {
	ID                  string   `json:"id"`
	Title               string   `json:"title"`
	RequesterID         string   `json:"requesterId"`
	WorkDate            string   `json:"workDate,omitempty"`
	StartTime           string   `json:"startTime,omitempty"`
	EndTime             string   `json:"endTime,omitempty"`
	Location            string   `json:"location"`
	DistanceKm          float64  `json:"distanceKm"`
	Status              string   `json:"status"`
	AcceptedVolunteerID string   `json:"acceptedVolunteerId,omitempty"`
	RequesterDisability string   `json:"requesterDisabilityType,omitempty"`
	Description         string   `json:"description"`
	MeetingPoint        string   `json:"meetingPoint"`
	Requirements        []string `json:"requirements"`
	Latitude            float64  `json:"latitude"`
	Longitude           float64  `json:"longitude"`
	ContactName         string   `json:"contactName"`
	ContactNumber       string   `json:"contactNumber"`
	RequesterRating     float64  `json:"requesterRating,omitempty"`
	RequesterReview     string   `json:"requesterReview,omitempty"`
}

type ApplyToJobRequest struct {
	VolunteerID string `json:"volunteerId" binding:"required"`
}

type JobApplicationResponse struct {
	ID          string    `json:"id"`
	JobID       string    `json:"jobId"`
	VolunteerID string    `json:"volunteerId"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Volunteer   *User     `json:"volunteer,omitempty"`
}

// ListJobs returns either all jobs or those scoped to a requester.
func ListJobs(c *gin.Context) {
	if jobStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}
	ctx := c.Request.Context()
	reqID := c.Query("requesterId")
	var (
		jobs []*Job
		err  error
	)
	if reqID != "" {
		jobs, err = jobStore.ListByRequester(ctx, reqID)
	} else {
		jobs, err = jobStore.ListAll(ctx)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load jobs"})
		return
	}

	responses := make([]JobDetailResponse, 0, len(jobs))
	requesterCache := map[string]*User{}
	for _, job := range jobs {
		requester, ok := requesterCache[job.RequesterID]
		if !ok {
			var exists bool
			requester, exists, err = userStore.GetByID(job.RequesterID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load requester"})
				return
			}
			if !exists {
				requester = nil
			}
			requesterCache[job.RequesterID] = requester
		}
		responses = append(responses, jobToResponse(job, requester))
	}

	c.JSON(http.StatusOK, gin.H{"jobs": responses})
}

// CreateJob handles POST /api/jobs.
func CreateJob(c *gin.Context) {
	var req CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if userStore == nil || jobStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}

	requester, exists, err := userStore.GetByID(req.RequesterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to lookup requester"})
		return
	}
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "requester not found"})
		return
	}

	meetingPoint := req.MeetingPoint
	if meetingPoint == "" {
		meetingPoint = req.Location
	}

	job := &Job{
		RequesterID:  req.RequesterID,
		Title:        req.Title,
		Description:  req.Description,
		MeetingPoint: meetingPoint,
		Requirements: req.Requirements,
		Location:     req.Location,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
		WorkDate:     req.WorkDate,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		DistanceKm:   0,
	}

	created, err := jobStore.Create(job)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create job"})
		return
	}

	resp := jobToResponse(created, requester)
	c.JSON(http.StatusCreated, resp)
}

// GetJob returns a single job by ID.
func GetJob(c *gin.Context) {
	if jobStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}
	jobID := c.Param("id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job id required"})
		return
	}

	job, found, err := jobStore.GetByID(c.Request.Context(), jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load job"})
		return
	}
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	var requester *User
	if userStore != nil {
		var exists bool
		requester, exists, err = userStore.GetByID(job.RequesterID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load requester"})
			return
		}
		if !exists {
			requester = nil
		}
	}

	c.JSON(http.StatusOK, jobToResponse(job, requester))
}

// ApplyToJob allows a volunteer to submit an application.
func ApplyToJob(c *gin.Context) {
	if applicationStore == nil || jobStore == nil || userStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}
	jobID := c.Param("id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job id required"})
		return
	}

	var req ApplyToJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	if _, exists, err := jobStore.GetByID(ctx, jobID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load job"})
		return
	} else if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	if _, exists, err := userStore.GetByID(req.VolunteerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load volunteer"})
		return
	} else if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "volunteer not found"})
		return
	}

	application, err := applicationStore.Create(ctx, jobID, req.VolunteerID)
	if err != nil {
		if err == errApplicationAlreadyExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "already applied"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create application"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        application.ID,
		"status":    application.Status,
		"createdAt": application.CreatedAt,
		"updatedAt": application.UpdatedAt,
	})
}

// ListJobApplications returns every applicant for a job.
func ListJobApplications(c *gin.Context) {
	if applicationStore == nil || userStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}
	jobID := c.Param("id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job id required"})
		return
	}

	ctx := c.Request.Context()
	applications, err := applicationStore.ListByJob(ctx, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load applications"})
		return
	}

	volunteerCache := map[string]*User{}
	responses := make([]JobApplicationResponse, 0, len(applications))
	for _, app := range applications {
		volunteer, ok := volunteerCache[app.VolunteerID]
		if !ok {
			var exists bool
			volunteer, exists, err = userStore.GetByID(app.VolunteerID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load volunteer"})
				return
			}
			if !exists {
				volunteer = nil
			}
			volunteerCache[app.VolunteerID] = volunteer
		}
		responses = append(responses, JobApplicationResponse{
			ID:          app.ID,
			JobID:       app.JobID,
			VolunteerID: app.VolunteerID,
			Status:      app.Status,
			CreatedAt:   app.CreatedAt,
			UpdatedAt:   app.UpdatedAt,
			Volunteer:   volunteer,
		})
	}

	c.JSON(http.StatusOK, gin.H{"applications": responses})
}

// AcceptApplication approves an application and assigns the volunteer to the job.
func AcceptApplication(c *gin.Context) {
	if applicationStore == nil || jobStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store not initialized"})
		return
	}
	appID := c.Param("id")
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "application id required"})
		return
	}

	ctx := c.Request.Context()
	application, exists, err := applicationStore.GetByID(ctx, appID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load application"})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	if err := applicationStore.UpdateStatus(ctx, application.ID, "accepted"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update application"})
		return
	}
	if err := applicationStore.RejectOtherPending(ctx, application.JobID, application.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update other applications"})
		return
	}
	if err := jobStore.AssignVolunteer(ctx, application.JobID, application.VolunteerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign volunteer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "application accepted"})
}

func jobToResponse(job *Job, requester *User) JobDetailResponse {
	var (
		contactName   string
		contactNumber string
		disability    string
	)
	if requester != nil {
		contactName = strings.TrimSpace(requester.FirstName + " " + requester.LastName)
		contactNumber = requester.Phone
		disability = requester.DisabilityType
	}

	response := JobDetailResponse{
		ID:                  job.ID,
		Title:               job.Title,
		RequesterID:         job.RequesterID,
		WorkDate:            job.WorkDate,
		StartTime:           job.StartTime,
		EndTime:             job.EndTime,
		Location:            job.Location,
		DistanceKm:          job.DistanceKm,
		Status:              job.Status,
		AcceptedVolunteerID: job.AcceptedVolunteerID,
		RequesterDisability: disability,
		Description:         job.Description,
		MeetingPoint:        job.MeetingPoint,
		Requirements:        job.Requirements,
		Latitude:            job.Latitude,
		Longitude:           job.Longitude,
		ContactName:         contactName,
		ContactNumber:       contactNumber,
	}
	return response
}
