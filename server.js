const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");

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
    console.error("Database 'phone_company' does not exist. Attempting to create it...");
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

// Call connectOrCreateDatabase to either connect to or create the database
connectOrCreateDatabase()
  .then(() => {
    console.log("Database setup complete.");
    // Proceed with application logic here
  })
  .catch((error) => console.error("Database setup failed:", error));


app.put("/create_tables", async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Drop tables if they exist
      await client.query(`
        DROP TABLE IF EXISTS "call_record" CASCADE;
        DROP TABLE IF EXISTS "payment" CASCADE;
        DROP TABLE IF EXISTS "customers" CASCADE;
        DROP TABLE IF EXISTS "bank_account" CASCADE;
        DROP TABLE IF EXISTS "plan_name" CASCADE;
        DROP TABLE IF EXISTS "phone_plan" CASCADE;
      `);

      // Create tables
      await client.query(`
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
      TRUNCATE TABLE "customers" CASCADE;
      TRUNCATE TABLE "bank_account" CASCADE;
      TRUNCATE TABLE "plan_name" CASCADE;
      TRUNCATE TABLE "phone_plan" CASCADE;
    `);

    // Insert data into plan_name table
    await client.query(`
      INSERT INTO "plan_name" (Plan_name, Plan_cost, Cost_frequency) VALUES 
        ('Basic', 10.99, 12),
        ('Standard', 29.99, 12),
        ('Premium', 49.99, 12);
    `);

    // Insert data into bank_account table
    await client.query(`
      INSERT INTO "bank_account" (Account_number, Balance, Bank_name, Bank_log) VALUES
        (100, 1000, 'Bank A', '+1000'),
        (101, 1500, 'Bank B', '+1500'),
        (102, 2000, 'Bank C', '+2000'),
        (103, 2500, 'Bank D', '+2500'),
        (104, 3000, 'Bank E', '+3000'),
        (105, 3500, 'Bank F', '+3500'),
        (106, 4000, 'Bank G', '+4000'),
        (107, 4500, 'Bank H', '+4500'),
        (108, 5000, 'Bank I', '+5000');
    `);

    // Insert data into phone_plan table
    await client.query(`
      INSERT INTO "phone_plan" (Data_type, Call_Minutes, Plan_Name) VALUES
        ('4G', 300, 'Basic'),
        ('4G', 600, 'Standard'),
        ('5G', 1200, 'Premium'),
        ('4G', 300, 'Basic'),
        ('4G', 600, 'Standard'),
        ('5G', 1200, 'Premium'),
        ('4G', 300, 'Basic'),
        ('4G', 600, 'Standard'),
        ('5G', 1200, 'Premium');
    `);

    // Insert data into customers table
    await client.query(`
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
    `);

    // Insert data into call_record table
    await client.query(`
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
    `);

    // Insert data into payment table
    await client.query(`
      INSERT INTO payment (Amount, Payment_Date, Company_Balance, Customer_ID, Bank_ID, Plan_ID)
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
    `);

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




app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
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
    const result = await pool.query("SELECT * FROM phone_plan");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/plan_name", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM plan_name");
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

app.get("/minutes_cost/:minutes_cost_customer_id", async (req, res) => {
  const { minutes_cost_customer_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
      c.Customer_ID,
      c.First_name,
      c.Last_name,
      SUM(cr.Duration) AS Total_Logged_Minutes,
      SUM(cr.Cost) AS Total_Logged_Cost
    FROM 
      customers c
    JOIN 
      call_record cr ON c.Customer_ID = cr.Customer_ID
    WHERE 
      c.Customer_ID = $1
    GROUP BY 
      c.Customer_ID, c.First_name, c.Last_name;
    `,
      [minutes_cost_customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/customer_standing", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        b.balance,
        pn.plan_cost,
        pn.cost_frequency,
        FLOOR(b.balance / pn.plan_cost) as affordable_months,
        CASE
          WHEN b.balance < pn.plan_cost THEN 'Low Balance'
          WHEN b.balance < pn.plan_cost * 3 THEN 'Warning'
          ELSE 'Good Standing'
        END as account_status
      FROM 
        customers c
        JOIN bank_account b ON c.bank_account_id = b.bank_account_id  -- Corrected join condition
        JOIN phone_plan p ON c.plan_id = p.plan_id
        JOIN plan_name pn ON p.plan_name = pn.plan_name
      ORDER BY 
        affordable_months ASC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/monthly_revenue", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        pn.plan_name,
        COUNT(c.customer_id) as number_of_customers,
        pn.plan_cost as cost_per_customer,
        COUNT(c.customer_id) * pn.plan_cost as monthly_revenue_per_plan,
        (SELECT 
          SUM(plan_cost * counted_customers) 
        FROM 
          (SELECT 
            COUNT(customers.customer_id) as counted_customers,
            plan_name.plan_cost
          FROM customers
          JOIN phone_plan ON customers.plan_id = phone_plan.plan_id
          JOIN plan_name ON phone_plan.plan_name = plan_name.plan_name
          GROUP BY plan_name.plan_cost) as total
        ) as total_monthly_revenue
      FROM 
        customers c
        JOIN phone_plan p ON c.plan_id = p.plan_id
        JOIN plan_name pn ON p.plan_name = pn.plan_name
      GROUP BY 
        pn.plan_name,
        pn.plan_cost
      ORDER BY 
        monthly_revenue_per_plan DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});


app.put("/update_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  const {
    update_first_name,
    update_last_name,
    update_email,
    update_phone_number,
    update_account_number,
    update_plan_id,
  } = req.body;

  const plan_cost = 50.0;
  const cost_frequency = 30;

  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query("BEGIN");

    // Ensure the plan_name exists in plan_name table
    await client.query(
      `INSERT INTO plan_name (Plan_name, Plan_cost, Cost_frequency) 
       VALUES ($1::VARCHAR, $2::DOUBLE PRECISION, $3::INT)
       ON CONFLICT (Plan_name) DO NOTHING`,
      [update_plan_id, plan_cost, cost_frequency]
    );

    // Step 1: Retrieve the bank_account_id from the customers table
    const customerResult = await client.query(
      `SELECT bank_account_id FROM customers WHERE Customer_ID = $1::INT`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    const bankAccountId = customerResult.rows[0].bank_account_id;

    // Step 2: Update bank_account table with the new account number
    await client.query(
      `UPDATE bank_account
       SET Account_number = $1::INT
       WHERE bank_account_id = $2::INT`,
      [update_account_number, bankAccountId]
    );

    // Step 3: Update phone_plan table with new plan details
    const phonePlanResult = await client.query(
      `UPDATE phone_plan
       SET Plan_Name = $1::VARCHAR
       WHERE Plan_ID = (
         SELECT Plan_ID FROM customers WHERE Customer_ID = $2::INT
       )
       RETURNING Plan_ID`,
      [update_plan_id, customer_id]
    );
    const generatedPlanId = phonePlanResult.rows[0].plan_id;

    // Step 4: Update customers table with the new values
    await client.query(
      `UPDATE customers
       SET First_name = $1::VARCHAR, Last_name = $2::VARCHAR, Email = $3::VARCHAR, 
           Phone_number = $4::VARCHAR, bank_account_id = $5::INT, Plan_ID = $6::INT
       WHERE Customer_ID = $7::INT`,
      [
        update_first_name,
        update_last_name,
        update_email,
        update_phone_number,
        bankAccountId,
        generatedPlanId,
        customer_id,
      ]
    );

    // Commit transaction
    await client.query("COMMIT");
    res.sendStatus(200);
    console.log("Successfully updated customer and related entries.");
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error(err.message);
    res.sendStatus(500);
  } finally {
    client.release(); // Release the client back to the pool
  }
});

app.delete("/delete_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
      `SELECT bank_account_id, plan_id FROM customers WHERE customer_id = $1`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    const { bank_account_id, plan_id } = customerResult.rows[0];

    //Delete related call records
    await client.query(`DELETE FROM call_record WHERE customer_id = $1`, [
      customer_id,
    ]);

    //Delete related payments
    await client.query(`DELETE FROM payment WHERE customer_id = $1`, [
      customer_id,
    ]);

    //Delete the customer
    await client.query(`DELETE FROM customers WHERE customer_id = $1`, [
      customer_id,
    ]);

    //Delete the associated bank account
    await client.query(`DELETE FROM bank_account WHERE bank_account_id = $1`, [
      bank_account_id,
    ]);

    //Delete the associated phone plan
    await client.query(`DELETE FROM phone_plan WHERE plan_id = $1`, [plan_id]);

    await client.query("COMMIT");
    res.sendStatus(200);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});


app.delete("/delete_all_customers", async (req, res) => {
  try {
    const deleteQuery = `
      WITH deleted_call_records AS (
        DELETE FROM call_record
        WHERE customer_id IN (SELECT customer_id FROM customers)
      ),
      deleted_payments AS (
        DELETE FROM payment
        WHERE customer_id IN (SELECT customer_id FROM customers)
      ),
      
      deleted_customers AS (
        DELETE FROM customers 
        RETURNING bank_account_id, Plan_ID
      ),
      
      deleted_bank AS (
        DELETE FROM bank_account 
        WHERE bank_account_id IN (SELECT bank_account_id FROM deleted_customers)
      )
      
      DELETE FROM phone_plan 
      WHERE Plan_ID IN (SELECT Plan_ID FROM deleted_customers);
    `;

    await pool.query(deleteQuery);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});


// Route to handle form submissions
app.post("/submit_customer", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    account_number,
    plan_id,
  } = req.body;

  const client = await pool.connect();

  const bank_name = "Default Bank";
  const bank_log = "Default Log";
  const balance = 1000;

  const plan_cost = 50.0;
  const cost_frequency = 30;
  const data_type = "4G";
  const call_minutes = 500;

  try {
    await client.query("BEGIN");

    const bankAccountResult = await client.query(
      `INSERT INTO bank_account (Account_number, Balance, Bank_name, Bank_log) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (Account_number) DO NOTHING
       RETURNING bank_account_id`,
      [account_number, balance, bank_name, bank_log]
    );

    const bankAccountId = bankAccountResult.rows[0]
      ? bankAccountResult.rows[0].bank_account_id
      : (
          await client.query(
            `SELECT bank_account_id FROM bank_account WHERE Account_number = $1`,
            [account_number]
          )
        ).rows[0].bank_account_id;

    await client.query(
      `INSERT INTO plan_name (Plan_name, Plan_cost, Cost_frequency) 
       VALUES ($1, $2, $3)
       ON CONFLICT (Plan_name) DO NOTHING`,
      [plan_id, plan_cost, cost_frequency]
    );

    const phonePlanResult = await client.query(
      `INSERT INTO phone_plan (Data_type, Call_Minutes, Plan_Name) 
       VALUES ($1, $2, $3) 
       RETURNING Plan_ID`,
      [data_type, call_minutes, plan_id]
    );

    const generatedPlanId = phonePlanResult.rows[0].plan_id;

    await client.query(
      `INSERT INTO customers (First_name, Last_name, Email, Phone_number, bank_account_id, Plan_ID) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        bankAccountId,
        generatedPlanId,
      ]
    );

    await client.query("COMMIT");
    res.sendStatus(201);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
