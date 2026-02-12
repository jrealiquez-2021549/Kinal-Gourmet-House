import { Router } from "express";
import {
    createRestaurant,
    getRestaurants,
    //updateRestaurant,
    //deleteRestaurant
} from "./restaurant.controller.js";

const router = Router();

router.post('/create', createRestaurant);
router.get('/', getRestaurants);
//router.put('/update/:id', updateRestaurant);
//router.delete('/delete/:id', deleteRestaurant);

export default router;
