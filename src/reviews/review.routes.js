import { Router } from "express";
import { createReview, getReviews, updateReview, deleteReview } from "./review.controller.js";

const router = Router();

router.post("/create", createReview);
router.get("/", getReviews);
router.put("/update/:id", updateReview);
router.delete("/delete/:id", deleteReview);

export default router;
