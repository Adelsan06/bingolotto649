import express from "express";
import sqlite3 from "sqlite3";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ REQUIRED FOR ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ BODY PARSER
app.use(express.json());

// ✅ SERVE STATIC FILES (THIS WAS BROKEN)
app.use(express.static(path.join(__dirname, "public")));

// ✅ DATABASE
const db = new sqlite3.Database("./bingo.db");

// ---------- ROUTES ----------

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT id, email FROM users WHERE email=? AND password=?",
    [email, password],
    (err, row) => {
      if (!row) {
        return res.json({ error: "Invalid login" });
      }
      res.json(row);
    }
  );
});

// Stripe checkout
app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "cad",
        product_data: { name: "Bingo Lotto 6/49 Entry" },
        unit_amount: 500
      },
      quantity: 1
    }],
    success_url: `${process.env.BASE_URL}/success.html`,
    cancel_url: `${process.env.BASE_URL}/cancel.html`
  });

  res.json({ url: session.url });
});

// ✅ FALLBACK (OPTIONAL)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
