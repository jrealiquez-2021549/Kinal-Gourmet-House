import { Router } from "express";
import { createDish, getDishes,getDishById,updateDish,deleteDish } from "./dish.controller.js";
import { uploadDishImages } from "../../middlewares/files-uploaders.js";

const router = Router();

router.post(
    '/create',
    uploadDishImages.single('image'),
    createDish
);

router.get(
    '/', 
    getDishes);

router.get(
    '/:id', 
    getDishById);

router.put(
    '/:id',
    uploadDishImages.single('image'),
    updateDish
);

router.delete(
    '/:id', 
    deleteDish);

export default router;