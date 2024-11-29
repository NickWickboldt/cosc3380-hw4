const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const { faker } = require("@faker-js/faker");
const { start } = require("repl");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

let pool;

async function connectOrCreateDatabase() {
  try {
    pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "phone_company",
      password: "8508",
      port: 5432,
    });

    // Test the connection
    const client = await pool.connect();
    client.release(); // Release immediately after testing the connection
    console.log("Connected to existing 'phone_company' database.");
  } catch (error) {
    // If connection fails, create the database
    console.error(
      "Database 'phone_company' does not exist. Attempting to create it..."
    );
    await createDatabase(); // Call createDatabase function to create the database

    pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "phone_company",
      password: "8508",
      port: 5432,
    });

    console.log("Connected to new 'phone_company' database.");
  }
}

async function createDatabase() {
  const defaultPool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "8508",
    port: 5432,
  });

  try {
    const client = await defaultPool.connect();

    await client.query(`CREATE DATABASE phone_company`);
    console.log("Database 'phone_company' created successfully.");
  } catch (error) {
    console.error("Error creating database:", error);
    throw error;
  } finally {
    await defaultPool.end();
  }
}

connectOrCreateDatabase()
  .then(() => {
    console.log("Database setup complete.");
  })
  .catch((error) => console.error("Database setup failed:", error));

app.put("/create_tables", async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Drop tables if they exist
      await client.query(`
        DROP TABLE IF EXISTS "bank_account";
        DROP TABLE IF EXISTS "call_record";
        DROP TABLE IF EXISTS "payment";
        DROP TABLE IF EXISTS "transaction";
        DROP TABLE IF EXISTS "customer";
        DROP TABLE IF EXISTS "plan";
      `);

      // Create tables
      await client.query(`
        CREATE TABLE "plan" (
          Plan_ID SERIAL PRIMARY KEY, 
          Plan_Name CHAR(50) NOT NULL, 
          Data_type CHAR(5) NOT NULL, 
          Call_Minutes INT NOT NULL, 
          Data_Limit DOUBLE PRECISION DEFAULT 0.0,
          Data_Overage_Cost DOUBLE PRECISION DEFAULT 0.0,
          Plan_Cost DOUBLE PRECISION NOT NULL,
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

        CREATE TABLE "bank_account" (
          Account_number INT PRIMARY KEY, 
          Balance INT NOT NULL,
          Bank_name CHAR(50) NOT NULL,
          Bank_log CHAR(50) NOT NULL,
          Customer_ID INT UNIQUE NOT NULL,
          FOREIGN KEY (Customer_ID) REFERENCES "customer" (Customer_ID) ON DELETE CASCADE
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
          FOREIGN KEY (Plan_ID) REFERENCES "plan" (Plan_ID)
        );

        CREATE TABLE "transaction" (
          Transaction_ID SERIAL PRIMARY KEY, 
          Transaction_Type CHAR(20) NOT NULL,
          Transaction_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
          Transaction_Duration BIGINT NOT NULL,
          Customer_ID INT NOT NULL
        );
      `);

      await client.query("COMMIT");
      console.log("Tables created successfully!");
      res.sendStatus(200);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error creating tables:", err);
      res.sendStatus(500);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in setup process:", err);
    res.sendStatus(500);
  }
});

app.put("/initialize_tables", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Truncate all tables to clear data
    await client.query(`
      TRUNCATE TABLE "call_record" CASCADE;
      TRUNCATE TABLE "payment" CASCADE;
      TRUNCATE TABLE "bank_account" CASCADE;
      TRUNCATE TABLE "plan" CASCADE;
      TRUNCATE TABLE "transaction" CASCADE;
      TRUNCATE TABLE "customer" CASCADE;
    `);

    const plans = [
      ["Basic Plan", "4G", 500, 1024, 0.05, 30.0, 12, "Prepaid"],
      ["Unlimited Plan", "5G", 10000, 4096, 0.0, 75.0, 12, "Postpaid"], 
      ["Family Plan", "4G", 5000, 4096, 0.02, 500.0, 1, "Postpaid"],
    ];

    // Insert data into plan table
    for (const plan of plans) {
      await client.query(
        `INSERT INTO plan (Plan_Name, Data_type, Call_Minutes, Data_Limit, Data_Overage_Cost, Plan_Cost, Cost_Frequency, Plan_Type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        plan
      );
    }

    // Generate unique account numbers
    const accountNumbers = [];
    for (let i = 0; i < 100; i++) {
      let accountNumber = faker.number.int({ min: 100000000, max: 999999999 });
      while (accountNumbers.includes(accountNumber)) {
        accountNumber = faker.number.int({ min: 100000000, max: 999999999 });
      }
      accountNumbers.push(accountNumber);
    }

    /// Insert customers and generate bank accounts
    const customerData = [];
    let phoneNumbers = [];
    for (let i = 0; i < 100; i++) {
      // Insert customer
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      let phoneNumber = faker.number
        .int({ min: 1111111111, max: 9999999999 })
        .toString();
      while (phoneNumbers.includes(phoneNumber)) {
        phoneNumber = faker.number
          .int({ min: 1111111111, max: 9999999999 })
          .toString();
      }
      phoneNumbers.push(phoneNumber);

      const accountNumber = faker.number.int({
        min: 100000000,
        max: 999999999,
      });

      const createdAt = faker.date.past({ years: 2 });
      const planId = Math.floor(Math.random() * 3) + 1; // Random plan ID between 1 and 3
      let billAmount = faker.number.float({ min: 0, max: 100 });
      billAmount = Number(billAmount.toFixed(2));
      const billingStatus = faker.helpers.arrayElement(["Paid", "Unpaid"]);

      const result = await client.query(
        `INSERT INTO customer (First_name, Last_name, Email, Phone_number, Created_at, Is_Busy, Plan_ID, Bill_Amount, Billing_Status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING Customer_ID`,
        [
          firstName,
          lastName,
          email,
          phoneNumber,
          createdAt,
          false,
          planId,
          billAmount,
          billingStatus,
        ]
      );

      // Store customer data for later use
      const customerId = result.rows[0].customer_id;
      customerData.push({
        Customer_ID: customerId,
        Phone_number: phoneNumber,
        Plan_ID: planId
      });

      // Insert corresponding bank account
      const balance = faker.number.int({ min: 0, max: 10000 });
      const bankName = faker.company.name();
      const bankLog = faker.lorem.words(3);

      await client.query(
        `INSERT INTO bank_account (Account_number, Balance, Bank_name, Bank_log, Customer_ID) 
        VALUES ($1, $2, $3, $4, $5)`,
        [accountNumber, balance, bankName, bankLog, customerId]
      );
    }

    // Insert 100 call records
    for (let i = 0; i < 100; i++) {
      const callStart = faker.date.recent({ days: 30 }); // Call within the last 30 days
      const duration = faker.number.int({ min: 30, max: 3600 }); // Call duration between 30 seconds and 1 hour
      const callEnd = new Date(callStart.getTime() + duration * 1000); // Add duration in seconds
      const dataUsage = faker.number.float({ min: 0, max: 50 }); // Random data usage in MB
      const cost = Number(faker.number.float({ min: 0.1, max: 10 }).toFixed(2)); // Call cost between $0.1 and $10

      await client.query(
        `INSERT INTO call_record (Phone_number, Call_start, Call_end, Duration, Data_Usage, Cost, Date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          faker.helpers.arrayElement(phoneNumbers),
          callStart,
          callEnd,
          duration,
          dataUsage,
          cost,
          new Date(),
        ]
      );
    }

    // Insert 100 payment records
    for (let i = 0; i < 100; i++) {
      const customer = faker.helpers.arrayElement(customerData);
      const amount = Number(
        faker.number.float({ min: 5, max: 200 }).toFixed(2)
      ); // Payment amount
      const paymentDate = faker.date.recent({ days: 60 }); // Payment in the last 60 days
      const paymentType = faker.helpers.arrayElement(["Automatic", "Manual"]);
      const cardType = faker.helpers.arrayElement(["Credit", "Debit"]);
      const cardNumber = faker.number
        .int({ min: 1000000000000000, max: 9999999999999999 })
        .toString();

      await client.query(
        `INSERT INTO payment (Amount, Payment_Date, Payment_Type, Card_Type, Card_Number, Company_Balance, Customer_ID, Plan_ID) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          amount,
          paymentDate,
          paymentType,
          cardType,
          cardNumber,
          Number(faker.number.float({ min: 1000, max: 10000 }).toFixed(2)), // Company balance
          customer.Customer_ID,
          customer.Plan_ID,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("Initial data inserted successfully!");
    res.sendStatus(200);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting initial data:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.get("/customer", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customer");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/banks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bank_account");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/phone_plans", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM plan");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/call_record", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM call_record");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/payment", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payment");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/transaction", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transaction");
    res.json(result.rows); 
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500); 
  }
}); 

app.get("/minutes_cost/:minutes_cost_customer_id", async (req, res) => {
  const { minutes_cost_customer_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        c.Customer_ID,
        c.First_name,
        c.Last_name,
        c.Bill_Amount,
        p.Plan_Cost,
        p.Cost_Frequency,
        ROUND((c.Bill_Amount / p.Plan_Cost) * p.Call_Minutes) AS Used_Minutes
      FROM
        customer c
      JOIN
        plan p ON c.Plan_ID = p.Plan_ID
      WHERE
        c.Customer_ID = $1;
      `,
      [minutes_cost_customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Customer not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching minutes and cost:", err.message);
    res.sendStatus(500);
  }
});


app.get("/customer_standing", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.Customer_ID,
        c.First_name || ' ' || c.Last_name AS Customer_Name,
        ba.Balance,
        p.Plan_Cost,
        p.Cost_Frequency,
        FLOOR(ba.Balance / p.Plan_Cost) AS Affordable_Months,
        CASE
          WHEN ba.Balance < p.Plan_Cost THEN 'Low Balance'
          WHEN ba.Balance < p.Plan_Cost * 3 THEN 'Warning'
          ELSE 'Good Standing'
        END AS Account_Status
      FROM
        customer c
      JOIN
        bank_account ba ON c.Customer_ID = ba.Customer_ID
      JOIN
        plan p ON c.Plan_ID = p.Plan_ID
      ORDER BY
        Affordable_Months ASC;
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customer standings:", err.message);
    res.sendStatus(500);
  }
});


app.get("/monthly_revenue", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.Plan_Name,
        COUNT(c.Customer_ID) AS Number_of_Customers,
        p.Plan_Cost AS Cost_per_Customer,
        COUNT(c.Customer_ID) * p.Plan_Cost AS Monthly_Revenue_per_Plan,
        SUM(COUNT(c.Customer_ID) * p.Plan_Cost) OVER () AS Total_Monthly_Revenue
      FROM
        plan p
      LEFT JOIN
        customer c ON p.Plan_ID = c.Plan_ID
      GROUP BY
        p.Plan_ID, p.Plan_Name, p.Plan_Cost
      ORDER BY
        Monthly_Revenue_per_Plan DESC;
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching monthly revenue:", err.message);
    res.sendStatus(500);
  }
});

app.get("/billing_status/:customer_id", async (req, res) => {
  const { customer_id } = req.params;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT Billing_Status, Bill_Amount
      FROM customer
      WHERE Customer_ID = $1
      `,
      [customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Customer not found");
    }

    const { billing_status, bill_amount } = result.rows[0];
    res.status(200).json({ billing_status, bill_amount }); // Return as JSON
  } catch (err) {
    console.error("Error fetching billing status:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.put("/make_payment/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  let {
    make_payment_amount,
    make_payment_card_type,
    make_payment_card_number    
  } = req.body; 

  let payment_type = "Manual"
  make_payment_amount = Number(make_payment_amount);
  if (isNaN(make_payment_amount) || make_payment_amount <= 0) {
    return res.status(400).send("Invalid payment amount. Must be a positive number.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const startTime = Date.now()

    const customerResult = await client.query(
      `
      SELECT 
        c.Bill_Amount,
        ba.Balance,
        p.Plan_ID
      FROM 
        customer c
      JOIN 
        bank_account ba ON c.Customer_ID = ba.Customer_ID
      JOIN 
        plan p ON c.Plan_ID = p.Plan_ID
      WHERE 
        c.Customer_ID = $1
      `,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    const { bill_amount: Bill_Amount, balance: Balance, plan_id: Plan_ID } = customerResult.rows[0];

    if (make_payment_amount > Balance) {
      await client.query("ROLLBACK");
      return res.status(400).send("Insufficient funds in bank account.");
    }

    const newBillAmount = Bill_Amount - make_payment_amount;
    const newBillingStatus = newBillAmount <= 0 ? "Paid" : "Unpaid";

    await client.query(
      `
      UPDATE customer 
      SET Bill_Amount = $1, Billing_Status = $2
      WHERE Customer_ID = $3
      `,
      [Math.max(newBillAmount, 0), newBillingStatus, customer_id]
    );

    const newBalance = Balance - make_payment_amount;
    await client.query(
      `
      UPDATE bank_account 
      SET Balance = $1
      WHERE Customer_ID = $2
      `,
      [newBalance, customer_id]
    );

    await client.query(
      `
      INSERT INTO payment (
        Amount,
        Payment_Date,
        Payment_Type,
        Card_Type,
        Card_Number,
        Company_Balance,
        Customer_ID,
        Plan_ID
      )
      VALUES ($1, DEFAULT, $2, $3, $4, $5, $6, $7)
      `,
      [make_payment_amount, payment_type, make_payment_card_type, make_payment_card_number, newBalance, customer_id, Plan_ID]
    );

    await client.query("COMMIT");
    const endTime = Date.now()
    logTransaction("Customer Payment", endTime - startTime, customer_id)
    res.status(200).send("Payment successfully processed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error processing payment:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});



app.put("/update_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  let {
    update_first_name,
    update_last_name,
    update_email,
    update_phone_number,
    update_account_number,
    update_plan_id,
  } = req.body;

  update_plan_id = Number(update_plan_id)

  const client = await pool.connect();

  try {
    
    await client.query("BEGIN");
    const startTime = Date.now()

    // Step 1: Check if the customer exists
    const customerResult = await client.query(
      `SELECT Customer_ID FROM customer WHERE Customer_ID = $1`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    // Step 2: Update the bank_account table with the new account number
    await client.query(
      `UPDATE bank_account
       SET Account_number = $1
       WHERE Customer_ID = $2`,
      [update_account_number, customer_id]
    );

    // Step 3: Update the customer table with the new values
    await client.query(
      `UPDATE customer
       SET First_name = $1, Last_name = $2, Email = $3, 
           Phone_number = $4, Plan_ID = $5
       WHERE Customer_ID = $6`,
      [
        update_first_name,
        update_last_name,
        update_email,
        update_phone_number,
        update_plan_id,
        customer_id,
      ]
    );

    // Commit transaction
    await client.query("COMMIT");
    const endTime = Date.now()
    logTransaction("Update Customer", endTime - startTime, customer_id)
    res.sendStatus(200);
    console.log("Successfully updated customer and related entries.");
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error updating customer:", err.message);
    res.sendStatus(500);
  } finally {
    client.release(); // Release the client back to the pool
  }
});


app.delete("/delete_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  const client = await pool.connect();

  try {
    const startTime = Date.now()
    await client.query("BEGIN");

    // Check if the customer exists
    const customerResult = await client.query(
      `SELECT Customer_ID FROM customer WHERE Customer_ID = $1`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    // Delete associated call records
    await client.query(
      `DELETE FROM call_record WHERE Phone_number = (
         SELECT Phone_number FROM customer WHERE Customer_ID = $1
       )`,
      [customer_id]
    );

    // Delete associated payments
    await client.query(
      `DELETE FROM payment WHERE Customer_ID = $1`,
      [customer_id]
    );

    // Delete the customer
    await client.query(
      `DELETE FROM customer WHERE Customer_ID = $1`,
      [customer_id]
    );

    await client.query("COMMIT");
    const endTime = Date.now()
    res.sendStatus(200); 
    logTransaction("Delete Customer", endTime - startTime, customer_id)
    console.log(`Successfully deleted customer with ID ${customer_id} and all associated records.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting customer:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});


app.delete("/delete_all_customers", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const startTime = Date.now()

    await client.query(
      `DELETE FROM call_record
       WHERE Phone_number IN (SELECT Phone_number FROM customer)`
    );

    await client.query(
      `DELETE FROM payment
       WHERE Customer_ID IN (SELECT Customer_ID FROM customer)`
    );

    await client.query(
      `DELETE FROM customer`
    );

    await client.query("COMMIT");
    const endTime = Date.now()
    logTransaction("Delete All", endTime - startTime, -1)
    res.sendStatus(200);
    console.log("Successfully deleted all customers and associated records.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting all customers:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});


app.post("/submit_customer", async (req, res) => {
  let {
    first_name,
    last_name,
    email,
    phone_number,
    account_number,
    plan_id,
    is_busy = false,
  } = req.body;

  const client = await pool.connect();

  // Default values for the bank account
  const bank_name = "Default Bank";
  const bank_log = "Default Log";
  const balance = 1000;

  plan_id = Number(plan_id)

  try {
    await client.query("BEGIN");
    const startTime = Date.now()

    // Insert the customer into the `customer` table
    const customerResult = await client.query(
      `INSERT INTO customer (First_name, Last_name, Email, Phone_number, Plan_ID, Is_Busy) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING Customer_ID`,
      [first_name, last_name, email, phone_number, plan_id, is_busy]
    );

    const customerId = customerResult.rows[0].customer_id;

    // Insert the associated bank account into the `bank_account` table
    await client.query(
      `INSERT INTO bank_account (Account_number, Balance, Bank_name, Bank_log, Customer_ID) 
       VALUES ($1, $2, $3, $4, $5)`,
      [account_number, balance, bank_name, bank_log, customerId]
    );

    await client.query("COMMIT");
    const endTime = Date.now()
    logTransaction("Create Customer", endTime - startTime, customerId)
    res.sendStatus(201); 
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating customer:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

async function logTransaction(transactionType, transactionDuration, customerId){
  const client = await pool.connect()

  try {
    const query = `
      INSERT INTO "transaction" (Transaction_Type, Transaction_Date, Transaction_Duration, Customer_ID)
      VALUES ($1, DEFAULT, $2, $3)
      RETURNING Transaction_ID
    `;

    const values = [transactionType, transactionDuration, customerId];

    const result = await client.query(query, values); 

    return result.rows[0].transaction_id; 
  } catch (err) {
    throw err; 
  } finally {
    client.release(); 
  }
}
app.listen(3000, () => console.log("Server is running on port 3000"));
