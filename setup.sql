DROP TABLE IF EXISTS "customer";
DROP TABLE IF EXISTS "bank_account";
DROP TABLE IF EXISTS "plan";
DROP TABLE IF EXISTS "call_record";
DROP TABLE IF EXISTS "payment";
DROP TABLE IF EXISTS "transaction"; 


CREATE TABLE "bank_account" (
    Account_number INT PRIMARY KEY, 
    Balance INT NOT NULL,
    Bank_name CHAR(50) NOT NULL,
    Bank_log CHAR(50) NOT NULL,
    Customer_ID INT UNIQUE NOT NULL, 
    FOREIGN KEY (Customer_ID) REFERENCES "customer" (Customer_ID) ON DELETE CASCADE
);

CREATE TABLE "plan" (
    Plan_ID SERIAL PRIMARY KEY, 
    Plan_Name CHAR(50) NOT NULL, 
    Data_type CHAR(5) NOT NULL, 
    Call_Minutes INT NOT NULL, 
    Data_Limit DOUBLE PRECISION DEFAULT 0.0, -- Data limit in MB
    Data_Overage_Cost DOUBLE PRECISION DEFAULT 0.0, -- Cost per MB over the limit
    Plan_Cost DOUBLE PRECISION NOT NULL, -- Cost of the plan
    Cost_Frequency INT NOT NULL, 
    Plan_Type CHAR(10) NOT NULL CHECK (Plan_Type IN ('Prepaid', 'Postpaid')) 
);

CREATE TABLE "customer" (
    Customer_ID SERIAL PRIMARY KEY,
    First_name CHAR(50) NOT NULL,
    Last_name CHAR(50) NOT NULL,
    Email CHAR(100) UNIQUE NOT NULL,
    Phone_number CHAR(20) UNIQUE NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Is_Busy BOOLEAN, 
    Plan_ID INT NOT NULL,
    Bill_Amount DOUBLE PRECISION DEFAULT 0.0,
    Billing_Status CHAR(10) DEFAULT 'Unpaid' CHECK (Billing_Status IN ('Paid', 'Unpaid')),
    FOREIGN KEY (Plan_ID) REFERENCES "plan" (Plan_ID)
);

CREATE TABLE "call_record" (
    Phone_number CHAR(15), 
    Call_start TIMESTAMP,  
    Call_end TIMESTAMP,
    Duration INT NOT NULL, 
    Data_Usage DOUBLE PRECISION DEFAULT 0.0, 
    Cost DOUBLE PRECISION NOT NULL,
    Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Phone_number, Call_start), 
    FOREIGN KEY (Phone_number) REFERENCES "customer" (Phone_number)
);


CREATE TABLE "payment" (
    Payment_ID SERIAL PRIMARY KEY,
    Amount DOUBLE PRECISION NOT NULL,
    Payment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Payment_Type CHAR(10) NOT NULL CHECK (Payment_Type IN ('Automatic', 'Manual')),
    Card_Type CHAR(10) NOT NULL CHECK (Card_Type IN ('Credit', 'Debit')),
    Card_Number CHAR(16) NOT NULL,
    Company_Balance DOUBLE PRECISION NOT NULL,
    Customer_ID INT NOT NULL,
    Plan_ID INT NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES "customer" (Customer_ID),
    FOREIGN KEY (Plan_ID) REFERENCES "phone_plan" (Plan_ID)
);

CREATE TABLE "transaction" (
    Transaction_ID SERIAL PRIMARY KEY, 
    Transaction_Type CHAR(15) NOT NULL CHECK (Transaction_Type IN ('Payment', 'Call', 'Data Usage', 'Plan Change')), -- Type of transaction
    Transaction_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    Transaction_Duration BIGINT NOT NULL, -- Duration of the transaction in milliseconds
    Customer_ID INT NOT NULL, 
    Related_Entity_ID INT, 
    FOREIGN KEY (Customer_ID) REFERENCES "customer" (Customer_ID)
);