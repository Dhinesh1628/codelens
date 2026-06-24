import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

console.log(
  "ANTHROPIC_API_KEY loaded:",
  !!process.env.ANTHROPIC_API_KEY
);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodeLens API Running",
  });
});

app.use("/api/review", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});