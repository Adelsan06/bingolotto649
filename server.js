import express from "express";
import sqlite3 from "sqlite3";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./bingo.db");

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    numbers TEXT,
    paid INTEGER DEFAULT 0
  )`);
});

// Signup
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  db.run(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, password],
    err => {
      if (err) return res.json({ error: "Email exists" });
      res.json({ success: true });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, row) => {
      if (!row) return res.json({ error: "Invalid login" });
      res.json(row);
    }
  );
});

// Stripe Checkout
app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "cad",
        product_data: { name: "Bingo Lotto 6/49 Entry" },
        unit_amount: 500
      },
      quantity: 1
    }],
    mode: "payment",
    success_url: `${process.env.BASE_URL}/success.html`,
    cancel_url: `${process.env.BASE_URL}/cancel.html`
  });

  res.json({ url: session.url });
});

app.listen(PORT, () => console.log("Server running on port", PORT));
