import Promotion from './promotion.model.js';
import mongoose from 'mongoose';

export const createPromotion = async (req, res) => {
    try {
        const promotionData = req.body;
        const promotion = new Promotion(promotionData);
        await promotion.save();

        res.status(201).json({
            success: true,
            message: 'Promoción creada exitosamente',
            data: promotion
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la promoción',
            error: error.message
        });
    }
};

export const getPromotions = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, restaurant, current } = req.query;
        
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (restaurant) filter.restaurant = restaurant;
        
        if (current === 'true') {
            const now = new Date();
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
            filter.isActive = true;
        }

        const promotions = await Promotion.find(filter)
            .populate('restaurant', 'name address phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Promotion.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: promotions,
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
            message: 'Error al obtener las promociones',
            error: error.message
        });
    }
};

export const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const promotion = await Promotion.findById(id)
            .populate('restaurant', 'name address phone email');
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Promoción no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: promotion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la promoción",
            error: error.message,
        });
    }
};

export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentPromotion = await Promotion.findById(id);
        
        if (!currentPromotion) {
            return res.status(404).json({
                success: false,
                message: "Promoción no encontrada",
            });
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate('restaurant', 'name address');

        res.status(200).json({
            success: true,
            message: "Promoción actualizada exitosamente",
            data: updatedPromotion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar promoción",
            error: error.message,
        });
    }
};

export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const promotion = await Promotion.findById(id);
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Promoción no encontrada",
            });
        }

        await Promotion.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Promoción eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar promoción",
            error: error.message,
        });
    }
};