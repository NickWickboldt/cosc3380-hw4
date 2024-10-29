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

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.put("/update_user/:id", async (req, res) => {
  const { id } = req.params;
  const {
    update_first_name,
    update_last_name,
    update_email,
    update_phone_number,
  } = req.body;
  console.log(update_first_name);
  try {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_number = $4 WHERE id = $5",
      [
        update_first_name,
        update_last_name,
        update_email,
        update_phone_number,
        id,
      ]
    );
    res.sendStatus(200);
    console.log("Successfully updated user!");
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.delete("/delete_user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.delete("/delete_all_users", async (req, res) => {
  try{
    await pool.query("DELETE FROM users");
    res.sendStatus(200)
  } catch (err) {
    console.error(err.message)
    res.sendStatus(500)
  }
})

// Route to handle form submissions
app.post("/submit_user", async (req, res) => {
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, phone_number, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
      [first_name, last_name, email, phone_number]
    );
    res.sendStatus(201); // Successfully created
    console.log("successfully created user");
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
