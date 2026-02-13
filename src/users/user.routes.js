import { Router } from "express";
import { createUser, getUsers } from "./user.controller.js";
import {cleanUploaderFile} from '../../middlewares/delete-files-on-error.js'
import {uploadUserImages} from '../../middlewares/files-uploaders.js'

const router = Router();

router.post(
    '/create',
    uploadUserImages.single('profileImage'),
    cleanUploaderFile,
    createUser
)

router.get(
    '/',
    getUsers
)

export default router;