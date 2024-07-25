
-- Creates database called capstone
CREATE DATABASE capstone;

-- Creates a user table
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
last_login TIMESTAMP
);

-- Add's more column to user table
ALTER TABLE users ADD COLUMN name VARCHAR(255);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN role VARCHAR(50);
