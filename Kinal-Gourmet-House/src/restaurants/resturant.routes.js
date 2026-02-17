import { Router } from "express";
import { createRestaurant, getRestaurants, getRestaurantById,updateRestaurant, deleteRestaurant } from "./restaurant.controller.js";
import { uploadRestaurantImages } from "../../middlewares/files-uploaders.js";

const router = Router();

router.post(
    '/create', 
    uploadRestaurantImages.single('image'),
    createRestaurant
);

router.get(
    '/', 
    getRestaurants);

router.get(
    '/:id', 
    getRestaurantById);

router.put(
    '/:id',
    uploadRestaurantImages.single('image'),
    updateRestaurant
);

router.delete(
    '/:id', 
    deleteRestaurant);

export default router;