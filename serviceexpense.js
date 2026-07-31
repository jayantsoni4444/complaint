require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "expense-management",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });

const ExpenseSchema = new mongoose.Schema(
  {
    date: String,
    visitDate: String,
    expenseType: String,
    complaintNo: String,
    dealerName: String,

    fromLocation: String,
    toLocation: String,

    travelMode: String,

    startReading: Number,
    endReading: Number,

    startMeterImage: String,
    endMeterImage: String,

    travelBill: String,
    fareAmount: Number,

    hotelName: String,
    hotelBill: String,
    accommodationAmount: Number,

    foodBill: String,
    foodAmount: Number,

    courierCompany: String,
    courierBill: String,
    courierAmount: Number,

    miscDescription: String,
    miscBill: String,
    miscAmount: Number,

    totalExpense: Number,
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", ExpenseSchema);

app.post(
  "/api/expenses",
  upload.fields([
    { name: "startMeterImage", maxCount: 1 },
    { name: "endMeterImage", maxCount: 1 },
    { name: "travelBill", maxCount: 1 },
    { name: "hotelBill", maxCount: 1 },
    { name: "foodBill", maxCount: 1 },
    { name: "courierBill", maxCount: 1 },
    { name: "miscBill", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};

      const fareAmount = Number(req.body.fareAmount || 0);
      const accommodationAmount = Number(
        req.body.accommodationAmount || 0
      );
      const foodAmount = Number(req.body.foodAmount || 0);
      const courierAmount = Number(req.body.courierAmount || 0);
      const miscAmount = Number(req.body.miscAmount || 0);

      const totalExpense =
        fareAmount +
        accommodationAmount +
        foodAmount +
        courierAmount +
        miscAmount;

      const expense = await Expense.create({
        date: req.body.date,
        visitDate: req.body.visitDate,
        expenseType: req.body.expenseType,
        complaintNo: req.body.complaintNo,
        dealerName: req.body.dealerName,

        fromLocation: req.body.fromLocation,
        toLocation: req.body.toLocation,

        travelMode: req.body.travelMode,

        startReading: req.body.startReading,
        endReading: req.body.endReading,

        // Cloudinary URLs only
        startMeterImage:
          files.startMeterImage?.[0]?.path || "",

        endMeterImage:
          files.endMeterImage?.[0]?.path || "",

        travelBill:
          files.travelBill?.[0]?.path || "",

        hotelBill:
          files.hotelBill?.[0]?.path || "",

        foodBill:
          files.foodBill?.[0]?.path || "",

        courierBill:
          files.courierBill?.[0]?.path || "",

        miscBill:
          files.miscBill?.[0]?.path || "",

        fareAmount,
        hotelName: req.body.hotelName,
        accommodationAmount,

        foodAmount,

        courierCompany: req.body.courierCompany,
        courierAmount,

        miscDescription: req.body.miscDescription,
        miscAmount,

        totalExpense,
      });

      res.status(201).json({
        success: true,
        message: "Expense Saved Successfully",
        data: expense,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Expense Deleted"
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({
      createdAt: -1,
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Running");
});
