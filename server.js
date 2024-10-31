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

app.put("/update_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  const {
    update_first_name,
    update_last_name,
    update_email,
    update_phone_number,
  } = req.body;
  try {
    await pool.query(
      "UPDATE Customers SET first_name = $1, last_name = $2, email = $3, phone_number = $4 WHERE customer_id = $5",
      [
        update_first_name,
        update_last_name,
        update_email,
        update_phone_number,
        customer_id,
      ]
    );
    res.sendStatus(200);
    console.log("Successfully updated customer!");
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.delete("/delete_customer/:customer_id", async (req, res) => {
  const { customer_id } = req.params;
  try {
    await pool.query("DELETE FROM Customers WHERE customer_id = $1", [customer_id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.delete("/delete_all_customers", async (req, res) => {
  try{
    await pool.query("DELETE FROM Customers");
    res.sendStatus(200)
  } catch (err) {
    console.error(err.message)
    res.sendStatus(500)
  }
})

// Route to handle form submissions
app.post("/submit_customer", async (req, res) => {
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    await pool.query(
      "INSERT INTO Customers (first_name, last_name, email, phone_number, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
      [first_name, last_name, email, phone_number]
    );
    res.sendStatus(201); // Successfully created
    console.log("successfully created customer");
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
