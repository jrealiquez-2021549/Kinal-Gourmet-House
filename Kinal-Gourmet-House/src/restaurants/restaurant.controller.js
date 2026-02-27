'use strict';

import Restaurant from './restaurant.model.js';
import mongoose from 'mongoose';
import { cloudinary } from '../../middlewares/files-uploaders.js';

export const createRestaurant = async (req, res) => {
    try {
        const restaurantData = req.body;

        restaurantData.ownerUserId = req.user.id;
        restaurantData.ownerInfo = { name: req.user.name, email: req.user.email };

        if (req.file) {
            restaurantData.images = req.file.path;
            restaurantData.images_public_id = req.file.filename;
        }

        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();

        res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente',
            data: restaurant
        });
    } catch (error) {

        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err => 
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante',
            error: error.message
        });
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'ACTIVE' } = req.query;

        const filter = { status };

        const restaurants = await Restaurant.find(filter)
            
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurants,
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
            message: 'Error al obtener los restaurantes',
            error: error.message
        });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const restaurant = await Restaurant.findById(id);
        
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el restaurante",
            error: error.message,
        });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentRestaurant = await Restaurant.findById(id);
        
        if (!currentRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante no encontrado",
            });
        }

        const updateData = { ...req.body };

        if (req.file) {

            if (currentRestaurant.images_public_id) {
                await cloudinary.uploader.destroy(
                    currentRestaurant.images_public_id
                ).catch(err => console.error('Error al eliminar imagen anterior:', err));
            }
            
            updateData.images = req.file.path;
            updateData.images_public_id = req.file.filename;
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Restaurante actualizado exitosamente",
            data: updatedRestaurant,
        });
    } catch (error) {

        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err =>
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(500).json({
            success: false,
            message: "Error al actualizar restaurante",
            error: error.message,
        });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const restaurant = await Restaurant.findById(id);
        
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante no encontrado",
            });
        }
        
        if (restaurant.images_public_id) {
            await cloudinary.uploader.destroy(restaurant.images_public_id)
                .catch(err => console.error('Error al eliminar imagen:', err));
        }

        await Restaurant.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Restaurante eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar restaurante",
            error: error.message,
        });
    }
};