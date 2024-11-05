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

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "phone_company",
  password: "8508",
  port: 5432,
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
      `SELECT bank_account_id, Plan_ID FROM customers WHERE Customer_ID = $1`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Customer not found");
    }

    const { bank_account_id, plan_id } = customerResult.rows[0];

    await client.query(`DELETE FROM customers WHERE Customer_ID = $1`, [
      customer_id,
    ]);

    await client.query(`DELETE FROM bank_account WHERE bank_account_id = $1`, [
      bank_account_id,
    ]);

    await client.query(`DELETE FROM phone_plan WHERE Plan_ID = $1`, [plan_id]);

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
      WITH deleted_customers AS (
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
