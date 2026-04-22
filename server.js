const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "data.json";
let data = { transactions: [] };

// Load existing data
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Save to data.json
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Health check
app.get("/", (req, res) => {
  res.send({ message: "Expense Tracker API is working" });
});

// List all transactions
app.get("/transactions", (req, res) => {
  res.send(data.transactions);
});

// Add new transaction
app.post("/transactions", (req, res) => {
  const { type, amount, category } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).send({ error: "type, amount, category required" });
  }

  const tx = {
    id: Date.now(),
    type,
    amount,
    category,
    date: new Date().toISOString()
  };

  data.transactions.push(tx);
  saveData();

  res.status(201).send(tx);
});

// Monthly Summary
app.get("/monthly", (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!month || !year) {
    return res.status(400).send({ error: "month and year required" });
  }

  let income = 0;
  let expense = 0;

  const filtered = data.transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  filtered.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  res.send({
    income,
    expense,
    totalTransactions: filtered.length
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
