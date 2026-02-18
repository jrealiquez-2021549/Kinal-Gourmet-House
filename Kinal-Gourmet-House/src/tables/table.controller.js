'use strict';

import Table from './table.model.js';
import mongoose from 'mongoose';

export const createTable = async (req, res) => {
    try {
        const tableData = req.body;
        const table = new Table(tableData);
        await table.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: table
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

export const getTables = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, location, restaurant } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (location) filter.location = location;
        if (restaurant) filter.restaurant = restaurant;

        const tables = await Table.find(filter)
            .populate('restaurant', 'name address phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ number: 1 });

        const total = await Table.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: tables,
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
            message: 'Error al obtener las mesas',
            error: error.message
        });
    }
};

export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const table = await Table.findById(id)
            .populate('restaurant', 'name address phone email');
        
        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Mesa no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la mesa",
            error: error.message,
        });
    }
};

export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentTable = await Table.findById(id);
        
        if (!currentTable) {
            return res.status(404).json({
                success: false,
                message: "Mesa no encontrada",
            });
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate('restaurant', 'name address');

        res.status(200).json({
            success: true,
            message: "Mesa actualizada exitosamente",
            data: updatedTable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar mesa",
            error: error.message,
        });
    }
};

export const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const table = await Table.findById(id);
        
        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Mesa no encontrada",
            });
        }

        await Table.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Mesa eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar mesa",
            error: error.message,
        });
    }
};