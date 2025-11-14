import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Schema & Model
const entrySchema = new mongoose.Schema({
  date: String,
  amount: Number,
});

const partySchema = new mongoose.Schema({
  name: String,
  entries: [entrySchema],
});

const Party = mongoose.model("Party", partySchema);

// ---------------- ROUTES ----------------

// Get all parties
app.get("/parties", async (req, res) => {
  const parties = await Party.find();
  res.json(parties);
});

// Create party
app.post("/parties", async (req, res) => {
  const { name } = req.body;
  const existing = await Party.findOne({ name });
  if (existing) return res.status(400).json({ error: "Party already exists" });

  const party = new Party({ name, entries: [] });
  await party.save();
  res.json(party);
});

// Update party name
app.put("/parties/:id", async (req, res) => {
  const { name } = req.body;
  const party = await Party.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  res.json(party);
});

// Delete party
app.delete("/parties/:id", async (req, res) => {
  await Party.findByIdAndDelete(req.params.id);
  res.json({ message: "Party deleted" });
});

// Add entry
app.post("/parties/:id/entries", async (req, res) => {
  const { date, amount } = req.body;
  const party = await Party.findById(req.params.id);
  party.entries.push({ date, amount });
  await party.save();
  res.json(party);
});

// Edit entry
app.put("/parties/:id/entries/:entryId", async (req, res) => {
  const { date, amount } = req.body;
  const party = await Party.findById(req.params.id);
  const entry = party.entries.id(req.params.entryId);
  if (entry) {
    entry.date = date;
    entry.amount = amount;
    await party.save();
  }
  res.json(party);
});

// Delete entry
app.delete("/parties/:id/entries/:entryId", async (req, res) => {
  const party = await Party.findById(req.params.id);
  party.entries.id(req.params.entryId).remove();
  await party.save();
  res.json(party);
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
