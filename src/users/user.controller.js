import User from './user.model.js';
import mongoose from 'mongoose';
import { cloudinary } from '../../middlewares/files-uploaders.js';

export const createUser = async (req, res) => {
    try {
        const userData = req.body;

        if (req.file) {
            userData.profileImage = req.file.path;
            userData.profileImage_public_id = req.file.filename;
        }

        const user = new User(userData);
        await user.save();

        // No retornar la contraseña
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: userResponse
        });
    } catch (error) {
        // Si hay error y se subió imagen, eliminarla de Cloudinary
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err => 
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true, role } = req.query;
        
        const filter = { isActive };
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select('-password') // Excluir contraseña
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
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
            message: 'Error al obtener los usuarios',
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentUser = await User.findById(id);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        const updateData = { ...req.body };

        // Si se envía nueva imagen de perfil
        if (req.file) {
            // Eliminar imagen anterior de Cloudinary si existe
            if (currentUser.profileImage_public_id) {
                await cloudinary.uploader.destroy(
                    currentUser.profileImage_public_id
                ).catch(err => console.error('Error al eliminar imagen anterior:', err));
            }
            
            updateData.profileImage = req.file.path;
            updateData.profileImage_public_id = req.file.filename;
        }

        // Si se está actualizando la contraseña, dejar que el middleware pre-save la encripte
        // Si no se está actualizando, removerla del updateData para evitar problemas
        if (!updateData.password) {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Usuario actualizado exitosamente",
            data: updatedUser,
        });
    } catch (error) {
        // Si hay error y se subió nueva imagen, eliminarla
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(err =>
                console.error('Error al eliminar imagen:', err)
            );
        }

        res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Eliminar imagen de perfil de Cloudinary si existe
        if (user.profileImage_public_id) {
            await cloudinary.uploader.destroy(user.profileImage_public_id)
                .catch(err => console.error('Error al eliminar imagen:', err));
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Usuario eliminado exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar usuario",
            error: error.message,
        });
    }
};