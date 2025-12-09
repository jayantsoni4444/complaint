// === server.js ===
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());    
app.use(express.json());

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/serialDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// 🔹 Create schema & model
const serialSchema = new mongoose.Schema({
  product: { type: String, required: true, unique: true },
  control: { type: String, required: true },
  wifi: { type: String, required: true }
});
const Serial = mongoose.model("Serial", serialSchema);

// =================== ROUTES ===================

// 🟢 Get all serials
app.get("/api/serials", async (req, res) => {
  try {
    const serials = await Serial.find();
    res.json(serials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔵 Search by product/control/wifi
app.get("/api/serials/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toUpperCase();
    const serials = await Serial.find({
      $or: [
        { product: { $regex: q, $options: "i" } },
        { control: { $regex: q, $options: "i" } },
        { wifi: { $regex: q, $options: "i" } },
      ],
    });
    res.json(serials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟠 Add new serial
app.post("/api/serials", async (req, res) => {
  try {
    const { product, control, wifi } = req.body;
    if (!product || !control || !wifi) return res.status(400).json({ message: "All fields required." });

    const exists = await Serial.findOne({ product });
    if (exists) return res.status(400).json({ message: "Product already exists." });

    const newSerial = new Serial({ product, control, wifi });
    await newSerial.save();
    res.status(201).json({ message: "Serial saved successfully", data: newSerial });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟣 Edit serial by ID
app.put("/api/serials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product, control, wifi } = req.body;
    const updated = await Serial.findByIdAndUpdate(id, { product, control, wifi }, { new: true });
    if (!updated) return res.status(404).json({ message: "Serial not found." });
    res.json({ message: "Serial updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔴 Delete serial by ID
app.delete("/api/serials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Serial.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Serial not found." });
    res.json({ message: "Serial deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
