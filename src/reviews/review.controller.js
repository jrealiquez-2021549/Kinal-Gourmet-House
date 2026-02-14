import Review from "./review.model.js";

export const createReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("restaurant", "name")
            .populate("dish", "name price");
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) return res.status(404).json({ success: false, message: "Review no encontrada" });
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review no encontrada" });
        res.status(200).json({ success: true, message: "Review eliminada" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
