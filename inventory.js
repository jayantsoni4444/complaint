import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 5004;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// -------------- MongoDB --------------
mongoose
  .connect("mongodb+srv://ages27771:ages12345@cluster0.t2zpj0w.mongodb.net/inventoryDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// -------------- Multer setup --------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// -------------- Schema --------------
const inventorySchema = new mongoose.Schema({
  date: String,
  partCode: String,
  product: String,
  model: String,
  capacity: String,
  stockIn: Number,
  stockOut: Number,
  total: Number,
  file: String, // store file path
});

const Inventory = mongoose.model("Inventory", inventorySchema);

// -------------- Routes --------------

// Get all
app.get("/api/inventory", async (req, res) => {
  try {
    const data = await Inventory.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new (with file)
app.post("/api/inventory", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file ? `/uploads/${req.file.filename}` : "";
    const newItem = new Inventory({ ...req.body, file: filePath });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update
app.put("/api/inventory/:id", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file ? `/uploads/${req.file.filename}` : req.body.file;
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, file: filePath },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------- Start server --------------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
