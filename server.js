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
  try{
    const result = await pool.query("SELECT * FROM bank_account");
    res.json(result.rows)

  } catch (err){
    console.error(err.message);
    res.sendStatus(500)
  }
});

app.get("/phone_plans", async (req,res) => {
  try{
    const result = await pool.query("SELECT * FROM phone_plan");
    res.json(result.rows)
  } catch (err){
    console.error(err.message);
    res.sendStatus(500);
  }
})

app.put("/update_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  const {
    update_first_name,
    update_last_name,
    update_email,
    update_phone_number,
    update_account_number,
    update_plan_id
  } = req.body;

  try {
    const updateQuery = `
      WITH updated_bank AS (
        UPDATE bank_account
        SET account_number = $5
        WHERE account_number = (
          SELECT account_number FROM customers WHERE customer_id = $7
        )
        RETURNING account_number
      ),
      updated_plan AS (
        UPDATE phone_plan
        SET plan_id = $6
        WHERE plan_id = (
          SELECT plan_id FROM customers WHERE customer_id = $7
        )
        RETURNING plan_id
      )
      UPDATE customers
      SET first_name = $1, last_name = $2, email = $3, phone_number = $4, account_number = (SELECT account_number FROM updated_bank), plan_id = (SELECT plan_id FROM updated_plan)
      WHERE customer_id = $7;
    `;

    const values = [
      update_first_name, update_last_name, update_email, update_phone_number,
      update_account_number, update_plan_id[5], customer_id
    ];

    await pool.query(updateQuery, values);
    res.sendStatus(200);
    console.log("Successfully updated customer and related entries.");
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});


app.delete("/delete_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;

  //open the pool to allow for a transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); //begin transaction

    const customerResult = await client.query(
      `SELECT Account_number, Plan_ID FROM Customers WHERE Customer_ID = $1`,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).send('Customer not found');
    }

    await client.query(
      `DELETE FROM customers WHERE Customer_ID = $1`,
      [customer_id]
    );

    const { account_number, plan_id } = customerResult.rows[0];

    // Delete the bank account associated with this customer
    await client.query(
      `DELETE FROM bank_account WHERE Account_number = $1`,
      [account_number]
    );

    // Delete the phone plan associated with this customer
    //THIS IS NOT GOING TO WORK LONG TERM
    //AS SOON AS TWO PEOPLE HAVE CHOSEN THE SAME PHONE PLAN, THIS WILL BREAK
    await client.query(
      `DELETE FROM phone_plan WHERE Plan_ID = $1`,
      [plan_id]
    );
    
    await client.query('COMMIT'); //commit transaction
    res.sendStatus(200);
    console.log(`Successfully deleted customer and related entries for customer ID ${customer_id}`);
  } catch (err) {
    await client.query('ROLLBACK'); //rollback on error
    console.error(err.message);
    res.sendStatus(500);
  } finally {
    client.release(); //release the pool
  }
});


app.delete("/delete_all_customers", async (req, res) => {
  try {
    const deleteQuery = `
      WITH deleted_customers AS (
        DELETE FROM customers 
        RETURNING Account_number, Plan_ID
      ),
      deleted_bank AS (
        DELETE FROM bank_account 
        WHERE Account_number IN (SELECT Account_number FROM deleted_customers)
      )
      DELETE FROM phone_plan 
      WHERE Plan_ID IN (SELECT Plan_ID FROM deleted_customers);
    `;

    await pool.query(deleteQuery);
    res.sendStatus(200);
    console.log("Successfully deleted all customers and related entries.");
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
    plan_id 
  } = req.body;

  const client = await pool.connect(); 

  // Dummy values
  const bank_name = 'Default Bank';
  const bank_log = 'Default Log';
  const balance = 1000; 

  const plan_cost = 50.0; 
  const cost_frequency = 30; 
  const data_type = '4G'; 
  const call_minutes = 500; 

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Insert into bank_account table using the provided account_number
    await client.query(
      `INSERT INTO bank_account (Account_number, Balance, Bank_name, Bank_log) 
       VALUES ($1, $2, $3, $4)`,
      [account_number, balance, bank_name, bank_log]
    );

    // Insert into plan_name table 
    await client.query(
      `INSERT INTO plan_name (Plan_name, Plan_cost, Cost_frequency) 
       VALUES ($1, $2, $3)
       ON CONFLICT (Plan_name) DO NOTHING`,
      [plan_id, plan_cost, cost_frequency]
    );

    // Insert into phone_plan table 
    await client.query(
      `INSERT INTO phone_plan (Plan_id, Data_type, Call_Minutes, Plan_Name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING Plan_ID`,
      [plan_id[5], data_type, call_minutes, plan_id]
    );

    // Insert into customers table 
    await client.query(
      `INSERT INTO customers (First_name, Last_name, Email, Phone_number, Account_number, Plan_ID) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [first_name, last_name, email, phone_number, account_number, plan_id[5]]
    );

    await client.query('COMMIT');
    res.sendStatus(201);
    console.log("Successfully created customer with related entries using user-provided account number.");
  } catch (err) {
    await client.query('ROLLBACK'); //rollback on error
    console.error(err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
