import { Router } from "express";
import { createUser, getUsers } from "./user.controller.js";
import {cleanUploaderFile} from '../../middlewares/delete-files-on-error.js'
import {createCloudinary} from '../../middlewares/files-uploaders.js'

const router = Router();

router.post(
    '/create',
    createCloudinary.single('profileImage'),
    cleanUploaderFile,
    createUser
)

router.get(
    '/',
    getUsers
)

export default router;