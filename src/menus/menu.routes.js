import { Router } from "express";
import { createMenu, deleteMenu, getMenus, getMenuById, updateMenu } from "./menu.controller.js";

const router = Router();

router.post(
    '/create',
    createMenu
)

router.get(
    '/',
    getMenus
)

router.get(
    '/:id', 
    getMenuById);

router.put(
    '/:id', 
    updateMenu);

router.delete(
    '/:id', 
    deleteMenu);

export default router;