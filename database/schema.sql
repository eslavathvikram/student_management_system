-- Student Management System - Database Schema (MySQL 8)
CREATE DATABASE IF NOT EXISTS student_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_db;

CREATE TABLE IF NOT EXISTS students (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  VARCHAR(20)  NOT NULL UNIQUE,         -- roll / registration number
  name        VARCHAR(100) NOT NULL,
  department  VARCHAR(50)  NOT NULL,
  email       VARCHAR(120) NOT NULL UNIQUE,
  phone       VARCHAR(15)  NOT NULL,
  year        TINYINT      NULL CHECK (year BETWEEN 1 AND 4),
  semester    TINYINT      NULL CHECK (semester BETWEEN 1 AND 8),
  cgpa        DECIMAL(4,2) NULL CHECK (cgpa BETWEEN 0 AND 10),
  attendance  DECIMAL(5,2) NULL CHECK (attendance BETWEEN 0 AND 100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_name (name)
) ENGINE=InnoDB;
