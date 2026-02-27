'use strict';

import Menu from './menu.model.js';
import mongoose from 'mongoose';

export const createMenu = async (req, res) => {
    try {
        const menuData = req.body;
        const menu = new Menu(menuData);
        await menu.save();

        res.status(201).json({
            success: true,
            message: 'Menú creado exitosamente',
            data: menu
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el menú',
            error: error.message
        })
    }
}

export const getMenus = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const menus = await Menu.find(filter)
            .populate('restaurant')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Menu.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: menus,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los menús',
            error: error.message
        })
    }
}

export const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const menu = await Menu.findById(id).populate('restaurant');
        
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: "Menú no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: menu,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el menú",
            error: error.message,
        });
    }
};

export const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentMenu = await Menu.findById(id);
        
        if (!currentMenu) {
            return res.status(404).json({
                success: false,
                message: "Menú no encontrado",
            });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate('restaurant');

        res.status(200).json({
            success: true,
            message: "Menú actualizado exitosamente",
            data: updatedMenu,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar menú",
            error: error.message,
        });
    }
};

export const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const menu = await Menu.findById(id);
        
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: "Menú no encontrado",
            });
        }

        await Menu.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Menú eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar menú",
            error: error.message,
        });
    }
};