-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hris_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Job postings table will be created by SQLAlchemy
-- This file contains any additional database setup if needed

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_date_posted ON job_postings(date_posted DESC);
