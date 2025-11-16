-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    role ENUM('volunteer', 'requester') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(13) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    skills TEXT, -- JSON array
    biography TEXT,
    disability_type VARCHAR(50),
    additional_needs TEXT, -- JSON array
    rating DECIMAL(3,2) DEFAULT 0.00,
    completed_jobs INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_national_id (national_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    requester_id VARCHAR(36) NOT NULL,
    work_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255) NOT NULL,
    distance_km DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('open', 'completed', 'cancelled') DEFAULT 'open',
    accepted_volunteer_id VARCHAR(36),
    description TEXT NOT NULL,
    meeting_point VARCHAR(255) NOT NULL,
    requirements TEXT, -- JSON array
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    requester_rating INT,
    requester_review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (accepted_volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status),
    INDEX idx_accepted_volunteer_id (accepted_volunteer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_volunteer (job_id, volunteer_id),
    INDEX idx_job_id (job_id),
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

