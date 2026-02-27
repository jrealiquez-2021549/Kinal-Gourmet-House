import Dish from './dish.model.js';
import mongoose from 'mongoose';
import { cloudinary } from '../../middlewares/files-uploaders.js';

export const createDish = async (req, res) => {
    try {
        const dishData = req.body;

        if (typeof dishData.ingredients === 'string') {
            dishData.ingredients = dishData.ingredients.split(',').map(item => item.trim());
        }

        if (req.file) {
            dishData.image = req.file.path;
            dishData.image_public_id = req.file.filename;
        }

        const dish = new Dish(dishData);
        await dish.save();

        res.status(201).json({
            success: true,
            message: 'Platillo creado exitosamente',
            data: dish
        });
    } catch (error) {

        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err => 
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear el platillo',
            error: error.message
        });
    }
};

export const getDishes = async (req, res) => {
    try {
        const { page = 1, limit = 10, isAvailable, type, restaurant } = req.query;

        const filter = {};
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (type) filter.type = type;
        if (restaurant) filter.restaurant = restaurant;

        const dishes = await Dish.find(filter)
            .populate('restaurant', 'name address')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Dish.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: dishes,
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
            message: 'Error al obtener los platillos',
            error: error.message
        });
    }
};

export const getDishById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const dish = await Dish.findById(id)
            .populate('menu', 'name description')
            .populate('restaurant', 'name address phone');
        
        if (!dish) {
            return res.status(404).json({
                success: false,
                message: "Platillo no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: dish,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el platillo",
            error: error.message,
        });
    }
};

export const updateDish = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentDish = await Dish.findById(id);
        
        if (!currentDish) {
            return res.status(404).json({
                success: false,
                message: "Platillo no encontrado",
            });
        }

        const updateData = { ...req.body };

        if (typeof updateData.ingredients === 'string') {
            updateData.ingredients = updateData.ingredients.split(',').map(item => item.trim());
        }

        if (req.file) {
            if (currentDish.image_public_id) {
                await cloudinary.uploader.destroy(
                    currentDish.image_public_id
                ).catch(err => console.error('Error al eliminar imagen anterior:', err));
            }
            
            updateData.image = req.file.path;
            updateData.image_public_id = req.file.filename;
        }

        const updatedDish = await Dish.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        )
        .populate('menu', 'name')
        .populate('restaurant', 'name');

        res.status(200).json({
            success: true,
            message: "Platillo actualizado exitosamente",
            data: updatedDish,
        });
    } catch (error) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err =>
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(500).json({
            success: false,
            message: "Error al actualizar platillo",
            error: error.message,
        });
    }
};

export const deleteDish = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const dish = await Dish.findById(id);
        
        if (!dish) {
            return res.status(404).json({
                success: false,
                message: "Platillo no encontrado",
            });
        }
        
        if (dish.image_public_id) {
            await cloudinary.uploader.destroy(dish.image_public_id)
                .catch(err => console.error('Error al eliminar imagen:', err));
        }

        await Dish.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Platillo eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar platillo",
            error: error.message,
        });
    }
};