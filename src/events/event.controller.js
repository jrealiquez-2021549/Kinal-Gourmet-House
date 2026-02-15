'use strict';

import Event from './event.model.js';

// Crear Evento
export const createEvent = async (req, res) => {
    try {
        const data = req.body;
        const event = new Event(data);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            event
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Listar Eventos
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('restaurant', 'name address');
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Eliminar Evento (Solicitado)
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventDeleted = await Event.findByIdAndDelete(id);

        if (!eventDeleted) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Evento eliminado permanentemente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};