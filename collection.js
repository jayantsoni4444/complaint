// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collectionDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// 🔹 Schema & Model
const collectionSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true },
    date: { type: Date, required: true },
    customer: { type: String, required: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank"],
      default: "Cash",
    },
    invoiceNo: { type: String },
    amountReceived: { type: Number, required: true },
    balanceDue: { type: Number, default: 0 },
    collector: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Collection = mongoose.model("collections", collectionSchema);

// 🔹 Routes

// Get all entries
app.get("/api/collections", async (req, res) => {
  try {
    const data = await Collection.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new entry
app.post("/api/collections", async (req, res) => {
  try {
    const newEntry = new Collection(req.body);
    const saved = await newEntry.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update entry
app.put("/api/collections/:id", async (req, res) => {
  try {
    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete entry
app.delete("/api/collections/:id", async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
