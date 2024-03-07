-- Create the database
CREATE DATABASE user_signup;

-- Select the database  
USE user_signup;

-- Create users table
CREATE TABLE users (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE, 
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- Create an index on email column for faster searches
CREATE INDEX index_email ON users (email);

-- Add some test data
INSERT INTO users (name, email, password) 
VALUES
  ('John Doe', 'john@email.com', 'password1'),
  ('Sarah Smith', 'sarah@email.com', 'password123');