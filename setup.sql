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
    Account_number SERIAL PRIMARY KEY,
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
    Account_number INT NOT NULL,
    Plan_ID INT NOT NULL,
    FOREIGN KEY (Account_number) REFERENCES "bank_account" (Account_number),
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