package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Job represents a help request posted by a requester.
type Job struct {
	ID                  string    `json:"id"`
	RequesterID         string    `json:"requesterId"`
	Title               string    `json:"title"`
	Description         string    `json:"description"`
	MeetingPoint        string    `json:"meetingPoint"`
	Requirements        []string  `json:"requirements"`
	Location            string    `json:"location"`
	Latitude            float64   `json:"latitude"`
	Longitude           float64   `json:"longitude"`
	WorkDate            string    `json:"workDate,omitempty"`
	StartTime           string    `json:"startTime,omitempty"`
	EndTime             string    `json:"endTime,omitempty"`
	Status              string    `json:"status"`
	DistanceKm          float64   `json:"distanceKm"`
	AcceptedVolunteerID string    `json:"acceptedVolunteerId,omitempty"`
	CreatedAt           time.Time `json:"createdAt"`
}

// JobStore persists jobs to MySQL.
type JobStore struct {
	db *sql.DB
}

var jobStore *JobStore

const createJobsTableSQL = `
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) NOT NULL UNIQUE,
    requester_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_point VARCHAR(255),
    requirements JSON NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    work_date VARCHAR(32),
    start_time VARCHAR(16),
    end_time VARCHAR(16),
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    distance_km DOUBLE NOT NULL DEFAULT 0,
    accepted_volunteer_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`

const jobSelectColumns = `public_id, requester_id, title, description, meeting_point, requirements, location, latitude, longitude, work_date, start_time, end_time, status, distance_km, accepted_volunteer_id, created_at`

type rowScanner interface {
	Scan(dest ...any) error
}

// NewJobStore creates a job store backed by db.
func NewJobStore(db *sql.DB) *JobStore {
	return &JobStore{db: db}
}

// Setup ensures the jobs table exists.
func (s *JobStore) Setup(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, createJobsTableSQL)
	return err
}

// Create inserts a new job row and returns it.
func (s *JobStore) Create(job *Job) (*Job, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if job.ID == "" {
		job.ID = uuid.NewString()

	}
	if job.Status == "" {
		job.Status = "open"
	}
	job.Requirements = normalizeSlice(job.Requirements)
	job.CreatedAt = time.Now().UTC()

	requirementsJSON, err := json.Marshal(job.Requirements)
	if err != nil {
		return nil, err
	}

	const insertSQL = `INSERT INTO jobs (public_id, requester_id, title, description, meeting_point, requirements, location, latitude, longitude, work_date, start_time, end_time, status, distance_km, accepted_volunteer_id, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	if _, err := s.db.ExecContext(
		ctx,
		insertSQL,
		job.ID,
		job.RequesterID,
		job.Title,
		nullIfEmpty(job.Description),
		nullIfEmpty(job.MeetingPoint),
		string(requirementsJSON),
		job.Location,
		job.Latitude,
		job.Longitude,
		nullIfEmpty(job.WorkDate),
		nullIfEmpty(job.StartTime),
		nullIfEmpty(job.EndTime),
		job.Status,
		job.DistanceKm,
		nullIfEmpty(job.AcceptedVolunteerID),
		job.CreatedAt,
	); err != nil {
		return nil, err
	}

	return job, nil
}

// AssignVolunteer marks a job as in progress and stores the selected volunteer.
func (s *JobStore) AssignVolunteer(ctx context.Context, jobID, volunteerID string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `UPDATE jobs SET accepted_volunteer_id = ?, status = 'in_progress' WHERE public_id = ?`
	_, err := s.db.ExecContext(ctx, query, volunteerID, jobID)
	return err
}

// ListAll returns every job ordered by most recent first.
func (s *JobStore) ListAll(ctx context.Context) ([]*Job, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `SELECT ` + jobSelectColumns + ` FROM jobs ORDER BY created_at DESC`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*Job
	for rows.Next() {
		job, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return jobs, nil
}

// ListByRequester returns jobs filtered by requester ID.
func (s *JobStore) ListByRequester(ctx context.Context, requesterID string) ([]*Job, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `SELECT ` + jobSelectColumns + ` FROM jobs WHERE requester_id = ? ORDER BY created_at DESC`
	rows, err := s.db.QueryContext(ctx, query, requesterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*Job
	for rows.Next() {
		job, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return jobs, nil
}

// GetByID fetches a single job by its public ID.
func (s *JobStore) GetByID(ctx context.Context, id string) (*Job, bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `SELECT ` + jobSelectColumns + ` FROM jobs WHERE public_id = ? LIMIT 1`
	row := s.db.QueryRowContext(ctx, query, id)
	job, err := scanJob(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, false, nil
		}
		return nil, false, err
	}
	return job, true, nil
}

func scanJob(scanner rowScanner) (*Job, error) {
	var (
		job               Job
		description       sql.NullString
		meetingPoint      sql.NullString
		requirementsJSON  []byte
		workDate          sql.NullString
		startTime         sql.NullString
		endTime           sql.NullString
		acceptedVolunteer sql.NullString
	)

	if err := scanner.Scan(
		&job.ID,
		&job.RequesterID,
		&job.Title,
		&description,
		&meetingPoint,
		&requirementsJSON,
		&job.Location,
		&job.Latitude,
		&job.Longitude,
		&workDate,
		&startTime,
		&endTime,
		&job.Status,
		&job.DistanceKm,
		&acceptedVolunteer,
		&job.CreatedAt,
	); err != nil {
		return nil, err
	}

	job.Description = description.String
	job.MeetingPoint = meetingPoint.String
	job.Requirements = parseSlice(requirementsJSON)
	job.WorkDate = workDate.String
	job.StartTime = startTime.String
	job.EndTime = endTime.String
	job.AcceptedVolunteerID = acceptedVolunteer.String
	return &job, nil
}
