import { Router } from "express";
import { createUser, getUsers } from "./user.controller.js";

const router = Router();

router.post(
    '/create',
    createUser
)

router.get(
    '/',
    getUsers
)

export default router;