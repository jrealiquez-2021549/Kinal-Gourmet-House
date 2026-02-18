'use strict';

import Coupon from './coupon.model.js';
import CouponUsage from './couponUsage.model.js';
import mongoose from 'mongoose';

export const createCoupon = async (req, res) => {
    try {
        const couponData = {
            ...req.body,
            createdByUserId: req.user?.id || 'system',
            createdByName: req.user?.name || 'Sistema'
        };

        // Validar que el código no exista
        if (couponData.code) {
            const existingCoupon = await Coupon.findOne({ 
                code: couponData.code.toUpperCase() 
            });
            
            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un cupón con este código'
                });
            }
        }

        // ✅ LIMPIAR applicableRestaurants si viene vacío o con valores inválidos
        if (couponData.applicableRestaurants) {
            couponData.applicableRestaurants = couponData.applicableRestaurants.filter(
                id => id && mongoose.Types.ObjectId.isValid(id)
            );
        }

        const coupon = new Coupon(couponData);
        await coupon.save();

        // ✅ Solo hacer populate si hay restaurantes aplicables
        let populatedCoupon;
        if (coupon.applicableRestaurants && coupon.applicableRestaurants.length > 0) {
            populatedCoupon = await Coupon.findById(coupon._id)
                .populate('applicableRestaurants', 'name address')
                .catch(err => {
                    console.error('Error en populate:', err);
                    return coupon; // Si falla el populate, devolver sin popular
                });
        } else {
            populatedCoupon = coupon;
        }

        res.status(201).json({
            success: true,
            message: 'Cupón creado exitosamente',
            data: populatedCoupon
        });
        
    } catch (error) {
        console.error('Error completo en createCoupon:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: messages
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un cupón con este código'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear el cupón',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive, 
            restaurant,
            current,
            search
        } = req.query;
        
        const filter = {};
        
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (restaurant) {
            filter.$or = [
                { applicableRestaurants: { $size: 0 } },
                { applicableRestaurants: restaurant }
            ];
        }

        if (current === 'true') {
            const now = new Date();
            filter.validFrom = { $lte: now };
            filter.validUntil = { $gte: now };
            filter.isActive = true;
            filter.$or = [
                { usageLimit: null },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
            ];
        }

        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const coupons = await Coupon.find(filter)
            .populate('applicableRestaurants', 'name address')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Coupon.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: coupons,
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
            message: 'Error al obtener los cupones',
            error: error.message
        });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const coupon = await Coupon.findById(id)
            .populate('applicableRestaurants', 'name address phone');
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Cupón no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el cupón",
            error: error.message,
        });
    }
};

export const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Código de cupón es requerido"
            });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() })
            .populate('applicableRestaurants', 'name address');
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Cupón no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el cupón",
            error: error.message,
        });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code, userId, restaurantId, orderTotal } = req.body;

        if (!code || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Código de cupón y usuario son requeridos'
            });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Cupón no encontrado'
            });
        }

        const validation = await coupon.validateForUse(
            userId, 
            restaurantId, 
            orderTotal || 0
        );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        let estimatedDiscount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            estimatedDiscount = (orderTotal || 0) * (coupon.discountValue / 100);
            if (coupon.maxDiscount && estimatedDiscount > coupon.maxDiscount) {
                estimatedDiscount = coupon.maxDiscount;
            }
        } else {
            estimatedDiscount = coupon.discountValue;
        }

        res.status(200).json({
            success: true,
            message: 'Cupón válido',
            data: {
                coupon: {
                    id: coupon._id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                },
                estimatedDiscount: estimatedDiscount
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al validar cupón',
            error: error.message
        });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentCoupon = await Coupon.findById(id);
        
        if (!currentCoupon) {
            return res.status(404).json({
                success: false,
                message: "Cupón no encontrado",
            });
        }

        if (req.body.code && currentCoupon.usedCount > 0) {
            return res.status(400).json({
                success: false,
                message: "No se puede cambiar el código de un cupón ya usado"
            });
        }

        // Limpiar applicableRestaurants
        if (req.body.applicableRestaurants) {
            req.body.applicableRestaurants = req.body.applicableRestaurants.filter(
                id => id && mongoose.Types.ObjectId.isValid(id)
            );
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate('applicableRestaurants', 'name');

        res.status(200).json({
            success: true,
            message: "Cupón actualizado exitosamente",
            data: updatedCoupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar cupón",
            error: error.message,
        });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const coupon = await Coupon.findById(id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Cupón no encontrado",
            });
        }

        if (coupon.usedCount > 0) {
            coupon.isActive = false;
            await coupon.save();

            return res.status(200).json({
                success: true,
                message: "Cupón desactivado (no se puede eliminar porque ya fue usado)",
            });
        }

        await Coupon.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Cupón eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar cupón",
            error: error.message,
        });
    }
};

export const getCouponUsageHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const usage = await CouponUsage.find({ coupon: id })
            .populate('user', 'name email')
            .populate('order', 'totalPrice status createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ usedAt: -1 });

        const total = await CouponUsage.countDocuments({ coupon: id });

        res.status(200).json({
            success: true,
            data: usage,
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
            message: "Error al obtener historial de uso",
            error: error.message
        });
    }
};

export const getUserCouponUsage = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido",
            });
        }

        const usage = await CouponUsage.find({ user: userId })
            .populate('coupon', 'code description discountType discountValue')
            .populate('order', 'totalPrice status createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ usedAt: -1 });

        const total = await CouponUsage.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: usage,
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
            message: "Error al obtener cupones usados por el usuario",
            error: error.message
        });
    }
};