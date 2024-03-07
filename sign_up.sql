-- Create the database
CREATE DATABASE user_signup;

-- Select the database  
USE user_signup;

-- Create users table
CREATE TABLE users (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE, 
  password VARCHAR(255) NOT NULL
);
