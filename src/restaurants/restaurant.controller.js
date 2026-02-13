import Restaurant from './restaurant.model.js';


export const createRestaurant = async (req, res) => {
    try {
        const restaurantData = req.body;

        if (req.files && req.files.length > 0) {
            //Se mapean todas las imagenes al arreglo llamado images
            restaurantData.images = req.files.map(file => file.path);
        }
        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();

        res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente',
            data: restaurant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante',
            error: error.message
        });
    }
};

// READ (con paginación y filtro por isActive)
export const getRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const restaurants = await Restaurant.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
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

/*UPDATE
export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restaurante actualizado correctamente',
            data: updatedRestaurant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el restaurante',
            error: error.message
        });
    }
};*/

/* DELETE lógico (cambiar isActive a false)
export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restaurante desactivado correctamente',
            data: restaurant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al desactivar el restaurante',
            error: error.message
        });
        
    }
};*/
