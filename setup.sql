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
    Company_Balance FLOAT NOT NULL,
    Customer_ID INT NOT NULL,
    Bank_ID INT NOT NULL,
    Plan_ID INT NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES "customers" (Customer_ID),
    FOREIGN KEY (Plan_ID) REFERENCES "phone_plan" (Plan_ID)
);


-- Insert data into plan_name table
INSERT INTO "plan_name" (Plan_name, Plan_cost, Cost_frequency) VALUES 
    ('Basic', 10.99, 12),
    ('Standard', 29.99, 12),
    ('Premium', 49.99, 12);

-- Insert data into bank_account table
INSERT INTO "bank_account" (Account_number, Balance, Bank_name, Bank_log) VALUES
    (100, 1000, 'Bank A', '+1000'),
    (101, 1500, 'Bank B', '+1500'),
    (102, 2000, 'Bank C', '+2000'),
    (103, 2500, 'Bank D', '+2500'),
    (104, 3000, 'Bank E', '+3000'),
    (105, 3500, 'Bank F', '+3500'),
    (106, 4000, 'Bank G', '+4000'),
    (107, 4500, 'Bank H', '+4500'),
    (108, 5000, 'Bank I', '+5000'),
    (109, 5500, 'Bank J', '+5500');

-- Insert data into phone_plan table
INSERT INTO "phone_plan" (Data_type, Call_Minutes, Plan_Name) VALUES
    ('4G', 300, 'Basic'),
    ('4G', 600, 'Standard'),
    ('5G', 1200, 'Premium'),
    ('4G', 300, 'Basic'),
    ('4G', 600, 'Standard'),
    ('5G', 1200, 'Premium'),
    ('4G', 300, 'Basic'),
    ('4G', 600, 'Standard'),
    ('5G', 1200, 'Premium'),
    ('4G', 300, 'Basic');

-- Insert data into customers table (Account_number and Plan_ID should match entries in bank_account and phone_plan)
INSERT INTO "customers" (First_name, Last_name, Email, Phone_number, bank_account_id, Plan_ID) VALUES
    ('Alice', 'Anderson', 'alice.anderson@example.com', '(123)-456-7890', 1, 1),
    ('Bob', 'Brown', 'bob.brown@example.com', '(234)-567-8901', 2, 2),
    ('Charlie', 'Clark', 'charlie.clark@example.com', '(345)-678-9012', 3, 3),
    ('Diana', 'Davis', 'diana.davis@example.com', '(456)-789-0123', 4, 4),
    ('Evan', 'Evans', 'evan.evans@example.com', '(567)-890-1234', 5, 5),
    ('Fay', 'Foster', 'fay.foster@example.com', '(678)-901-2345', 6, 6),
    ('George', 'Green', 'george.green@example.com', '(789)-012-3456', 7, 7),
    ('Holly', 'Hall', 'holly.hall@example.com', '(890)-123-4567', 8, 8),
    ('Ian', 'Irwin', 'ian.irwin@example.com', '(901)-234-5678', 9, 9);

-- Insert data into call_record table
INSERT INTO call_record (Call_start, Call_End, Duration, Cost, Date, Customer_ID)
VALUES
    ('2023-10-01 08:15:00', '2023-10-01 08:45:00', 30, 2.50, '2023-10-01', 1),
    ('2023-10-01 09:20:00', '2023-10-01 09:35:00', 15, 1.25, '2023-10-01', 2),
    ('2023-10-02 10:05:00', '2023-10-02 10:50:00', 45, 3.75, '2023-10-02', 3),
    ('2023-10-02 14:35:00', '2023-10-02 15:00:00', 25, 2.10, '2023-10-02', 4),
    ('2023-10-03 16:45:00', '2023-10-03 17:00:00', 15, 1.20, '2023-10-03', 5),
    ('2023-10-04 11:30:00', '2023-10-04 12:15:00', 45, 3.60, '2023-10-04', 6),
    ('2023-10-04 18:10:00', '2023-10-04 18:35:00', 25, 2.15, '2023-10-04', 7),
    ('2023-10-05 09:50:00', '2023-10-05 10:20:00', 30, 2.50, '2023-10-05', 8),
    ('2023-10-05 13:25:00', '2023-10-05 13:45:00', 20, 1.65, '2023-10-05', 9),
    ('2023-10-06 07:40:00', '2023-10-06 08:10:00', 30, 2.50, '2023-10-06', 1),
    ('2023-10-06 20:15:00', '2023-10-06 20:30:00', 15, 1.25, '2023-10-06', 2),
    ('2023-10-07 15:55:00', '2023-10-07 16:20:00', 25, 2.10, '2023-10-07', 3),
    ('2023-10-07 21:00:00', '2023-10-07 21:45:00', 45, 3.75, '2023-10-07', 4),
    ('2023-10-08 06:30:00', '2023-10-08 07:00:00', 30, 2.50, '2023-10-08', 5),
    ('2023-10-08 19:45:00', '2023-10-08 20:00:00', 15, 1.25, '2023-10-08', 6);

-- Insert data into payment table with values for company_balance
INSERT INTO payment (Amount, Payment_Date, company_balance, Customer_ID, Bank_ID, Plan_ID)
VALUES
    (10.99, '2023-10-01', 1010.99, 1, 1, 1),
    (29.99, '2023-10-02', 1040.98, 2, 2, 2),
    (49.99, '2023-10-03', 1090.97, 3, 3, 3),
    (10.99, '2023-10-04', 1101.96, 4, 4, 4),
    (29.99, '2023-10-05', 1131.95, 5, 5, 5),
    (49.99, '2023-10-06', 1181.94, 6, 6, 6),
    (10.99, '2023-10-07', 1192.93, 7, 7, 7),
    (29.99, '2023-10-08', 1222.92, 8, 8, 8),
    (49.99, '2023-10-09', 1272.91, 9, 9, 9);