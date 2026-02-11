import User from './user.model.js';

export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        /* if(req.file){
            const extension = req.file.path.split('.').pop();
            const filename = req.file.filename;
            const relativePath = filename.substring(filename.indexOf('users/'));

            userData.photo = `${relativePath}.${extension}`;
        } else {
            userData.photo = 'users/kinal_gourmet_house_nyvxo5';
        }*/

        const user = new User(userData);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Campo creado exitosamente',
            data: user
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el campo',
            error: error.message
        })
    }
}

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const users = await User.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
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
            message: 'Error al obtener los campos',
            error: error.message
        })
    }
}