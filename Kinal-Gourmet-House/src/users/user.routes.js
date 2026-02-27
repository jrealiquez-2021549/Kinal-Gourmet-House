import { Router } from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "./user.controller.js";
import { uploadUserImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post('/create', isPlatformAdmin, uploadUserImages.single('profileImage'), createUser);

router.get('/', isPlatformAdmin, getUsers);

router.get('/:id', getUserById);

router.put('/:id', uploadUserImages.single('profileImage'), updateUser);

router.delete('/:id', isPlatformAdmin, deleteUser);

export default router;
