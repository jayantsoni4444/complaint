// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ---------- Ensure uploads folder ----------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

// ---------- Mongo URI ----------
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://jayantsoni4382:js%40workdb@cluster0.jjjc03f.mongodb.net/attendanceDB?retryWrites=true&w=majority";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set");
  process.exit(1);
}

// ---------- Mongoose Model ----------
const ComplaintSchema = new mongoose.Schema(
  {
    modelName: { type: String, required: true },
    productSerialNo: { type: String, required: true },
    installationDate: { type: String, required: true },
    installationSite: { type: String, required: true },
    loadType: String,
    batteryBrand: String,
    batteryNo: String,
    failureDate: { type: String, required: true },
    faultCode: String,
    problemDescription: String,
    failedPcbBarcodeNo: String,
    technicianName: { type: String, required: true },
    complaintNo: { type: String, required: true },

    failedPcbBarcodeImage: String,
    dcdbBoxSiteImage: String,
    hybridInverterSerialStickerImage: String,
    acdbBoxSiteImage: String,
    hybridInverterLcdErrorImage: String,
    pcbSerialNoImage: String,
  },
  { timestamps: true }
);
const Complaint = mongoose.model("Complaint", ComplaintSchema);

// ---------- Multer ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});
const imageFields = [
  { name: "failedPcbBarcodeImage", maxCount: 1 },
  { name: "dcdbBoxSiteImage", maxCount: 1 },
  { name: "hybridInverterSerialStickerImage", maxCount: 1 },
  { name: "acdbBoxSiteImage", maxCount: 1 },
  { name: "hybridInverterLcdErrorImage", maxCount: 1 },
  { name: "pcbSerialNoImage", maxCount: 1 },
];

// ---------- Routes ----------

// POST: create complaint
app.post("/api/complaints", upload.fields(imageFields), async (req, res) => {
  try {
    const imageUrls = {};
    if (req.files) {
      Object.keys(req.files).forEach((f) => {
        imageUrls[f] = `/uploads/${req.files[f][0].filename}`;
      });
    }
    const complaint = new Complaint({ ...req.body, ...imageUrls });
    await complaint.save();
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: list all
app.get("/api/complaints", async (req, res) => {
  try {
    const data = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); 
  }
});

app.get("/", (req, res) => res.send("Complaint API running ✅"));

// ---------- Boot ----------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)                 // ✅ single connection, uses MONGO_URI
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Mongo error:", err);
    process.exit(1);
  });
