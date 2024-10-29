-- Drop the table if it already exists
DROP TABLE IF EXISTS "users";

-- Create the user table with necessary columns
CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
