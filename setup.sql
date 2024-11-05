DROP TABLE IF EXISTS "customers";
DROP TABLE IF EXISTS "bank_account";
DROP TABLE IF EXISTS "plan_name";
DROP TABLE IF EXISTS "call_record";
DROP TABLE IF EXISTS "phone_plan";
DROP TABLE IF EXISTS "payment";

CREATE TABLE "plan_name" (
    Plan_name VARCHAR(50) PRIMARY KEY,
    Plan_cost DOUBLE PRECISION NOT NULL,
    Cost_frequency INT NOT NULL
);

CREATE TABLE "bank_account" (
    bank_account_id SERIAL PRIMARY KEY,
    Account_number INT UNIQUE NOT NULL,
    Balance INT NOT NULL,
    Bank_name VARCHAR(50) NOT NULL,
    Bank_log VARCHAR(50) NOT NULL
);

CREATE TABLE "phone_plan" (
    Plan_ID SERIAL PRIMARY KEY,
    Data_type VARCHAR(50) NOT NULL,
    Call_Minutes INT NOT NULL,
    Plan_Name VARCHAR(50) NOT NULL,
    FOREIGN KEY (Plan_Name) REFERENCES "plan_name" (Plan_name)
);

CREATE TABLE "customers" (
    Customer_ID SERIAL PRIMARY KEY,
    First_name VARCHAR(50) NOT NULL,
    Last_name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_number VARCHAR(15) UNIQUE,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bank_account_id INT NOT NULL,
    Plan_ID INT NOT NULL,
    FOREIGN KEY (bank_account_id) REFERENCES "bank_account" (bank_account_id),
    FOREIGN KEY (Plan_ID) REFERENCES "phone_plan" (Plan_ID)
);

CREATE TABLE "call_record" (
    Call_ID SERIAL PRIMARY KEY,
    Call_start TIMESTAMP,
    Call_end TIMESTAMP,
    Duration INT NOT NULL,
    Cost INT NOT NULL,
    Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Customer_ID INT NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES "customers" (Customer_ID)
);

CREATE TABLE "payment" (
    Payment_ID SERIAL PRIMARY KEY,
    Amount DOUBLE PRECISION NOT NULL,
    Payment_Date TIMESTAMP,
    Customer_ID INT NOT NULL,
    Bank_ID INT NOT NULL,
    Plan_ID INT NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES "customers" (Customer_ID),
    FOREIGN KEY (Plan_ID) REFERENCES "phone_plan" (Plan_ID)
);

CREATE TABLE "Bank_account" (
    Company_BankID SERIAL PRIMARY KEY,
    Company_Balance INT NOT NULL,
    Payment_ID INT NOT NULL,
    FOREIGN KEY (Payment_ID) REFERENCES "payment" (Payment_ID)
);

INSERT INTO "plan_name" (Plan_name, Plan_cost, Cost_frequency) VALUES 
        ('Basic', 10.99, 12),
        ('Standard', 29.99, 12),
        ('Premium', 49.99, 12);

INSERT INTO "bank_account" (Account_number, Balance, Bank_name, Bank_log)
VALUES 
(123456, 5000, 'Bank A', 'Log A'),
(234567, 10000, 'Bank B', 'Log B'),
(345678, 7500, 'Bank C', 'Log C'),
(456789, 2000, 'Bank D', 'Log D'),
(567890, 1500, 'Bank E', 'Log E');

-- Insert dummy data into phone_plan table
INSERT INTO "phone_plan" (Data_type, Call_Minutes, Plan_Name)
VALUES 
('4G', 500, 'Basic'),
('5G', 1000, 'Standard'),
('5G', 1500, 'Premium'),
('5G', 2000, 'Basic'),
('5G', 2500, 'Premium');

-- Insert dummy data into customers table
INSERT INTO "customers" (First_name, Last_name, Email, Phone_number, bank_account_id, Plan_ID)
VALUES 
('John', 'Doe', 'john.doe@example.com', '5551234567', 1, 1),
('Jane', 'Smith', 'jane.smith@example.com', '5552345678', 2, 2),
('Alice', 'Johnson', 'alice.johnson@example.com', '5553456789', 3, 3),
('Bob', 'Brown', 'bob.brown@example.com', '5554567890', 4, 4),
('Charlie', 'Davis', 'charlie.davis@example.com', '5555678901', 5, 5);

-- Insert dummy data into call_record table
INSERT INTO "call_record" (Call_start, Call_end, Duration, Cost, Customer_ID)
VALUES 
('2024-01-01 09:00:00', '2024-01-01 09:05:00', 5, 1, 1),
('2024-01-02 10:00:00', '2024-01-02 10:15:00', 15, 2, 2),
('2024-01-03 11:00:00', '2024-01-03 11:20:00', 20, 3, 3),
('2024-01-04 12:00:00', '2024-01-04 12:10:00', 10, 4, 4),
('2024-01-05 13:00:00', '2024-01-05 13:25:00', 25, 5, 5);

-- Insert dummy data into payment table
INSERT INTO "payment" (Amount, Payment_Date, Customer_ID, Bank_ID, Plan_ID)
VALUES 
(50.00, '2024-01-10', 1, 1, 1),
(75.00, '2024-01-11', 2, 2, 2),
(100.00, '2024-01-12', 3, 3, 3),
(125.00, '2024-01-13', 4, 4, 4),
(150.00, '2024-01-14', 5, 5, 5);

-- Insert dummy data into Bank_account table (company bank table)
INSERT INTO "Bank_account" (Company_Balance, Payment_ID)
VALUES 
(10000, 1),
(15000, 2),
(20000, 3),
(25000, 4),
(30000, 5);