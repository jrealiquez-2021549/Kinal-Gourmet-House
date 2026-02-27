import Reservation from './reservation.model.js';
import mongoose from 'mongoose';

export const createReservation = async (req, res) => {
    try {
        const { restaurant, table, date, time, numberOfGuests, specialRequests } = req.body;

        if (!restaurant || !table || !date || !time || !numberOfGuests) {
            return res.status(400).json({
                success: false,
                message: 'Restaurante, mesa, fecha, hora y número de comensales son requeridos'
            });
        }

        const existing = await Reservation.findOne({
            table,
            date: new Date(date),
            time,
            status: { $nin: ['CANCELADA'] }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una reservación para esa mesa en esa fecha y hora'
            });
        }

        const reservation = new Reservation({
            userId: req.user.id,
            userInfo: { name: req.user.name, email: req.user.email },
            restaurant,
            table,
            date,
            time,
            numberOfGuests,
            specialRequests
        });

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
        const { page = 1, limit = 10, isActive, status, restaurant } = req.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (status) filter.status = status;

        if (req.user.role === 'CLIENTE') {
            filter.userId = req.user.id;
        } else if (req.user.role === 'ADMIN_RESTAURANTE') {
            filter.restaurant = req.user.restaurantId;
        } else if (req.user.role === 'ADMIN_GENERAL') {
            if (restaurant) filter.restaurant = restaurant;
        }

        const reservations = await Reservation.find(filter)
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const reservation = await Reservation.findById(id)
            .populate('restaurant', 'name address phone')
            .populate('table', 'number capacity location');

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservación no encontrada" });
        }

        if (req.user.role === 'CLIENTE' && reservation.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "No tienes acceso a esta reservación" });
        }

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener la reservación", error: error.message });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const currentReservation = await Reservation.findById(id);
        if (!currentReservation) {
            return res.status(404).json({ success: false, message: "Reservación no encontrada" });
        }

        if (req.user.role === 'CLIENTE') {
            if (currentReservation.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: "No tienes acceso a esta reservación" });
            }
            if (currentReservation.status !== 'PENDIENTE') {
                return res.status(400).json({ success: false, message: "Solo puedes modificar reservaciones PENDIENTES" });
            }
        }
        
        delete req.body.userId;
        delete req.body.userInfo;

        const updatedReservation = await Reservation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
            .populate('restaurant', 'name address')
            .populate('table', 'number capacity');

        res.status(200).json({ success: true, message: "Reservación actualizada exitosamente", data: updatedReservation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al actualizar reservación", error: error.message });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservación no encontrada" });
        }

        if (req.user.role === 'CLIENTE' && reservation.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "No tienes acceso a esta reservación" });
        }

        await Reservation.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Reservación eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al eliminar reservación", error: error.message });
    }
};