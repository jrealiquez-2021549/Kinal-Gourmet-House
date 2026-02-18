import Review from './review.model.js';
import mongoose from 'mongoose';

export const createReview = async (req, res) => {
    try {
        const { restaurant, dish, rating, comment } = req.body;

        if (!restaurant && !dish) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar un restaurante o un platillo'
            });
        }

        const review = new Review({
            userId: req.user.id,
            userInfo: { name: req.user.name, email: req.user.email },
            restaurant,
            dish,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({ success: true, message: 'Reseña creada exitosamente', data: review });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear la reseña', error: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant, dish } = req.query;
        const filter = { isActive: true };
        if (restaurant) filter.restaurant = restaurant;
        if (dish) filter.dish = dish;

        const reviews = await Review.find(filter)
            .populate('restaurant', 'name')
            .populate('dish', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalRecords: total, limit: parseInt(limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener reseñas', error: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const review = await Review.findById(id).populate('restaurant', 'name').populate('dish', 'name');
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener reseña', error: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

        // Solo el dueño o admin puede editar
        if (req.user.role === 'CLIENTE' && review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Solo puedes editar tus propias reseñas' });
        }

        delete req.body.userId;
        delete req.body.userInfo;

        const updated = await Review.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Reseña actualizada', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar reseña', error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

        if (req.user.role === 'CLIENTE' && review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Solo puedes eliminar tus propias reseñas' });
        }

        await Review.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar reseña', error: error.message });
    }
};
