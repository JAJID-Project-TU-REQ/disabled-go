package main

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

// JobApplication represents a volunteer applying to a job posting.
type JobApplication struct {
	ID          string    `json:"id"`
	JobID       string    `json:"jobId"`
	VolunteerID string    `json:"volunteerId"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// JobApplicationStore persists job applications in MySQL.
type JobApplicationStore struct {
	db *sql.DB
}

var (
	applicationStore            *JobApplicationStore
	errApplicationAlreadyExists = errors.New("application already exists")
)

const createApplicationsTableSQL = `
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) NOT NULL UNIQUE,
    job_public_id VARCHAR(64) NOT NULL,
    volunteer_public_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_job_volunteer (job_public_id, volunteer_public_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`

// NewJobApplicationStore builds a store backed by db.
func NewJobApplicationStore(db *sql.DB) *JobApplicationStore {
	return &JobApplicationStore{db: db}
}

// Setup ensures the job_applications table exists.
func (s *JobApplicationStore) Setup(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, createApplicationsTableSQL)
	return err
}

// Create inserts a new application row.
func (s *JobApplicationStore) Create(ctx context.Context, jobID, volunteerID string) (*JobApplication, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	application := &JobApplication{
		ID:          uuid.NewString(),
		JobID:       jobID,
		VolunteerID: volunteerID,
		Status:      "pending",
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}

	const insertSQL = `INSERT INTO job_applications (public_id, job_public_id, volunteer_public_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`

	if _, err := s.db.ExecContext(ctx, insertSQL, application.ID, application.JobID, application.VolunteerID, application.Status, application.CreatedAt, application.UpdatedAt); err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return nil, errApplicationAlreadyExists
		}
		return nil, err
	}

	return application, nil
}

// ListByJob returns every application for the supplied job.
func (s *JobApplicationStore) ListByJob(ctx context.Context, jobID string) ([]*JobApplication, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `SELECT public_id, job_public_id, volunteer_public_id, status, created_at, updated_at FROM job_applications WHERE job_public_id = ? ORDER BY created_at ASC`
	rows, err := s.db.QueryContext(ctx, query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var applications []*JobApplication
	for rows.Next() {
		app, err := scanJobApplication(rows)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return applications, nil
}

// GetByID fetches a single application by its public id.
func (s *JobApplicationStore) GetByID(ctx context.Context, id string) (*JobApplication, bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `SELECT public_id, job_public_id, volunteer_public_id, status, created_at, updated_at FROM job_applications WHERE public_id = ? LIMIT 1`
	row := s.db.QueryRowContext(ctx, query, id)
	app, err := scanJobApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return app, true, nil
}

// UpdateStatus sets the status of a specific application.
func (s *JobApplicationStore) UpdateStatus(ctx context.Context, id, status string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `UPDATE job_applications SET status = ?, updated_at = ? WHERE public_id = ?`
	_, err := s.db.ExecContext(ctx, query, status, time.Now().UTC(), id)
	return err
}

// RejectOtherPending marks other pending applications for the job as rejected.
func (s *JobApplicationStore) RejectOtherPending(ctx context.Context, jobID, exceptID string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	const query = `UPDATE job_applications SET status = 'rejected', updated_at = ? WHERE job_public_id = ? AND public_id <> ? AND status = 'pending'`
	_, err := s.db.ExecContext(ctx, query, time.Now().UTC(), jobID, exceptID)
	return err
}

func scanJobApplication(scanner rowScanner) (*JobApplication, error) {
	var app JobApplication
	if err := scanner.Scan(&app.ID, &app.JobID, &app.VolunteerID, &app.Status, &app.CreatedAt, &app.UpdatedAt); err != nil {
		return nil, err
	}
	return &app, nil
}
