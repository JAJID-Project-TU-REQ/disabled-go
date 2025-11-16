package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

// User represents a user record persisted in MySQL. Fields match frontend `UserProfile`.
type User struct {
	ID              string    `json:"id"`
	Role            string    `json:"role"`
	FirstName       string    `json:"firstName"`
	LastName        string    `json:"lastName"`
	NationalID      string    `json:"nationalId"`
	Phone           string    `json:"phone"`
	Email           string    `json:"email,omitempty"`
	Address         string    `json:"address,omitempty"`
	Skills          []string  `json:"skills"`
	Biography       string    `json:"biography"`
	DisabilityType  string    `json:"disabilityType,omitempty"`
	AdditionalNeeds []string  `json:"additionalNeeds,omitempty"`
	Interests       []string  `json:"interests"`
	Rating          float64   `json:"rating"`
	CompletedJobs   int       `json:"completedJobs"`
	CreatedAt       time.Time `json:"createdAt"`
	PasswordHash    string    `json:"-"`
}

// UserStore persists users in MySQL.
type UserStore struct {
	db *sql.DB
}

// global store used by handlers, initialized in main.
var userStore *UserStore

// ErrUserExists is returned when trying to create a user with an existing national ID.
var ErrUserExists = errors.New("user already exists")

const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(32) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(255),
    skills JSON NOT NULL,
    biography TEXT,
    disability_type VARCHAR(100),
    additional_needs JSON NOT NULL,
    interests JSON NOT NULL,
    rating DOUBLE NOT NULL DEFAULT 0,
    completed_jobs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`

// NewUserStore creates a store backed by the provided DB connection.
func NewUserStore(db *sql.DB) *UserStore {
	return &UserStore{db: db}
}

// Setup ensures the users table exists.
func (s *UserStore) Setup(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, createUsersTableSQL)
	return err
}

// Create stores a new user. Returns error if national ID already exists.
func (s *UserStore) Create(u *User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if u.ID == "" {
		u.ID = uuid.NewString()
	}
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now().UTC()
	}
	u.Skills = normalizeSlice(u.Skills)
	u.AdditionalNeeds = normalizeSlice(u.AdditionalNeeds)
	u.Interests = normalizeSlice(u.Interests)

	skillsJSON, err := json.Marshal(u.Skills)
	if err != nil {
		return err
	}
	addNeedsJSON, err := json.Marshal(u.AdditionalNeeds)
	if err != nil {
		return err
	}
	interestsJSON, err := json.Marshal(u.Interests)
	if err != nil {
		return err
	}

	const insertSQL = `INSERT INTO users (public_id, role, first_name, last_name, national_id, phone, email, address, skills, biography, disability_type, additional_needs, interests, rating, completed_jobs, created_at, password_hash)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = s.db.ExecContext(
		ctx,
		insertSQL,
		u.ID,
		u.Role,
		u.FirstName,
		u.LastName,
		u.NationalID,
		u.Phone,
		nullIfEmpty(u.Email),
		nullIfEmpty(u.Address),
		string(skillsJSON),
		nullIfEmpty(u.Biography),
		nullIfEmpty(u.DisabilityType),
		string(addNeedsJSON),
		string(interestsJSON),
		u.Rating,
		u.CompletedJobs,
		u.CreatedAt,
		u.PasswordHash,
	)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return ErrUserExists
		}
		return err
	}
	return nil
}

// GetByNationalID retrieves a user by national ID.
func (s *UserStore) GetByNationalID(nationalID string) (*User, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	const query = `SELECT public_id, role, first_name, last_name, national_id, phone, email, address, skills, biography, disability_type, additional_needs, interests, rating, completed_jobs, created_at, password_hash FROM users WHERE national_id = ? LIMIT 1`

	row := s.db.QueryRowContext(ctx, query, nationalID)
	user, err := scanUserRow(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return user, true, nil
}

// GetByID retrieves a user by their public ID.
func (s *UserStore) GetByID(id string) (*User, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	const query = `SELECT public_id, role, first_name, last_name, national_id, phone, email, address, skills, biography, disability_type, additional_needs, interests, rating, completed_jobs, created_at, password_hash FROM users WHERE public_id = ? LIMIT 1`
	row := s.db.QueryRowContext(ctx, query, id)
	user, err := scanUserRow(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return user, true, nil
}

func scanUserRow(row *sql.Row) (*User, error) {
	var (
		email          sql.NullString
		address        sql.NullString
		biography      sql.NullString
		disabilityType sql.NullString
		skillsRaw      []byte
		addNeedsRaw    []byte
		interestsRaw   []byte
		user           User
	)

	if err := row.Scan(
		&user.ID,
		&user.Role,
		&user.FirstName,
		&user.LastName,
		&user.NationalID,
		&user.Phone,
		&email,
		&address,
		&skillsRaw,
		&biography,
		&disabilityType,
		&addNeedsRaw,
		&interestsRaw,
		&user.Rating,
		&user.CompletedJobs,
		&user.CreatedAt,
		&user.PasswordHash,
	); err != nil {
		return nil, err
	}

	user.Email = email.String
	user.Address = address.String
	user.Biography = biography.String
	user.DisabilityType = disabilityType.String
	user.Skills = parseSlice(skillsRaw)
	user.AdditionalNeeds = parseSlice(addNeedsRaw)
	user.Interests = parseSlice(interestsRaw)
	return &user, nil
}

func normalizeSlice(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}

func parseSlice(raw []byte) []string {
	if len(raw) == 0 {
		return []string{}
	}
	var result []string
	if err := json.Unmarshal(raw, &result); err != nil {
		return []string{}
	}
	return result
}

func nullIfEmpty(value string) sql.NullString {
	if value == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: value, Valid: true}
}
