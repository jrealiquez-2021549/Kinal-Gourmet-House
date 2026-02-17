import Reservation from './reservation.model.js';
import mongoose from 'mongoose';

export const createReservation = async (req, res) => {
    try {
        const reservationData = req.body;
        
        const reservation = new Reservation(reservationData);
        await reservation.save();

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        });
    }
};

export const getReservations = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true, status } = req.query;
        
        const filter = { isActive };
        if (status) {
            filter.status = status;
        }

        const reservations = await Reservation.find(filter)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address phone')
            .populate('table', 'number capacity location')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: -1, time: -1 });

        const total = await Reservation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reservations,
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
            message: 'Error al obtener las reservaciones',
            error: error.message
        });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const reservation = await Reservation.findById(id)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address phone')
            .populate('table', 'number capacity location');
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservación no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la reservación",
            error: error.message,
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentReservation = await Reservation.findById(id);
        
        if (!currentReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservación no encontrada",
            });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
        .populate('user', 'name email phone')
        .populate('restaurant', 'name address')
        .populate('table', 'number capacity');

        res.status(200).json({
            success: true,
            message: "Reservación actualizada exitosamente",
            data: updatedReservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar reservación",
            error: error.message,
        });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const reservation = await Reservation.findById(id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservación no encontrada",
            });
        }

        await Reservation.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Reservación eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar reservación",
            error: error.message,
        });
    }
};