import { Router } from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "./user.controller.js";
import { uploadUserImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// 🔒 Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo PLATFORM_ADMIN gestiona usuarios en MongoDB (son espejo del AuthAPI)
router.post('/create', isPlatformAdmin, uploadUserImages.single('profileImage'), createUser);
router.get('/', isPlatformAdmin, getUsers);
router.get('/:id', getUserById); // Cualquier usuario puede ver perfil (ajustar si es necesario)
router.put('/:id', uploadUserImages.single('profileImage'), updateUser); // controller debe validar que sea suyo
router.delete('/:id', isPlatformAdmin, deleteUser);

export default router;
