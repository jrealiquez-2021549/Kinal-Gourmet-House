import Event from './event.model.js';
import mongoose from 'mongoose';

export const createEvent = async (req, res) => {
    try {
        const eventData = req.body;

        // Procesar additionalServices si viene como string
        if (typeof eventData.additionalServices === 'string') {
            eventData.additionalServices = eventData.additionalServices
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }

        const event = new Event(eventData);
        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('restaurant', 'name address phone')
            .populate('specialMenu', 'name description');

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: populatedEvent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el evento',
            error: error.message
        });
    }
};

export const getEvents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive, 
            status, 
            restaurant,
            upcoming,
            past 
        } = req.query;
        
        const filter = {};
        
        // Filtros básicos
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (status) filter.status = status;
        if (restaurant) filter.restaurant = restaurant;
        
        // Filtro para eventos próximos (próximos 30 días)
        if (upcoming === 'true') {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            filter.date = { $gte: now, $lte: thirtyDaysFromNow };
            filter.isActive = true;
        }
        
        // Filtro para eventos pasados
        if (past === 'true') {
            filter.date = { $lt: new Date() };
        }

        const events = await Event.find(filter)
            .populate('restaurant', 'name address phone email')
            .populate('specialMenu', 'name description price')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: 1 }); // Ordenar por fecha ascendente

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
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
            message: 'Error al obtener los eventos',
            error: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const event = await Event.findById(id)
            .populate('restaurant', 'name address phone email category')
            .populate('specialMenu', 'name description price dishType');
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el evento",
            error: error.message,
        });
    }
};

export const getEventsByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { page = 1, limit = 10, status, upcoming } = req.query;
        
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "ID de restaurante inválido",
            });
        }

        const filter = { restaurant: restaurantId, isActive: true };
        
        if (status) filter.status = status;
        
        if (upcoming === 'true') {
            filter.date = { $gte: new Date() };
        }

        const events = await Event.find(filter)
            .populate('specialMenu', 'name description price')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: 1 });

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
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
            message: "Error al obtener eventos del restaurante",
            error: error.message,
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentEvent = await Event.findById(id);
        
        if (!currentEvent) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado",
            });
        }

        const updateData = { ...req.body };

        // Procesar additionalServices si viene como string
        if (typeof updateData.additionalServices === 'string') {
            updateData.additionalServices = updateData.additionalServices
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        )
        .populate('restaurant', 'name address phone')
        .populate('specialMenu', 'name description price');

        res.status(200).json({
            success: true,
            message: "Evento actualizado exitosamente",
            data: updatedEvent,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar evento",
            error: error.message,
        });
    }
};

export const updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado"
            });
        }

        event.status = status;
        await event.save();

        const populatedEvent = await Event.findById(id)
            .populate('restaurant', 'name')
            .populate('specialMenu', 'name');

        res.status(200).json({
            success: true,
            message: "Estado del evento actualizado correctamente",
            data: populatedEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar estado del evento",
            error: error.message
        });
    }
};

export const cancelEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado"
            });
        }

        event.status = 'CANCELADO';
        event.isActive = false;
        await event.save();

        res.status(200).json({
            success: true,
            message: "Evento cancelado correctamente",
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al cancelar evento",
            error: error.message
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado",
            });
        }

        await Event.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Evento eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar evento",
            error: error.message,
        });
    }
};