import express from "express";
import { reviewPullRequest } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", reviewPullRequest);

export default router;