import Reservation from './reservation.model.js'

export const createReservation = async(req,res) =>{
    try {
        const reservationData = req.body;
        
        const reservation = new Reservation(reservationData);

        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservation
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        })
    }
}

export const getReservations = async(req,res)=>{
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const reservations = await Reservation.find(filter)
            //aqui se jalan los datos de las entidades con las cuales esta relacionada
            .populate('user', 'name')
            .populate('restaurant', 'name')
            .populate('table', 'number capacity')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Reservation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reservations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las Reservaciones',
            error: error.message
        })
    }
}