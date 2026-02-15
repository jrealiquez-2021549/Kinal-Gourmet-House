import { Router } from "express";
import { createUser, getUsers,getUserById,updateUser,deleteUser } from "./user.controller.js";
import { uploadUserImages } from "../../middlewares/files-uploaders.js";

const router = Router();

router.post(
    '/create',
    uploadUserImages.single('profileImage'),
    createUser
);

router.get(
    '/', 
    getUsers);

router.get(
    '/:id', 
    getUserById);

router.put(
    '/:id',
    uploadUserImages.single('profileImage'),
    updateUser
);

router.delete(
    '/:id', 
    deleteUser);

export default router;