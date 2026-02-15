import Review from './review.model.js';
import mongoose from 'mongoose';

export const createReview = async (req, res) => {
    try {
        const reviewData = req.body;
        const review = new Review(reviewData);
        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review creada exitosamente',
            data: review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la review',
            error: error.message
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant, dish, user, minRating } = req.query;
        
        const filter = {};
        if (restaurant) filter.restaurant = restaurant;
        if (dish) filter.dish = dish;
        if (user) filter.user = user;
        if (minRating) filter.rating = { $gte: parseInt(minRating) };

        const reviews = await Review.find(filter)
            .populate('user', 'name email')
            .populate('restaurant', 'name address')
            .populate('dish', 'name price')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: -1 });

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reviews',
            error: error.message
        });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const review = await Review.findById(id)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address')
            .populate('dish', 'name price description');
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la review",
            error: error.message,
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentReview = await Review.findById(id);
        
        if (!currentReview) {
            return res.status(404).json({
                success: false,
                message: "Review no encontrada",
            });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
        .populate('user', 'name email')
        .populate('restaurant', 'name')
        .populate('dish', 'name');

        res.status(200).json({
            success: true,
            message: "Review actualizada exitosamente",
            data: updatedReview,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar review",
            error: error.message,
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review no encontrada",
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Review eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar review",
            error: error.message,
        });
    }
};