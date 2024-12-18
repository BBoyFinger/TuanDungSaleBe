const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a schema and model
const salesEntrySchema = new mongoose.Schema({
  date: String,
  customerName: String,
  saleAmount: String,
  orderCode: String,
});

const SalesEntry = mongoose.model("SalesEntry", salesEntrySchema);

// Routes
app.get("/api/sales", async (req, res) => {
  try {
    const salesEntries = await SalesEntry.find();
    res.json(salesEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales entries" });
  }
});

app.post("/api/sales", async (req, res) => {
  const newEntry = new SalesEntry(req.body);
  try {
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: "Error saving entry" });
  }
});

app.put("/api/sales/:id", async (req, res) => {
  try {
    const updatedEntry = await SalesEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedEntry) {
      res.json(updatedEntry);
    } else {
      res.status(404).json({ message: "Entry not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating entry" });
  }
});

app.delete("/api/sales/:id", async (req, res) => {
  try {
    const deletedEntry = await SalesEntry.findByIdAndDelete(req.params.id);
    if (deletedEntry) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: "Entry not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleting entry" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
